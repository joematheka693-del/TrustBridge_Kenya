from flask import Flask
from flask_cors import CORS
from config.settings import Config
from routes.health_routes import health_bp
from routes.auth_routes import auth_bp
from routes.job_routes import jobs_bp
from routes.talent_routes import talent_bp
from routes.application_routes import applications_bp
from routes.verification_routes import verification_bp
from routes.trust_score_routes import trust_score_bp
from routes.admin_routes import admin_bp
from routes.audit_routes import audit_bp
from utils.error_handlers import register_error_handlers
from utils.response_helpers import success_response


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(
        app,
        resources={r'/api/*': {'origins': [Config.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']}},
        supports_credentials=True
    )

    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(jobs_bp, url_prefix='/api/jobs')
    app.register_blueprint(talent_bp, url_prefix='/api/talent')
    app.register_blueprint(applications_bp, url_prefix='/api/applications')
    app.register_blueprint(verification_bp, url_prefix='/api/verification-requests')
    app.register_blueprint(trust_score_bp, url_prefix='/api/trust-score')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(audit_bp, url_prefix='/api/system-audit')

    @app.get('/')
    def index():
        return success_response(
            message='TrustBridge Kenya API root is active.',
            data={
                'api_health': '/api/health',
                'database_health': '/api/health/database',
                'phase': '2.9 Backend Hardening and Integration Cleanup'
            }
        )

    register_error_handlers(app)

    return app


app = create_app()


if __name__ == '__main__':
    app.run(host=Config.FLASK_HOST, port=Config.FLASK_PORT, debug=Config.FLASK_DEBUG)
