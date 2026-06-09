from flask import Blueprint, g, request
from pymysql.err import OperationalError
from config.db import execute_write, fetch_all, fetch_one
from utils.auth_helpers import login_required, roles_required
from utils.response_helpers import error_response, success_response
from utils.trust_score_helpers import create_trust_event_safe

verification_bp = Blueprint('verification_routes', __name__)

VERIFICATION_COLUMNS = """
    vr.request_id,
    vr.user_id,
    vr.full_name,
    vr.email,
    vr.role,
    vr.evidence_type,
    vr.evidence_link,
    vr.notes,
    vr.review_notes,
    vr.status,
    vr.created_at,
    vr.reviewed_at,
    vr.updated_at,
    reviewer.name AS reviewed_by_name,
    reviewer.email AS reviewed_by_email
"""

VALID_STATUSES = {'pending', 'approved', 'rejected', 'more_evidence_needed'}
VALID_EVIDENCE_TYPES = {
    'Portfolio link',
    'GitHub link',
    'Certificate link',
    'Business profile',
    'Previous work proof',
    'Identity proof',
}


def current_user_id():
    return g.current_user.get('user_id') or g.current_user.get('id')


def current_user_name():
    return g.current_user.get('name') or 'TrustBridge User'


def current_user_email():
    return g.current_user.get('email') or ''


def serialize_verification_request(item):
    created_at = item.get('created_at')
    reviewed_at = item.get('reviewed_at')
    return {
        'id': item.get('request_id'),
        'request_id': item.get('request_id'),
        'requestId': item.get('request_id'),
        'user_id': item.get('user_id'),
        'userId': item.get('user_id'),
        'full_name': item.get('full_name'),
        'fullName': item.get('full_name'),
        'email': item.get('email'),
        'role': item.get('role'),
        'evidence_type': item.get('evidence_type'),
        'evidenceType': item.get('evidence_type'),
        'evidence_link': item.get('evidence_link'),
        'evidenceLink': item.get('evidence_link'),
        'notes': item.get('notes'),
        'review_notes': item.get('review_notes') or '',
        'reviewNotes': item.get('review_notes') or '',
        'status': item.get('status'),
        'created_at': str(created_at) if created_at else None,
        'createdDate': str(created_at.date()) if hasattr(created_at, 'date') else str(created_at) if created_at else None,
        'reviewed_at': str(reviewed_at) if reviewed_at else None,
        'reviewedDate': str(reviewed_at.date()) if hasattr(reviewed_at, 'date') else str(reviewed_at) if reviewed_at else None,
        'updated_at': str(item.get('updated_at')) if item.get('updated_at') else None,
        'reviewed_by_name': item.get('reviewed_by_name'),
        'reviewedByName': item.get('reviewed_by_name'),
        'reviewed_by_email': item.get('reviewed_by_email'),
    }


def find_verification_request(request_id):
    return fetch_one(
        f"""
        SELECT {VERIFICATION_COLUMNS}
        FROM verification_requests vr
        LEFT JOIN users reviewer ON reviewer.user_id = vr.reviewed_by
        WHERE vr.request_id = %s
        LIMIT 1
        """,
        (request_id,),
    )


def can_view_request(item):
    role = g.current_user.get('role')
    if role == 'admin':
        return True
    return int(item.get('user_id') or 0) == int(current_user_id())


def can_delete_request(item):
    role = g.current_user.get('role')
    if role == 'admin':
        return True
    return item.get('status') in {'pending', 'more_evidence_needed'} and int(item.get('user_id') or 0) == int(current_user_id())


def normalize_evidence_type(value):
    evidence_type = str(value or 'Portfolio link').strip()
    return evidence_type if evidence_type in VALID_EVIDENCE_TYPES else 'Portfolio link'


def read_create_payload():
    payload = request.get_json(silent=True) or {}
    full_name = str(payload.get('full_name') or payload.get('fullName') or current_user_name()).strip()
    email = str(payload.get('email') or current_user_email()).strip().lower()
    evidence_type = normalize_evidence_type(payload.get('evidence_type') or payload.get('evidenceType'))
    evidence_link = str(payload.get('evidence_link') or payload.get('evidenceLink') or '').strip()
    notes = str(payload.get('notes') or '').strip()
    role = str(payload.get('role') or g.current_user.get('role') or 'member').strip()

    if not full_name:
        return None, error_response('Full name is required.', 400)
    if not email:
        return None, error_response('Email is required.', 400)
    if not evidence_link.startswith(('http://', 'https://')):
        return None, error_response('Evidence link must start with http:// or https://.', 400)
    if not notes:
        return None, error_response('Notes are required so admins know what to review.', 400)

    return {
        'full_name': full_name[:120],
        'email': email[:160],
        'role': role[:40],
        'evidence_type': evidence_type,
        'evidence_link': evidence_link[:255],
        'notes': notes,
    }, None


