from flask import Blueprint, g, request
from pymysql.err import OperationalError

from config.db import execute_write, fetch_all, fetch_one
from utils.auth_helpers import roles_required
from utils.response_helpers import error_response, success_response
from utils.role_helpers import VALID_ROLES, normalize_role
from utils.trust_score_helpers import create_trust_event_safe, get_score_for_user

admin_bp = Blueprint('admin_routes', __name__)

USER_COLUMNS = """
    u.user_id,
    u.name,
    u.email,
    u.role,
    u.status,
    u.created_at,
    u.updated_at,
    COALESCE(t.profile_id, 0) AS profile_id,
    COALESCE(t.category, '') AS talent_category,
    COALESCE(t.completed_jobs, 0) AS completed_jobs,
    COUNT(DISTINCT j.job_id) AS jobs_count,
    COUNT(DISTINCT a.application_id) AS application_count,
    COUNT(DISTINCT vr.request_id) AS verification_count
"""

VALID_USER_STATUSES = {'active', 'review', 'suspended'}
VALID_JOB_STATUSES = {'open', 'paused', 'closed', 'under_review'}


def current_user_id():
    return int(g.current_user.get('user_id') or g.current_user.get('id'))


def serialize_user(user):
    score, _event_total = get_score_for_user(user.get('user_id'))
    flags = 0
    if user.get('status') == 'review':
        flags += 1
    if user.get('status') == 'suspended':
        flags += 2

    return {
        'id': user.get('user_id'),
        'user_id': user.get('user_id'),
        'name': user.get('name'),
        'email': user.get('email'),
        'role': user.get('role'),
        'status': user.get('status'),
        'trustScore': score,
        'trust_score': score,
        'flags': flags,
        'profile_id': user.get('profile_id') or None,
        'talent_category': user.get('talent_category'),
        'completed_jobs': user.get('completed_jobs'),
        'jobs_count': user.get('jobs_count'),
        'application_count': user.get('application_count'),
        'verification_count': user.get('verification_count'),
        'lastActive': str(user.get('updated_at')) if user.get('updated_at') else '',
        'created_at': str(user.get('created_at')) if user.get('created_at') else None,
        'updated_at': str(user.get('updated_at')) if user.get('updated_at') else None,
    }


def count_table(table_name):
    row = fetch_one(f'SELECT COUNT(*) AS total FROM {table_name}')
    return int(row.get('total') or 0)


def admin_count():
    row = fetch_one("SELECT COUNT(*) AS total FROM users WHERE role = 'admin'")
    return int(row.get('total') or 0)


def get_user_for_admin(user_id):
    return fetch_one(
        f"""
        SELECT {USER_COLUMNS}
        FROM users u
        LEFT JOIN talent_profiles t ON t.user_id = u.user_id
        LEFT JOIN jobs j ON j.owner_id = u.user_id
        LEFT JOIN applications a ON a.applicant_user_id = u.user_id OR a.owner_user_id = u.user_id
        LEFT JOIN verification_requests vr ON vr.user_id = u.user_id
        WHERE u.user_id = %s
        GROUP BY u.user_id, t.profile_id
        LIMIT 1
        """,
        (user_id,),
    )


@admin_bp.get('')
@admin_bp.get('/')
@roles_required('admin')
def admin_index():
    return success_response(
        message='Admin route group is active.',
        data={
            'resource': 'Admin',
            'available_methods': [
                'GET /api/admin/overview',
                'GET /api/admin/users',
                'GET /api/admin/activity',
                'PATCH /api/admin/users/<user_id>/role',
                'PATCH /api/admin/users/<user_id>/status',
                'DELETE /api/admin/users/<user_id>',
                'PATCH /api/admin/jobs/<job_id>/status',
                'POST /api/admin/trust-events',
            ],
            'implementation_status': 'phase-2.7-admin-ready',
        },
    )


@admin_bp.get('/overview')
@roles_required('admin')
def get_admin_overview():
    try:
        totals = {
            'users': count_table('users'),
            'jobs': count_table('jobs'),
            'talent_profiles': count_table('talent_profiles'),
            'applications': count_table('applications'),
            'verification_requests': count_table('verification_requests'),
            'trust_score_events': count_table('trust_score_events'),
        }
        role_rows = fetch_all('SELECT role, COUNT(*) AS total FROM users GROUP BY role ORDER BY role')
        job_rows = fetch_all('SELECT status, COUNT(*) AS total FROM jobs GROUP BY status ORDER BY status')
        verification_rows = fetch_all('SELECT status, COUNT(*) AS total FROM verification_requests GROUP BY status ORDER BY status')
        application_rows = fetch_all('SELECT status, COUNT(*) AS total FROM applications GROUP BY status ORDER BY status')
    except OperationalError:
        return error_response('Database connection failed while loading admin overview.', 503)

    return success_response(
        message='Admin overview loaded successfully.',
        data={
            'totals': totals,
            'roles': {row['role']: row['total'] for row in role_rows},
            'jobs_by_status': {row['status']: row['total'] for row in job_rows},
            'verification_by_status': {row['status']: row['total'] for row in verification_rows},
            'applications_by_status': {row['status']: row['total'] for row in application_rows},
        },
    )


