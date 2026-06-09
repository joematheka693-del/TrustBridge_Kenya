from flask import Blueprint, g, request
from pymysql.err import OperationalError
from config.db import execute_write, fetch_all, fetch_one
from utils.auth_helpers import login_required, roles_required
from utils.response_helpers import error_response, success_response
from utils.trust_score_helpers import create_trust_event_safe

applications_bp = Blueprint('application_routes', __name__)

APPLICATION_COLUMNS = """
    a.application_id,
    a.type,
    a.source_id,
    a.source_title,
    a.applicant_user_id,
    a.applicant_name,
    a.applicant_email,
    a.owner_user_id,
    a.owner_name,
    a.owner_email,
    a.message,
    a.budget,
    a.timeline,
    a.status,
    a.created_at,
    a.updated_at
"""

VALID_TYPES = {'job-application', 'talent-invite'}
VALID_STATUSES = {'pending', 'shortlisted', 'rejected', 'accepted'}


def current_user_id():
    return g.current_user.get('user_id') or g.current_user.get('id')


def current_user_email():
    return g.current_user.get('email')


def current_user_name():
    return g.current_user.get('name') or 'TrustBridge User'


def serialize_application(application):
    return {
        'id': application.get('application_id'),
        'application_id': application.get('application_id'),
        'type': application.get('type'),
        'source_id': application.get('source_id'),
        'sourceId': application.get('source_id'),
        'source_title': application.get('source_title'),
        'sourceTitle': application.get('source_title'),
        'applicant_user_id': application.get('applicant_user_id'),
        'applicant_name': application.get('applicant_name'),
        'applicantName': application.get('applicant_name'),
        'applicant_email': application.get('applicant_email'),
        'applicantEmail': application.get('applicant_email'),
        'owner_user_id': application.get('owner_user_id'),
        'owner_name': application.get('owner_name'),
        'ownerName': application.get('owner_name'),
        'owner_email': application.get('owner_email'),
        'ownerEmail': application.get('owner_email'),
        'message': application.get('message'),
        'budget': application.get('budget'),
        'timeline': application.get('timeline'),
        'status': application.get('status'),
        'created_at': str(application.get('created_at')) if application.get('created_at') else None,
        'createdAt': str(application.get('created_at')) if application.get('created_at') else None,
        'updated_at': str(application.get('updated_at')) if application.get('updated_at') else None,
    }


def find_application(application_id):
    return fetch_one(
        f"""
        SELECT {APPLICATION_COLUMNS}
        FROM applications a
        WHERE a.application_id = %s
        LIMIT 1
        """,
        (application_id,),
    )


def get_job_source(source_id):
    if not source_id:
        return None
    return fetch_one(
        """
        SELECT j.job_id, j.title, j.owner_id, u.name AS owner_name, u.email AS owner_email
        FROM jobs j
        LEFT JOIN users u ON u.user_id = j.owner_id
        WHERE j.job_id = %s
        LIMIT 1
        """,
        (source_id,),
    )


def get_talent_source(source_id):
    if not source_id:
        return None
    return fetch_one(
        """
        SELECT tp.profile_id, tp.name, tp.user_id, tp.email, u.name AS owner_name, u.email AS owner_email
        FROM talent_profiles tp
        LEFT JOIN users u ON u.user_id = tp.user_id
        WHERE tp.profile_id = %s
        LIMIT 1
        """,
        (source_id,),
    )


def can_view_application(application):
    role = g.current_user.get('role')
    user_id = int(current_user_id())
    if role == 'admin':
        return True
    return user_id in {
        int(application.get('applicant_user_id') or 0),
        int(application.get('owner_user_id') or 0),
    }


def can_delete_application(application):
    role = g.current_user.get('role')
    user_id = int(current_user_id())
    return role == 'admin' or user_id == int(application.get('applicant_user_id') or 0)


