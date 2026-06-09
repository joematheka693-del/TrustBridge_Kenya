from flask import Blueprint
from config.db import db_ping
from config.settings import Config
from utils.response_helpers import success_response

health_bp = Blueprint('health_routes', __name__)


@health_bp.get('/health')
def health_check():
    return success_response(
        message='TrustBridge backend is running.',
        data={
            'service': 'trustbridge-kenya-api',
            'environment': Config.FLASK_ENV,
            'api_prefix': '/api',
            'phase': '3.2 Final Integration Testing and Polish',
            'database_expected': Config.DB_NAME,
            'frontend_url': Config.FRONTEND_URL,
        }
    )


@health_bp.get('/health/database')
def database_health_check():
    is_connected, result = db_ping()
    return success_response(
        message='Database connection checked.' if is_connected else 'Database connection failed.',
        data={
            'connected': is_connected,
            'result': result,
            'database_expected': Config.DB_NAME,
        },
        status_code=200 if is_connected else 503
    )