@admin_bp.get('/users')
@roles_required('admin')
def get_admin_users():
    role = str(request.args.get('role', 'all')).strip().lower()
    status = str(request.args.get('status', 'all')).strip().lower()

    clauses = []
    params = []
    if role != 'all':
        role = normalize_role(role)
        clauses.append('u.role = %s')
        params.append(role)
    if status != 'all':
        if status not in VALID_USER_STATUSES:
            return error_response('Invalid user status filter.', 400)
        clauses.append('u.status = %s')
        params.append(status)

    where_sql = f"WHERE {' AND '.join(clauses)}" if clauses else ''

    try:
        rows = fetch_all(
            f"""
            SELECT {USER_COLUMNS}
            FROM users u
            LEFT JOIN talent_profiles t ON t.user_id = u.user_id
            LEFT JOIN jobs j ON j.owner_id = u.user_id
            LEFT JOIN applications a ON a.applicant_user_id = u.user_id OR a.owner_user_id = u.user_id
            LEFT JOIN verification_requests vr ON vr.user_id = u.user_id
            {where_sql}
            GROUP BY u.user_id, t.profile_id
            ORDER BY u.created_at DESC
            """,
            tuple(params),
        )
    except OperationalError:
        return error_response('Database connection failed while loading users.', 503)

    return success_response(
        message='Admin users loaded successfully.',
        data={'users': [serialize_user(row) for row in rows]},
    )


@admin_bp.patch('/users/<int:user_id>/role')
@roles_required('admin')
def update_user_role(user_id):
    payload = request.get_json(silent=True) or {}
    next_role = normalize_role(payload.get('role'))

    try:
        target = fetch_one('SELECT user_id, role, email FROM users WHERE user_id = %s LIMIT 1', (user_id,))
        if not target:
            return error_response('User not found.', 404)
        if target.get('role') == 'admin' and next_role != 'admin' and admin_count() <= 1:
            return error_response('You cannot demote the last admin account.', 400)
        execute_write('UPDATE users SET role = %s WHERE user_id = %s', (next_role, user_id))
        updated_user = get_user_for_admin(user_id)
    except OperationalError:
        return error_response('Database connection failed while updating user role.', 503)

    return success_response(
        message='User role updated successfully.',
        data={'user': serialize_user(updated_user)},
    )


@admin_bp.patch('/users/<int:user_id>/status')
@roles_required('admin')
def update_user_status(user_id):
    payload = request.get_json(silent=True) or {}
    next_status = str(payload.get('status', '')).strip().lower()
    if next_status not in VALID_USER_STATUSES:
        return error_response('Invalid user status. Use active, review, or suspended.', 400)

    try:
        target = fetch_one('SELECT user_id, role FROM users WHERE user_id = %s LIMIT 1', (user_id,))
        if not target:
            return error_response('User not found.', 404)
        if target.get('role') == 'admin' and next_status == 'suspended' and int(user_id) == current_user_id():
            return error_response('You cannot suspend your own admin account.', 400)
        execute_write('UPDATE users SET status = %s WHERE user_id = %s', (next_status, user_id))
        updated_user = get_user_for_admin(user_id)
    except OperationalError:
        return error_response('Database connection failed while updating user status.', 503)

    return success_response(
        message='User status updated successfully.',
        data={'user': serialize_user(updated_user)},
    )


@admin_bp.delete('/users/<int:user_id>')
@roles_required('admin')
def delete_user(user_id):
    if int(user_id) == current_user_id():
        return error_response('You cannot delete your own admin account from this endpoint.', 400)

    try:
        target = fetch_one('SELECT user_id, role FROM users WHERE user_id = %s LIMIT 1', (user_id,))
        if not target:
            return error_response('User not found.', 404)
        if target.get('role') == 'admin' and admin_count() <= 1:
            return error_response('You cannot delete the last admin account.', 400)
        execute_write('DELETE FROM users WHERE user_id = %s', (user_id,))
    except OperationalError:
        return error_response('Database connection failed while deleting user.', 503)

    return success_response(
        message='User deleted successfully.',
        data={'deleted_user_id': user_id},
    )


