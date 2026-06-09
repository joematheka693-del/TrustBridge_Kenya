from flask import Blueprint, g, request
from pymysql.err import OperationalError
from config.db import execute_write, fetch_all, fetch_one
from utils.auth_helpers import login_required, roles_required
from utils.response_helpers import error_response, success_response
from utils.trust_score_helpers import create_trust_event_safe

jobs_bp = Blueprint('job_routes', __name__)

PUBLIC_JOB_COLUMNS = """
    j.job_id,
    j.title,
    j.description,
    j.category,
    j.location,
    j.budget,
    j.timeline,
    j.experience,
    j.trust_level,
    j.skills,
    j.status,
    j.owner_id,
    u.name AS client_name,
    u.email AS client_email,
    j.created_at,
    j.updated_at
"""

VALID_STATUSES = {'open', 'paused', 'closed', 'under_review'}
VALID_CATEGORIES = {
    'Frontend Development',
    'Backend Development',
    'Full Stack Development',
    'Profile Improvement',
    'Design and Branding',
    'Digital Marketing',
    'Data Entry',
    'General',
}


def serialize_job(job):
    skills = job.get('skills') or ''
    if isinstance(skills, str):
        skills_list = [skill.strip() for skill in skills.split(',') if skill.strip()]
    else:
        skills_list = skills

    return {
        'id': job.get('job_id'),
        'job_id': job.get('job_id'),
        'title': job.get('title'),
        'description': job.get('description'),
        'category': job.get('category'),
        'location': job.get('location'),
        'budget': job.get('budget'),
        'timeline': job.get('timeline'),
        'experience': job.get('experience'),
        'trust_level': job.get('trust_level'),
        'trustLevel': job.get('trust_level'),
        'skills': skills_list,
        'status': job.get('status'),
        'owner_id': job.get('owner_id'),
        'client_name': job.get('client_name'),
        'clientName': job.get('client_name'),
        'client_email': job.get('client_email'),
        'created_at': str(job.get('created_at')) if job.get('created_at') else None,
        'updated_at': str(job.get('updated_at')) if job.get('updated_at') else None,
        'postedAt': str(job.get('created_at')) if job.get('created_at') else None,
    }


def normalize_skills(value):
    if isinstance(value, list):
        return ', '.join(str(item).strip() for item in value if str(item).strip())
    return str(value or '').strip()


def read_job_payload():
    payload = request.get_json(silent=True) or {}
    title = str(payload.get('title', '')).strip()
    description = str(payload.get('description', '')).strip()
    category = str(payload.get('category', 'General')).strip() or 'General'
    location = str(payload.get('location', 'Remote, Kenya')).strip() or 'Remote, Kenya'
    budget = str(payload.get('budget', '')).strip()
    timeline = str(payload.get('timeline', '')).strip()
    experience = str(payload.get('experience', 'Open level')).strip() or 'Open level'
    trust_level = str(payload.get('trust_level') or payload.get('trustLevel') or 'Trust review pending').strip()
    status = str(payload.get('status', 'open')).strip()
    skills = normalize_skills(payload.get('skills'))

    if not title:
        return None, error_response('Job title is required.', 400)
    if len(title) > 160:
        return None, error_response('Job title cannot exceed 160 characters.', 400)
    if not description:
        return None, error_response('Job description is required.', 400)
    if not budget:
        return None, error_response('Job budget is required.', 400)
    if not timeline:
        return None, error_response('Job timeline is required.', 400)
    if category not in VALID_CATEGORIES:
        category = 'General'
    if status not in VALID_STATUSES:
        status = 'open'

    return {
        'title': title,
        'description': description,
        'category': category,
        'location': location,
        'budget': budget,
        'timeline': timeline,
        'experience': experience,
        'trust_level': trust_level,
        'skills': skills,
        'status': status,
    }, None


def find_job(job_id):
    return fetch_one(
        f"""
        SELECT {PUBLIC_JOB_COLUMNS}
        FROM jobs j
        LEFT JOIN users u ON u.user_id = j.owner_id
        WHERE j.job_id = %s
        LIMIT 1
        """,
        (job_id,),
    )


def current_user_id():
    return g.current_user.get('user_id') or g.current_user.get('id')


def can_manage_job(job):
    role = g.current_user.get('role')
    return role == 'admin' or int(job.get('owner_id')) == int(current_user_id())


