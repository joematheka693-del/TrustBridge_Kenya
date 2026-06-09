from flask import Blueprint, g, request
from pymysql.err import OperationalError
from config.db import execute_write, fetch_all, fetch_one, get_db_connection
from utils.auth_helpers import login_required, roles_required
from utils.response_helpers import error_response, success_response
from utils.trust_score_helpers import create_trust_event_safe


talent_bp = Blueprint('talent_routes', __name__)

PROFILE_COLUMNS = """
    tp.profile_id,
    tp.user_id,
    tp.name,
    tp.email,
    tp.category,
    tp.skill_level,
    tp.location,
    tp.rate,
    tp.bio,
    tp.trust_score,
    tp.completed_jobs,
    tp.availability,
    tp.verification,
    tp.status,
    u.name AS owner_name,
    u.role AS owner_role,
    tp.created_at,
    tp.updated_at
"""

VALID_CATEGORIES = {
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'UI Designer',
    'Content Writer',
    'Virtual Assistant',
    'Digital Marketer',
    'Data Entry Specialist',
    'General Freelancer',
}

VALID_LEVELS = {'Beginner', 'Beginner+', 'Intermediate', 'Advanced'}
VALID_VERIFICATION = {'pending', 'reviewed', 'verified', 'rejected'}
VALID_STATUS = {'active', 'draft', 'hidden', 'under_review'}


def current_user_id():
    return g.current_user.get('user_id') or g.current_user.get('id')