@admin_bp.patch('/jobs/<int:job_id>/status')
@roles_required('admin')
def update_job_status(job_id):
    payload = request.get_json(silent=True) or {}
    status = str(payload.get('status', '')).strip().lower()
    if status == 'approved':
        status = 'open'
    if status in {'review', 'pending'}:
        status = 'under_review'
    if status == 'rejected':
        status = 'closed'
    if status not in VALID_JOB_STATUSES:
        return error_response('Invalid job status. Use open, paused, closed, or under_review.', 400)

    try:
        job = fetch_one('SELECT job_id, owner_id, title FROM jobs WHERE job_id = %s LIMIT 1', (job_id,))
        if not job:
            return error_response('Job not found.', 404)
        execute_write('UPDATE jobs SET status = %s WHERE job_id = %s', (status, job_id))
        updated_job = fetch_one('SELECT job_id, owner_id, title, status, updated_at FROM jobs WHERE job_id = %s LIMIT 1', (job_id,))
    except OperationalError:
        return error_response('Database connection failed while updating job status.', 503)

    return success_response(
        message='Job status updated successfully.',
        data={
            'job': {
                'id': updated_job.get('job_id'),
                'job_id': updated_job.get('job_id'),
                'owner_id': updated_job.get('owner_id'),
                'title': updated_job.get('title'),
                'status': updated_job.get('status'),
                'updated_at': str(updated_job.get('updated_at')) if updated_job.get('updated_at') else None,
            }
        },
    )


@admin_bp.post('/trust-events')
@roles_required('admin')
def create_admin_trust_event():
    payload = request.get_json(silent=True) or {}
    user_id = payload.get('user_id') or payload.get('userId')
    points = payload.get('points', 0)
    reason = str(payload.get('reason', '')).strip()

    if not user_id:
        return error_response('Target user_id is required.', 400)
    try:
        points = int(points)
    except (TypeError, ValueError):
        return error_response('Points must be a number.', 400)
    if not reason:
        return error_response('Reason is required.', 400)

    try:
        target = fetch_one('SELECT user_id FROM users WHERE user_id = %s LIMIT 1', (user_id,))
        if not target:
            return error_response('Target user not found.', 404)
        event_id = create_trust_event_safe(
            user_id=user_id,
            event_type='manual_admin_event',
            points=points,
            reason=reason,
            created_by=current_user_id(),
            source_type='admin',
            source_id=current_user_id(),
        )
        score, event_total = get_score_for_user(user_id)
    except OperationalError:
        return error_response('Database connection failed while creating trust event.', 503)

    return success_response(
        message='Manual admin trust event created successfully.',
        data={'event_id': event_id, 'score': {'user_id': int(user_id), 'score': score, 'event_total': event_total}},
        status_code=201,
    )


@admin_bp.get('/activity')
@roles_required('admin')
def get_admin_activity():
    try:
        activities = []
        jobs = fetch_all(
            """
            SELECT j.job_id AS id, j.title, j.status, j.created_at, u.name AS actor
            FROM jobs j
            LEFT JOIN users u ON u.user_id = j.owner_id
            ORDER BY j.created_at DESC
            LIMIT 8
            """
        )
        for row in jobs:
            activities.append({
                'id': f"job-{row['id']}",
                'type': 'job',
                'target': row.get('title'),
                'detail': f"Job status is {row.get('status')}.",
                'actor': row.get('actor') or 'Unknown client',
                'severity': 'medium' if row.get('status') == 'under_review' else 'low',
                'time': str(row.get('created_at')),
            })

        verifications = fetch_all(
            """
            SELECT request_id AS id, full_name, evidence_type, status, created_at
            FROM verification_requests
            ORDER BY created_at DESC
            LIMIT 8
            """
        )
        for row in verifications:
            activities.append({
                'id': f"verification-{row['id']}",
                'type': 'verification',
                'target': row.get('full_name'),
                'detail': f"{row.get('evidence_type')} is {row.get('status')}.",
                'actor': 'Verification center',
                'severity': 'high' if row.get('status') in {'rejected', 'more_evidence_needed'} else 'medium',
                'time': str(row.get('created_at')),
            })

        trust_events = fetch_all(
            """
            SELECT e.event_id AS id, e.event_type, e.points, e.reason, e.created_at, u.name AS target_name
            FROM trust_score_events e
            LEFT JOIN users u ON u.user_id = e.user_id
            ORDER BY e.created_at DESC
            LIMIT 8
            """
        )
        for row in trust_events:
            activities.append({
                'id': f"trust-{row['id']}",
                'type': 'trust',
                'target': row.get('target_name') or 'Trust score user',
                'detail': f"{row.get('event_type')} event worth {row.get('points')} points. {row.get('reason')}",
                'actor': 'Trust score engine',
                'severity': 'high' if int(row.get('points') or 0) < 0 else 'low',
                'time': str(row.get('created_at')),
            })

        activities.sort(key=lambda item: item.get('time') or '', reverse=True)
    except OperationalError:
        return error_response('Database connection failed while loading admin activity.', 503)

    return success_response(
        message='Admin activity loaded successfully.',
        data={'activity': activities[:20]},
    )
