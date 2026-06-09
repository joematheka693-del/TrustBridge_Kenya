from flask import Blueprint, g, request
from pymysql.err import OperationalError
from config.db import fetch_all, fetch_one
from utils.auth_helpers import login_required, roles_required
from utils.response_helpers import error_response, success_response
from utils.trust_score_helpers import (
    BASE_SCORE,
    EVENT_LABELS,
    EVENT_POINTS,
    create_trust_event,
    fetch_trust_events,
    get_score_for_user,
    serialize_trust_event,
)

trust_score_bp = Blueprint('trust_score_routes', __name__)

VALID_EVENT_TYPES = set(EVENT_POINTS.keys())


def current_user_id():
    return g.current_user.get('user_id') or g.current_user.get('id')


def serialize_score(user, score, event_total, events):
    return {
        'user': {
            'id': user.get('user_id'),
            'user_id': user.get('user_id'),
            'name': user.get('name'),
            'email': user.get('email'),
            'role': user.get('role'),
        },
        'score': score,
        'baseScore': BASE_SCORE,
        'base_score': BASE_SCORE,
        'eventTotal': event_total,
        'event_total': event_total,
        'minimum': 0,
        'maximum': 100,
        'events': [serialize_trust_event(event) for event in events],
        'rules': [
            {'eventType': event_type, 'label': EVENT_LABELS.get(event_type, event_type), 'points': points}
            for event_type, points in EVENT_POINTS.items()
        ],
    }


def find_user(user_id):
    return fetch_one(
        'SELECT user_id, name, email, role FROM users WHERE user_id = %s LIMIT 1',
        (user_id,),
    )


@trust_score_bp.get('')
@trust_score_bp.get('/')
@login_required
def get_my_trust_score():
    user_id = current_user_id()
    try:
        user = find_user(user_id)
        if not user:
            return error_response('User account not found.', 404)
        score, event_total = get_score_for_user(user_id)
        events = fetch_trust_events('WHERE tse.user_id = %s', [user_id], limit=30)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the trust_score_events table exists.', 503)

    return success_response(
        message='Trust score loaded successfully.',
        data=serialize_score(user, score, event_total, events),
    )


@trust_score_bp.get('/events')
@login_required
def list_trust_score_events():
    role = g.current_user.get('role')
    user_id = current_user_id()
    event_type = str(request.args.get('event_type') or request.args.get('eventType') or '').strip()
    target_user_id = request.args.get('user_id') or request.args.get('userId')

    where_clauses = []
    params = []

    if role != 'admin':
        where_clauses.append('tse.user_id = %s')
        params.append(user_id)
    elif target_user_id:
        where_clauses.append('tse.user_id = %s')
        params.append(target_user_id)

    if event_type and event_type != 'all':
        where_clauses.append('tse.event_type = %s')
        params.append(event_type)

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ''

    try:
        events = fetch_trust_events(where_sql, params, limit=100)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the trust_score_events table exists.', 503)

    return success_response(
        message='Trust score events loaded successfully.',
        data={'events': [serialize_trust_event(event) for event in events]},
    )


@trust_score_bp.get('/<int:user_id>')
@login_required
def get_user_trust_score(user_id):
    role = g.current_user.get('role')
    if role != 'admin' and int(user_id) != int(current_user_id()):
        return error_response('You can only view your own trust score unless you are an admin.', 403)

    try:
        user = find_user(user_id)
        if not user:
            return error_response('User account not found.', 404)
        score, event_total = get_score_for_user(user_id)
        events = fetch_trust_events('WHERE tse.user_id = %s', [user_id], limit=50)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the trust_score_events table exists.', 503)

    return success_response(
        message='User trust score loaded successfully.',
        data=serialize_score(user, score, event_total, events),
    )


@trust_score_bp.post('/events')
@roles_required('admin')
def create_manual_trust_score_event():
    payload = request.get_json(silent=True) or {}
    user_id = payload.get('user_id') or payload.get('userId')
    event_type = str(payload.get('event_type') or payload.get('eventType') or 'manual_admin_event').strip()
    reason = str(payload.get('reason') or '').strip()
    points = payload.get('points')

    if not user_id:
        return error_response('User ID is required for a manual trust score event.', 400)
    if event_type not in VALID_EVENT_TYPES:
        return error_response('Invalid trust score event type.', 400)
    if not reason:
        return error_response('Reason is required for trust score audit history.', 400)

    try:
        target_user = find_user(user_id)
        if not target_user:
            return error_response('Target user account not found.', 404)

        parsed_points = int(points) if points is not None and str(points) != '' else EVENT_POINTS.get(event_type, 0)
        if parsed_points < -30 or parsed_points > 30:
            return error_response('Manual trust event points must be between -30 and 30.', 400)

        event_id = create_trust_event(
            user_id=user_id,
            event_type=event_type,
            points=parsed_points,
            reason=reason,
            created_by=current_user_id(),
            source_type='admin_manual',
            source_id=None,
        )
        events = fetch_trust_events('WHERE tse.event_id = %s', [event_id], limit=1)
        score, event_total = get_score_for_user(user_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the trust_score_events table exists.', 503)

    return success_response(
        message='Manual trust score event created successfully.',
        data={
            'event': serialize_trust_event(events[0]) if events else None,
            'score': score,
            'eventTotal': event_total,
            'user': target_user,
        },
        status_code=201,
    )