@jobs_bp.get('')
@jobs_bp.get('/')
def list_jobs():
    query = str(request.args.get('q', '')).strip()
    category = str(request.args.get('category', '')).strip()
    status = str(request.args.get('status', 'open')).strip()

    where_clauses = []
    params = []

    if status and status != 'all':
        where_clauses.append('j.status = %s')
        params.append(status)

    if category and category != 'All':
        where_clauses.append('j.category = %s')
        params.append(category)

    if query:
        where_clauses.append('(j.title LIKE %s OR j.description LIKE %s OR j.skills LIKE %s OR j.location LIKE %s)')
        search_value = f'%{query}%'
        params.extend([search_value, search_value, search_value, search_value])

    where_sql = f"WHERE {' AND '.join(where_clauses)}" if where_clauses else ''

    try:
        jobs = fetch_all(
            f"""
            SELECT {PUBLIC_JOB_COLUMNS}
            FROM jobs j
            LEFT JOIN users u ON u.user_id = j.owner_id
            {where_sql}
            ORDER BY j.created_at DESC
            """,
            tuple(params),
        )
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the jobs table exists.', 503)

    return success_response(
        message='Jobs loaded successfully.',
        data={'jobs': [serialize_job(job) for job in jobs]},
    )


@jobs_bp.get('/<int:job_id>')
def get_job(job_id):
    try:
        job = find_job(job_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the jobs table exists.', 503)

    if not job:
        return error_response('Job not found.', 404)

    return success_response(
        message='Job loaded successfully.',
        data={'job': serialize_job(job)},
    )


@jobs_bp.post('')
@jobs_bp.post('/')
@roles_required('client', 'admin')
def create_job():
    payload, validation_error = read_job_payload()
    if validation_error:
        return validation_error

    try:
        job_id, _ = execute_write(
            """
            INSERT INTO jobs (owner_id, title, description, category, location, budget, timeline, experience, trust_level, skills, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                current_user_id(),
                payload['title'],
                payload['description'],
                payload['category'],
                payload['location'],
                payload['budget'],
                payload['timeline'],
                payload['experience'],
                payload['trust_level'],
                payload['skills'],
                payload['status'],
            ),
        )
        job = find_job(job_id)
        create_trust_event_safe(
            user_id=current_user_id(),
            event_type='job_posted',
            reason=f"Job posted: {payload['title']}",
            created_by=current_user_id(),
            source_type='job',
            source_id=job_id,
        )
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the jobs table exists.', 503)

    return success_response(
        message='Job created successfully.',
        data={'job': serialize_job(job)},
        status_code=201,
    )


@jobs_bp.put('/<int:job_id>')
@roles_required('client', 'admin')
def update_job(job_id):
    try:
        job = find_job(job_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the jobs table exists.', 503)

    if not job:
        return error_response('Job not found.', 404)

    if not can_manage_job(job):
        return error_response('Only the job owner or an admin can update this job.', 403)

    payload, validation_error = read_job_payload()
    if validation_error:
        return validation_error

    try:
        execute_write(
            """
            UPDATE jobs
            SET title = %s,
                description = %s,
                category = %s,
                location = %s,
                budget = %s,
                timeline = %s,
                experience = %s,
                trust_level = %s,
                skills = %s,
                status = %s
            WHERE job_id = %s
            """,
            (
                payload['title'],
                payload['description'],
                payload['category'],
                payload['location'],
                payload['budget'],
                payload['timeline'],
                payload['experience'],
                payload['trust_level'],
                payload['skills'],
                payload['status'],
                job_id,
            ),
        )
        updated_job = find_job(job_id)
    except OperationalError:
        return error_response('Database connection failed while updating the job.', 503)

    return success_response(
        message='Job updated successfully.',
        data={'job': serialize_job(updated_job)},
    )


@jobs_bp.delete('/<int:job_id>')
@roles_required('client', 'admin')
def delete_job(job_id):
    try:
        job = find_job(job_id)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the jobs table exists.', 503)

    if not job:
        return error_response('Job not found.', 404)

    if not can_manage_job(job):
        return error_response('Only the job owner or an admin can delete this job.', 403)

    try:
        execute_write('DELETE FROM jobs WHERE job_id = %s', (job_id,))
    except OperationalError:
        return error_response('Database connection failed while deleting the job.', 503)

    return success_response(
        message='Job deleted successfully.',
        data={'deleted_job_id': job_id},
    )