def update_matching_talent_verification(item, status):
    talent_status = None
    if status == 'approved':
        talent_status = 'verified'
    elif status == 'rejected':
        talent_status = 'rejected'
    elif status == 'more_evidence_needed':
        talent_status = 'reviewed'

    if not talent_status:
        return

    execute_write(
        """
        UPDATE talent_profiles
        SET verification = %s
        WHERE user_id = %s OR email = %s
        """,
        (talent_status, item.get('user_id'), item.get('email')),
    )


@verification_bp.get('')
@verification_bp.get('/')
@login_required
def list_verification_requests():
    query = str(request.args.get('q', '')).strip()
    status = str(request.args.get('status', 'all')).strip()
    role = g.current_user.get('role')
    user_id = current_user_id()

    where_clauses = []
    params = []

    if role != 'admin':
        where_clauses.append('vr.user_id = %s')
        params.append(user_id)

    if status and status != 'all':
        where_clauses.append('vr.status = %s')
        params.append(status)

    if query:
        where_clauses.append('(vr.full_name LIKE %s OR vr.email LIKE %s OR vr.evidence_type LIKE %s OR vr.notes LIKE %s OR vr.review_notes LIKE %s)')
        search_value = f'%{query}%'
        params.extend([search_value, search_value, search_value, search_value, search_value])

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ''

    try:
        rows = fetch_all(
            f"""
            SELECT {VERIFICATION_COLUMNS}
            FROM verification_requests vr
            LEFT JOIN users reviewer ON reviewer.user_id = vr.reviewed_by
            {where_sql}
            ORDER BY vr.created_at DESC
            """,
            tuple(params),
        )
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the verification_requests table exists.', 503)

    return success_response(
        message='Verification requests loaded successfully.',
        data={'requests': [serialize_verification_request(item) for item in rows]},
    )


@verification_bp.get('/<int:request_id>')
@login_required
def get_verification_request(request_id):
    try:
        item = find_verification_request(request_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the verification_requests table exists.', 503)

    if not item:
        return error_response('Verification request not found.', 404)

    if not can_view_request(item):
        return error_response('You can only view your own verification request unless you are an admin.', 403)

    return success_response(
        message='Verification request loaded successfully.',
        data={'request': serialize_verification_request(item)},
    )


@verification_bp.post('')
@verification_bp.post('/')
@login_required
def create_verification_request():
    payload, validation_error = read_create_payload()
    if validation_error:
        return validation_error

    try:
        request_id, _ = execute_write(
            """
            INSERT INTO verification_requests (user_id, full_name, email, role, evidence_type, evidence_link, notes, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'pending')
            """,
            (
                current_user_id(),
                payload['full_name'],
                payload['email'],
                payload['role'],
                payload['evidence_type'],
                payload['evidence_link'],
                payload['notes'],
            ),
        )
        item = find_verification_request(request_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the verification_requests table exists.', 503)

    return success_response(
        message='Verification request submitted successfully.',
        data={'request': serialize_verification_request(item)},
        status_code=201,
    )


@verification_bp.patch('/<int:request_id>/status')
@roles_required('admin')
def update_verification_status(request_id):
    payload = request.get_json(silent=True) or {}
    status = str(payload.get('status') or '').strip()
    review_notes = str(payload.get('review_notes') or payload.get('reviewNotes') or '').strip()

    if status not in VALID_STATUSES - {'pending'}:
        return error_response('Status must be approved, rejected, or more_evidence_needed.', 400)

    try:
        item = find_verification_request(request_id)
        if not item:
            return error_response('Verification request not found.', 404)

        execute_write(
            """
            UPDATE verification_requests
            SET status = %s,
                review_notes = %s,
                reviewed_by = %s,
                reviewed_at = CURRENT_TIMESTAMP
            WHERE request_id = %s
            """,
            (status, review_notes, current_user_id(), request_id),
        )

        updated = find_verification_request(request_id)
        update_matching_talent_verification(updated, status)

        event_type = None
        if status == 'approved':
            event_type = 'approved_verification'
        elif status == 'rejected':
            event_type = 'rejected_verification'
        elif status == 'more_evidence_needed':
            event_type = 'more_evidence_needed'

        if event_type:
            create_trust_event_safe(
                user_id=updated.get('user_id'),
                event_type=event_type,
                reason=review_notes or f"Verification status updated to {status}.",
                created_by=current_user_id(),
                source_type='verification_request',
                source_id=request_id,
            )
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the verification_requests table exists.', 503)

    return success_response(
        message='Verification status updated successfully.',
        data={'request': serialize_verification_request(updated)},
    )


@verification_bp.delete('/<int:request_id>')
@login_required
def delete_verification_request(request_id):
    try:
        item = find_verification_request(request_id)
        if not item:
            return error_response('Verification request not found.', 404)

        if not can_delete_request(item):
            return error_response('Only admins can delete reviewed requests. Users can delete their own pending requests.', 403)

        execute_write('DELETE FROM verification_requests WHERE request_id = %s', (request_id,))
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the verification_requests table exists.', 503)

    return success_response(message='Verification request deleted successfully.')