def normalize_list(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [item.strip() for item in value.split(',') if item.strip()]
    return []


def normalize_portfolio_links(value):
    if not isinstance(value, list):
        return []

    links = []
    for item in value:
        if isinstance(item, dict):
            label = str(item.get('label') or item.get('title') or 'Portfolio link').strip()
            url = str(item.get('url') or item.get('link') or '').strip()
        else:
            label = 'Portfolio link'
            url = str(item).strip()

        if url:
            links.append({'label': label[:120], 'url': url[:255]})

    return links


def serialize_profile(profile, skills=None, portfolio_links=None):
    return {
        'id': profile.get('profile_id'),
        'profile_id': profile.get('profile_id'),
        'user_id': profile.get('user_id'),
        'name': profile.get('name'),
        'email': profile.get('email'),
        'category': profile.get('category'),
        'skill_level': profile.get('skill_level'),
        'skillLevel': profile.get('skill_level'),
        'location': profile.get('location'),
        'rate': profile.get('rate'),
        'bio': profile.get('bio'),
        'trust_score': profile.get('trust_score'),
        'trustScore': profile.get('trust_score'),
        'completed_jobs': profile.get('completed_jobs'),
        'completedJobs': profile.get('completed_jobs'),
        'availability': profile.get('availability'),
        'verification': profile.get('verification'),
        'status': profile.get('status'),
        'owner_name': profile.get('owner_name'),
        'owner_role': profile.get('owner_role'),
        'skills': skills or [],
        'portfolio_links': portfolio_links or [],
        'portfolioLinks': portfolio_links or [],
        'created_at': str(profile.get('created_at')) if profile.get('created_at') else None,
        'updated_at': str(profile.get('updated_at')) if profile.get('updated_at') else None,
    }


def attach_profile_children(profile):
    if not profile:
        return None

    skills = fetch_all(
        """
        SELECT skill_name
        FROM profile_skills
        WHERE profile_id = %s
        ORDER BY skill_id ASC
        """,
        (profile['profile_id'],),
    )

    portfolio_links = fetch_all(
        """
        SELECT label, url
        FROM portfolio_links
        WHERE profile_id = %s
        ORDER BY link_id ASC
        """,
        (profile['profile_id'],),
    )

    return serialize_profile(
        profile,
        skills=[item['skill_name'] for item in skills],
        portfolio_links=[{'label': item['label'], 'url': item['url']} for item in portfolio_links],
    )


def find_profile(profile_id):
    return fetch_one(
        f"""
        SELECT {PROFILE_COLUMNS}
        FROM talent_profiles tp
        LEFT JOIN users u ON u.user_id = tp.user_id
        WHERE tp.profile_id = %s
        LIMIT 1
        """,
        (profile_id,),
    )


def can_manage_profile(profile):
    role = g.current_user.get('role')
    return role == 'admin' or int(profile.get('user_id')) == int(current_user_id())


def read_profile_payload(partial=False):
    payload = request.get_json(silent=True) or {}

    name = str(payload.get('name', '')).strip()
    email = str(payload.get('email', '')).strip()
    category = str(payload.get('category', 'General Freelancer')).strip() or 'General Freelancer'
    skill_level = str(payload.get('skill_level') or payload.get('skillLevel') or 'Beginner').strip()
    location = str(payload.get('location', 'Kenya')).strip() or 'Kenya'
    rate = str(payload.get('rate', '')).strip()
    bio = str(payload.get('bio', '')).strip()
    trust_score = payload.get('trust_score') or payload.get('trustScore') or 45
    completed_jobs = payload.get('completed_jobs') or payload.get('completedJobs') or 0
    availability = str(payload.get('availability', 'Available for selected projects')).strip()
    verification = str(payload.get('verification', 'pending')).strip()
    status = str(payload.get('status', 'active')).strip()
    skills = normalize_list(payload.get('skills'))
    portfolio_links = normalize_portfolio_links(payload.get('portfolioLinks') or payload.get('portfolio_links'))

    if not name:
        return None, error_response('Profile name is required.', 400)
    if not email:
        return None, error_response('Profile email is required.', 400)
    if not bio:
        return None, error_response('Profile bio is required.', 400)
    if not rate:
        return None, error_response('Profile rate is required.', 400)
    if category not in VALID_CATEGORIES:
        category = 'General Freelancer'
    if skill_level not in VALID_LEVELS:
        skill_level = 'Beginner'
    if verification not in VALID_VERIFICATION:
        verification = 'pending'
    if status not in VALID_STATUS:
        status = 'active'

    try:
        trust_score = max(0, min(100, int(trust_score)))
    except (TypeError, ValueError):
        trust_score = 45

    try:
        completed_jobs = max(0, int(completed_jobs))
    except (TypeError, ValueError):
        completed_jobs = 0

    return {
        'name': name[:120],
        'email': email[:160],
        'category': category,
        'skill_level': skill_level,
        'location': location[:120],
        'rate': rate[:80],
        'bio': bio,
        'trust_score': trust_score,
        'completed_jobs': completed_jobs,
        'availability': availability[:100],
        'verification': verification,
        'status': status,
        'skills': skills[:20],
        'portfolio_links': portfolio_links[:10],
    }, None


def replace_profile_children(connection, profile_id, skills, portfolio_links):
    with connection.cursor() as cursor:
        cursor.execute('DELETE FROM profile_skills WHERE profile_id = %s', (profile_id,))
        cursor.execute('DELETE FROM portfolio_links WHERE profile_id = %s', (profile_id,))

        for skill in skills:
            cursor.execute(
                'INSERT INTO profile_skills (profile_id, skill_name) VALUES (%s, %s)',
                (profile_id, skill[:80]),
            )

        for link in portfolio_links:
            cursor.execute(
                'INSERT INTO portfolio_links (profile_id, label, url) VALUES (%s, %s, %s)',
                (profile_id, link['label'], link['url']),
            )


@talent_bp.get('')
@talent_bp.get('/')
def list_talent_profiles():
    query = str(request.args.get('q', '')).strip()
    category = str(request.args.get('category', '')).strip()
    level = str(request.args.get('level', '')).strip()
    status = str(request.args.get('status', 'active')).strip()

    where_clauses = []
    params = []

    if status and status != 'all':
        where_clauses.append('tp.status = %s')
        params.append(status)

    if category and category != 'All categories':
        where_clauses.append('tp.category = %s')
        params.append(category)

    if level and level != 'All levels':
        where_clauses.append('tp.skill_level = %s')
        params.append(level)

    if query:
        where_clauses.append('(tp.name LIKE %s OR tp.bio LIKE %s OR tp.category LIKE %s OR tp.location LIKE %s)')
        search_value = f'%{query}%'
        params.extend([search_value, search_value, search_value, search_value])

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ''

    try:
        profiles = fetch_all(
            f"""
            SELECT {PROFILE_COLUMNS}
            FROM talent_profiles tp
            LEFT JOIN users u ON u.user_id = tp.user_id
            {where_sql}
            ORDER BY tp.trust_score DESC, tp.created_at DESC
            """,
            tuple(params),
        )
        serialized_profiles = [attach_profile_children(profile) for profile in profiles]
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the talent tables exist.', 503)

    return success_response(
        message='Talent profiles loaded successfully.',
        data={'profiles': serialized_profiles},
    )


@talent_bp.get('/<int:profile_id>')
def get_talent_profile(profile_id):
    try:
        profile = find_profile(profile_id)
        serialized_profile = attach_profile_children(profile) if profile else None
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the talent tables exist.', 503)

    if not serialized_profile:
        return error_response('Talent profile not found.', 404)

    return success_response(
        message='Talent profile loaded successfully.',
        data={'profile': serialized_profile},
    )


@talent_bp.post('')
@talent_bp.post('/')
@roles_required('member', 'freelancer', 'admin')
def create_talent_profile():
    payload, validation_error = read_profile_payload()
    if validation_error:
        return validation_error

    user_id = current_user_id()

    try:
        existing_profile = fetch_one(
            'SELECT profile_id FROM talent_profiles WHERE user_id = %s LIMIT 1',
            (user_id,),
        )
        if existing_profile and g.current_user.get('role') != 'admin':
            return error_response('You already have a talent profile. Update the existing profile instead.', 409)

        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO talent_profiles
                      (user_id, name, email, category, skill_level, location, rate, bio, trust_score, completed_jobs, availability, verification, status)
                    VALUES
                      (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        user_id,
                        payload['name'],
                        payload['email'],
                        payload['category'],
                        payload['skill_level'],
                        payload['location'],
                        payload['rate'],
                        payload['bio'],
                        payload['trust_score'],
                        payload['completed_jobs'],
                        payload['availability'],
                        payload['verification'],
                        payload['status'],
                    ),
                )
                profile_id = cursor.lastrowid
            replace_profile_children(connection, profile_id, payload['skills'], payload['portfolio_links'])
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

        created_profile = attach_profile_children(find_profile(profile_id))
        create_trust_event_safe(
            user_id=user_id,
            event_type='talent_profile_completed',
            reason=f"Talent profile completed: {payload['category']}",
            created_by=user_id,
            source_type='talent_profile',
            source_id=profile_id,
        )
    except OperationalError:
        return error_response('Database connection failed while creating the talent profile.', 503)

    return success_response(
        message='Talent profile created successfully.',
        data={'profile': created_profile},
        status_code=201,
    )