def can_update_status(application):
    role = g.current_user.get('role')
    user_id = int(current_user_id())
    if role == 'admin':
        return True
    if role == 'client' and user_id == int(application.get('owner_user_id') or 0):
        return True
    return False


def read_application_payload():
    payload = request.get_json(silent=True) or {}
    application_type = str(payload.get('type') or payload.get('applicationType') or '').strip()
    source_id = payload.get('source_id') or payload.get('sourceId')
    source_title = str(payload.get('source_title') or payload.get('sourceTitle') or '').strip()
    applicant_name = str(payload.get('applicant_name') or payload.get('applicantName') or current_user_name()).strip()
    applicant_email = str(payload.get('applicant_email') or payload.get('applicantEmail') or current_user_email()).strip()
    owner_name = str(payload.get('owner_name') or payload.get('ownerName') or '').strip()
    owner_email = str(payload.get('owner_email') or payload.get('ownerEmail') or '').strip()
    message = str(payload.get('message') or '').strip()
    budget = str(payload.get('budget') or '').strip()
    timeline = str(payload.get('timeline') or '').strip()

    if application_type not in VALID_TYPES:
        return None, error_response('Application type must be job-application or talent-invite.', 400)
    if not message:
        return None, error_response('Application message is required.', 400)
    if not applicant_name:
        return None, error_response('Applicant name is required.', 400)
    if not applicant_email:
        return None, error_response('Applicant email is required.', 400)

    try:
        source_id = int(source_id) if source_id else None
    except (TypeError, ValueError):
        source_id = None

    return {
        'type': application_type,
        'source_id': source_id,
        'source_title': source_title,
        'applicant_name': applicant_name[:120],
        'applicant_email': applicant_email[:160],
        'owner_name': owner_name[:120],
        'owner_email': owner_email[:160],
        'message': message,
        'budget': budget[:80],
        'timeline': timeline[:80],
    }, None


@applications_bp.get('')
@applications_bp.get('/')
@login_required
def list_applications():
    query = str(request.args.get('q', '')).strip()
    application_type = str(request.args.get('type', 'all')).strip()
    status = str(request.args.get('status', 'all')).strip()
    role = g.current_user.get('role')
    user_id = current_user_id()

    where_clauses = []
    params = []

    if role != 'admin':
        where_clauses.append('(a.applicant_user_id = %s OR a.owner_user_id = %s)')
        params.extend([user_id, user_id])

    if application_type and application_type != 'all':
        where_clauses.append('a.type = %s')
        params.append(application_type)

    if status and status != 'all':
        where_clauses.append('a.status = %s')
        params.append(status)

    if query:
        where_clauses.append('(a.source_title LIKE %s OR a.applicant_name LIKE %s OR a.owner_name LIKE %s OR a.message LIKE %s)')
        search_value = f'%{query}%'
        params.extend([search_value, search_value, search_value, search_value])

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ''

    try:
        applications = fetch_all(
            f"""
            SELECT {APPLICATION_COLUMNS}
            FROM applications a
            {where_sql}
            ORDER BY a.created_at DESC
            """,
            tuple(params),
        )
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the applications table exists.', 503)

    return success_response(
        message='Applications and invites loaded successfully.',
        data={'applications': [serialize_application(item) for item in applications]},
    )


@applications_bp.get('/<int:application_id>')
@login_required
def get_application(application_id):
    try:
        application = find_application(application_id)
        if payload['type'] == 'job-application':
            create_trust_event_safe(
                user_id=applicant_user_id,
                event_type='application_submitted',
                reason=f"Application submitted for: {payload['source_title']}",
                created_by=applicant_user_id,
                source_type='application',
                source_id=application_id,
            )
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the applications table exists.', 503)

    if not application:
        return error_response('Application record not found.', 404)

    if not can_view_application(application):
        return error_response('You can only view your own application or invite records.', 403)

    return success_response(
        message='Application record loaded successfully.',
        data={'application': serialize_application(application)},
    )


