from config.db import execute_write, fetch_all, fetch_one

BASE_SCORE = 45
MIN_SCORE = 0
MAX_SCORE = 100

EVENT_POINTS = {
    'approved_verification': 15,
    'rejected_verification': -10,
    'more_evidence_needed': -3,
    'talent_profile_completed': 8,
    'application_submitted': 2,
    'job_posted': 2,
    'manual_admin_event': 0,
    'dispute_warning': -12,
}

EVENT_LABELS = {
    'approved_verification': 'Approved verification',
    'rejected_verification': 'Rejected verification',
    'more_evidence_needed': 'More evidence needed',
    'talent_profile_completed': 'Talent profile completed',
    'application_submitted': 'Application submitted',
    'job_posted': 'Job posted',
    'manual_admin_event': 'Manual admin event',
    'dispute_warning': 'Dispute warning',
}


def clamp_score(score):
    return max(MIN_SCORE, min(MAX_SCORE, int(score)))


def default_points_for_event(event_type):
    return EVENT_POINTS.get(event_type, 0)


def get_user_label(user_id):
    if not user_id:
        return None
    return fetch_one(
        'SELECT user_id, name, email, role FROM users WHERE user_id = %s LIMIT 1',
        (user_id,),
    )


def serialize_trust_event(event):
    created_at = event.get('created_at')
    return {
        'id': event.get('event_id'),
        'event_id': event.get('event_id'),
        'eventId': event.get('event_id'),
        'user_id': event.get('user_id'),
        'userId': event.get('user_id'),
        'user_name': event.get('user_name'),
        'userName': event.get('user_name'),
        'user_email': event.get('user_email'),
        'userEmail': event.get('user_email'),
        'user_role': event.get('user_role'),
        'userRole': event.get('user_role'),
        'event_type': event.get('event_type'),
        'eventType': event.get('event_type'),
        'points': int(event.get('points') or 0),
        'reason': event.get('reason') or '',
        'created_by': event.get('created_by'),
        'createdBy': event.get('created_by'),
        'created_by_name': event.get('created_by_name'),
        'createdByName': event.get('created_by_name'),
        'source_type': event.get('source_type'),
        'sourceType': event.get('source_type'),
        'source_id': event.get('source_id'),
        'sourceId': event.get('source_id'),
        'created_at': str(created_at) if created_at else None,
        'createdAt': str(created_at.date()) if hasattr(created_at, 'date') else str(created_at) if created_at else None,
    }


def create_trust_event(user_id, event_type, reason, points=None, created_by=None, source_type=None, source_id=None):
    user = get_user_label(user_id)
    if not user:
        return None

    final_points = default_points_for_event(event_type) if points is None else int(points)
    event_id, _ = execute_write(
        """
        INSERT INTO trust_score_events
          (user_id, event_type, points, reason, created_by, source_type, source_id)
        VALUES
          (%s, %s, %s, %s, %s, %s, %s)
        """,
        (user_id, event_type, final_points, reason, created_by, source_type, source_id),
    )
    return event_id


def create_trust_event_safe(user_id, event_type, reason, points=None, created_by=None, source_type=None, source_id=None):
    try:
        return create_trust_event(user_id, event_type, reason, points, created_by, source_type, source_id)
    except Exception:
        return None


def get_score_for_user(user_id):
    events = fetch_all(
        'SELECT points FROM trust_score_events WHERE user_id = %s',
        (user_id,),
    )
    event_total = sum(int(event.get('points') or 0) for event in events)
    return clamp_score(BASE_SCORE + event_total), event_total


def fetch_trust_events(where_sql='', params=None, limit=100):
    return fetch_all(
        f"""
        SELECT
          tse.event_id,
          tse.user_id,
          u.name AS user_name,
          u.email AS user_email,
          u.role AS user_role,
          tse.event_type,
          tse.points,
          tse.reason,
          tse.created_by,
          admin.name AS created_by_name,
          tse.source_type,
          tse.source_id,
          tse.created_at
        FROM trust_score_events tse
        LEFT JOIN users u ON u.user_id = tse.user_id
        LEFT JOIN users admin ON admin.user_id = tse.created_by
        {where_sql}
        ORDER BY tse.created_at DESC, tse.event_id DESC
        LIMIT %s
        """,
        tuple(list(params or []) + [limit]),
    )
