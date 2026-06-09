from datetime import datetime, timezone
from functools import wraps
import jwt
from flask import request, g
from werkzeug.security import generate_password_hash, check_password_hash
from config.settings import Config
from utils.response_helpers import error_response


def hash_password(password):
    return generate_password_hash(password)


def verify_password(password, password_hash):
    return check_password_hash(password_hash, password)


def generate_token(user):
    now = datetime.now(timezone.utc)
    payload = {
        'user_id': user.get('id') or user.get('user_id'),
        'name': user.get('name'),
        'email': user.get('email'),
        'role': user.get('role', 'member'),
        'iat': now,
        'exp': now + Config.JWT_EXPIRY_DELTA
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')


def decode_token(token):
    return jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])


def get_bearer_token():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return None
    return auth_header.replace('Bearer ', '', 1).strip()


def login_required(view_func):
    @wraps(view_func)
    def wrapper(*args, **kwargs):
        token = get_bearer_token()
        if not token:
            return error_response('Authentication token is required.', 401)
        try:
            g.current_user = decode_token(token)
        except jwt.ExpiredSignatureError:
            return error_response('Authentication token has expired.', 401)
        except jwt.InvalidTokenError:
            return error_response('Authentication token is invalid.', 401)
        return view_func(*args, **kwargs)
    return wrapper


def roles_required(*allowed_roles):
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapper(*args, **kwargs):
            user_role = g.current_user.get('role')
            if user_role not in allowed_roles:
                return error_response('You are not authorized to access this resource.', 403)
            return view_func(*args, **kwargs)
        return wrapper
    return decorator
