from flask import Blueprint, g, request
from pymysql.err import IntegrityError, OperationalError
from config.db import execute_write, fetch_one
from utils.auth_helpers import generate_token, hash_password, login_required, verify_password
from utils.response_helpers import error_response, phase_response, success_response
from utils.role_helpers import normalize_role

auth_bp = Blueprint('auth_routes', __name__)

ALLOWED_PUBLIC_ROLES = {'member', 'freelancer', 'client'}


def user_public_data(user):
    return {
        'id': user.get('user_id'),
        'name': user.get('name'),
        'email': user.get('email'),
        'role': user.get('role'),
        'status': user.get('status'),
        'created_at': str(user.get('created_at')) if user.get('created_at') else None,
        'updated_at': str(user.get('updated_at')) if user.get('updated_at') else None,
    }


def find_user_by_email(email):
    return fetch_one(
        """
        SELECT user_id, name, email, password_hash, role, status, created_at, updated_at
        FROM users
        WHERE email = %s
        LIMIT 1
        """,
        (email,),
    )


def find_user_by_id(user_id):
    return fetch_one(
        """
        SELECT user_id, name, email, role, status, created_at, updated_at
        FROM users
        WHERE user_id = %s
        LIMIT 1
        """,
        (user_id,),
    )


@auth_bp.get('/auth')
@auth_bp.get('/auth/')
def auth_index():
    return phase_response(
        resource='Authentication',
        methods=['POST /api/signup', 'POST /api/login', 'GET /api/profile', 'GET /api/protected'],
        next_phase='Phase 2.2 will connect deeper user/account management to the rest of the platform.'
    )


@auth_bp.post('/signup')
def signup():
    payload = request.get_json(silent=True) or {}
    name = str(payload.get('name', '')).strip()
    email = str(payload.get('email', '')).strip().lower()
    password = str(payload.get('password', '')).strip()
    role = normalize_role(payload.get('role', 'member'))

    if not name:
        return error_response('Full name is required.', 400)

    if not email or '@' not in email:
        return error_response('A valid email address is required.', 400)

    if len(password) < 6:
        return error_response('Password must have at least 6 characters.', 400)

    if role not in ALLOWED_PUBLIC_ROLES:
        return error_response('Public signup only supports member, freelancer, or client accounts.', 400)

    password_hash = hash_password(password)

    try:
        user_id, _ = execute_write(
            """
            INSERT INTO users (name, email, password_hash, role, status)
            VALUES (%s, %s, %s, %s, 'active')
            """,
            (name, email, password_hash, role),
        )
    except IntegrityError:
        return error_response('An account with this email already exists.', 409)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the users table exists.', 503)

    user = find_user_by_id(user_id)
    token = generate_token(user)

    return success_response(
        message='Account created successfully.',
        data={'user': user_public_data(user), 'token': token},
        status_code=201,
    )


@auth_bp.post('/login')
def login():
    payload = request.get_json(silent=True) or {}
    email = str(payload.get('email', '')).strip().lower()
    password = str(payload.get('password', '')).strip()

    if not email or not password:
        return error_response('Email and password are required.', 400)

    try:
        user = find_user_by_email(email)
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and the users table exists.', 503)

    if not user or not verify_password(password, user.get('password_hash', '')):
        return error_response('Invalid email or password.', 401)

    if user.get('status') != 'active':
        return error_response('This account is not active. Contact the administrator.', 403)

    token = generate_token(user)

    return success_response(
        message='Login successful.',
        data={'user': user_public_data(user), 'token': token},
    )


@auth_bp.get('/profile')
@login_required
def profile():
    user = find_user_by_id(g.current_user.get('user_id'))

    if not user:
        return error_response('Profile not found.', 404)

    return success_response(
        message='Profile loaded successfully.',
        data={'user': user_public_data(user)},
    )


@auth_bp.get('/protected')
@login_required
def protected():
    return success_response(
        message='Protected route access granted.',
        data={'current_user': g.current_user},
    )