@talent_bp.put('/<int:profile_id>')
@roles_required('member', 'freelancer', 'admin')
def update_talent_profile(profile_id):
    payload, validation_error = read_profile_payload()
    if validation_error:
        return validation_error

    try:
        profile = find_profile(profile_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the talent tables exist.', 503)

    if not profile:
        return error_response('Talent profile not found.', 404)

    if not can_manage_profile(profile):
        return error_response('Only the profile owner or an admin can update this profile.', 403)

    try:
        connection = get_db_connection()
        try:
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    UPDATE talent_profiles
                    SET name = %s,
                        email = %s,
                        category = %s,
                        skill_level = %s,
                        location = %s,
                        rate = %s,
                        bio = %s,
                        trust_score = %s,
                        completed_jobs = %s,
                        availability = %s,
                        verification = %s,
                        status = %s
                    WHERE profile_id = %s
                    """,
                    (
                        payload['name'],
                        payload['email'],
                        payload['category'],
                        payload['skill_level'],
                        payload['location'],
                        payload['rate'],
                        payload['bio'],
                        payload['trust_score'],
                        payload['completed_jobs'],
                        payload['availability'],
                        payload['verification'],
                        payload['status'],
                        profile_id,
                    ),
                )
            replace_profile_children(connection, profile_id, payload['skills'], payload['portfolio_links'])
            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            connection.close()

        updated_profile = attach_profile_children(find_profile(profile_id))
    except OperationalError:
        return error_response('Database connection failed while updating the talent profile.', 503)

    return success_response(
        message='Talent profile updated successfully.',
        data={'profile': updated_profile},
    )


@talent_bp.delete('/<int:profile_id>')
@roles_required('member', 'freelancer', 'admin')
def delete_talent_profile(profile_id):
    try:
        profile = find_profile(profile_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the talent tables exist.', 503)

    if not profile:
        return error_response('Talent profile not found.', 404)

    if not can_manage_profile(profile):
        return error_response('Only the profile owner or an admin can delete this profile.', 403)

    try:
        execute_write('DELETE FROM talent_profiles WHERE profile_id = %s', (profile_id,))
    except OperationalError:
        return error_response('Database connection failed while deleting the talent profile.', 503)

    return success_response(
        message='Talent profile deleted successfully.',
        data={'deleted_profile_id': profile_id},
    )