@applications_bp.post('')
@applications_bp.post('/')
@login_required
def create_application():
    payload, validation_error = read_application_payload()
    if validation_error:
        return validation_error

    role = g.current_user.get('role')
    user_id = current_user_id()

    if payload['type'] == 'job-application' and role not in {'member', 'freelancer', 'admin'}:
        return error_response('Only members, freelancers, and admins can submit job applications.', 403)

    if payload['type'] == 'talent-invite' and role not in {'client', 'admin'}:
        return error_response('Only clients and admins can create talent invites.', 403)

    applicant_user_id = user_id
    owner_user_id = None

    try:
        if payload['type'] == 'job-application':
            job = get_job_source(payload['source_id'])
            if job:
                payload['source_title'] = payload['source_title'] or job['title']
                payload['owner_name'] = payload['owner_name'] or job.get('owner_name') or 'Client'
                payload['owner_email'] = payload['owner_email'] or job.get('owner_email') or ''
                owner_user_id = job.get('owner_id')
            if not payload['source_title']:
                return error_response('Source title is required when the job could not be found.', 400)

        if payload['type'] == 'talent-invite':
            profile = get_talent_source(payload['source_id'])
            if profile:
                payload['source_title'] = payload['source_title'] or profile['name']
                payload['owner_name'] = payload['owner_name'] or profile.get('owner_name') or profile.get('name')
                payload['owner_email'] = payload['owner_email'] or profile.get('owner_email') or profile.get('email') or ''
                owner_user_id = profile.get('user_id')
            if not payload['source_title']:
                return error_response('Source title is required when the talent profile could not be found.', 400)

        application_id, _ = execute_write(
            """
            INSERT INTO applications
              (type, source_id, source_title, applicant_user_id, applicant_name, applicant_email, owner_user_id, owner_name, owner_email, message, budget, timeline, status)
            VALUES
              (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 'pending')
            """,
            (
                payload['type'],
                payload['source_id'],
                payload['source_title'],
                applicant_user_id,
                payload['applicant_name'],
                payload['applicant_email'],
                owner_user_id,
                payload['owner_name'],
                payload['owner_email'],
                payload['message'],
                payload['budget'],
                payload['timeline'],
            ),
        )
        application = find_application(application_id)
    except OperationalError:
        return error_response('Database connection failed while creating the application record.', 503)

    return success_response(
        message='Application record created successfully.',
        data={'application': serialize_application(application)},
        status_code=201,
    )


@applications_bp.patch('/<int:application_id>/status')
@login_required
def update_application_status(application_id):
    payload = request.get_json(silent=True) or {}
    status = str(payload.get('status', '')).strip()

    if status not in VALID_STATUSES:
        return error_response('Invalid application status.', 400)

    try:
        application = find_application(application_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the applications table exists.', 503)

    if not application:
        return error_response('Application record not found.', 404)

    if not can_update_status(application):
        return error_response('Only the owning client or an admin can update this application status.', 403)

    try:
        execute_write('UPDATE applications SET status = %s WHERE application_id = %s', (status, application_id))
        updated_application = find_application(application_id)
    except OperationalError:
        return error_response('Database connection failed while updating application status.', 503)

    return success_response(
        message='Application status updated successfully.',
        data={'application': serialize_application(updated_application)},
    )


@applications_bp.delete('/<int:application_id>')
@login_required
def delete_application(application_id):
    try:
        application = find_application(application_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the applications table exists.', 503)

    if not application:
        return error_response('Application record not found.', 404)

    if not can_delete_application(application):
        return error_response('Only the sender or an admin can delete this application record.', 403)

    try:
        execute_write('DELETE FROM applications WHERE application_id = %s', (application_id,))
    except OperationalError:
        return error_response('Database connection failed while deleting application record.', 503)

    return success_response(
        message='Application record deleted successfully.',
        data={'deleted_application_id': application_id},
    )
