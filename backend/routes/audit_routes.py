from flask import Blueprint
from pymysql.err import OperationalError, ProgrammingError
from config.db import fetch_all, fetch_one
from config.settings import Config
from utils.auth_helpers import roles_required
from utils.response_helpers import error_response, success_response


audit_bp = Blueprint('audit_routes', __name__)

REQUIRED_TABLES = [
    'users',
    'jobs',
    'talent_profiles',
    'profile_skills',
    'portfolio_links',
    'applications',
    'verification_requests',
    'trust_score_events',
]


def safe_count(table_name):
    try:
        row = fetch_one(f'SELECT COUNT(*) AS total FROM `{table_name}`')
        return int(row.get('total', 0)), None
    except Exception as error:
        return 0, str(error)


def get_existing_tables():
    rows = fetch_all(
        """
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = %s
        """,
        (Config.DB_NAME,),
    )
    return {row.get('TABLE_NAME') or row.get('table_name') for row in rows}


def build_recommendations(database_connected, missing_tables, counts, admin_count):
    recommendations = []

    if not database_connected:
        recommendations.append('Start MySQL and confirm backend/.env database credentials before running the backend.')
    if missing_tables:
        recommendations.append('Run backend/sql/full_schema.sql, then backend/sql/seed.sql to create missing tables and demo accounts.')
    if admin_count == 0:
        recommendations.append('Create at least one active admin account before deployment.')
    if counts.get('users', 0) < 3:
        recommendations.append('Seed or create demo users for admin, client, freelancer, and member testing.')
    if counts.get('jobs', 0) == 0:
        recommendations.append('Add at least one open job so the public jobs page can be tested.')
    if counts.get('talent_profiles', 0) == 0:
        recommendations.append('Add at least one talent profile so the talent marketplace can be tested.')
    if not recommendations:
        recommendations.append('Core database readiness looks good. Continue with deployment environment checks.')

    return recommendations


def calculate_health_score(database_connected, missing_tables, admin_count, counts):
    score = 0
    if database_connected:
        score += 35
    score += round(((len(REQUIRED_TABLES) - len(missing_tables)) / len(REQUIRED_TABLES)) * 35)
    if admin_count > 0:
        score += 10
    if counts.get('users', 0) > 0:
        score += 5
    if counts.get('jobs', 0) > 0:
        score += 5
    if counts.get('talent_profiles', 0) > 0:
        score += 5
    if counts.get('trust_score_events', 0) > 0:
        score += 5
    return max(0, min(score, 100))


@audit_bp.get('')
@audit_bp.get('/')
@roles_required('admin')
def system_audit_index():
    try:
        database_row = fetch_one('SELECT DATABASE() AS database_name, NOW() AS server_time')
        existing_tables = get_existing_tables()
    except OperationalError:
        return error_response('Database connection failed. Confirm MySQL is running and backend/.env is correct.', 503)
    except ProgrammingError:
        return error_response('Database audit failed. Confirm the MySQL user can read information_schema.', 500)

    missing_tables = [table for table in REQUIRED_TABLES if table not in existing_tables]
    counts = {}
    table_checks = []

    for table in REQUIRED_TABLES:
        if table in existing_tables:
            total, count_error = safe_count(table)
            status = 'ready' if not count_error else 'error'
            counts[table] = total
            table_checks.append({'name': table, 'status': status, 'rows': total, 'error': count_error})
        else:
            counts[table] = 0
            table_checks.append({'name': table, 'status': 'missing', 'rows': 0, 'error': None})

    admin_count = 0
    if 'users' in existing_tables:
        row = fetch_one("SELECT COUNT(*) AS total FROM users WHERE role = 'admin' AND status = 'active'")
        admin_count = int(row.get('total', 0))

    database_connected = True
    health_score = calculate_health_score(database_connected, missing_tables, admin_count, counts)
    recommendations = build_recommendations(database_connected, missing_tables, counts, admin_count)

    deployment_ready = database_connected and not missing_tables and admin_count > 0 and health_score >= 80

    return success_response(
        message='System audit completed successfully.',
        data={
            'database': {
                'connected': database_connected,
                'name': database_row.get('database_name'),
                'expected_name': Config.DB_NAME,
                'server_time': str(database_row.get('server_time')),
                'healthScore': health_score,
                'mode': Config.FLASK_ENV,
            },
            'requiredTables': table_checks,
            'missingTables': missing_tables,
            'counts': {
                'users': counts.get('users', 0),
                'jobs': counts.get('jobs', 0),
                'talent_profiles': counts.get('talent_profiles', 0),
                'talent': counts.get('talent_profiles', 0),
                'applications': counts.get('applications', 0),
                'verification_requests': counts.get('verification_requests', 0),
                'verification': counts.get('verification_requests', 0),
                'trust_score_events': counts.get('trust_score_events', 0),
                'admins': admin_count,
            },
            'deploymentReady': deployment_ready,
            'recommendations': recommendations,
        },
    )
