import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    FLASK_HOST = os.getenv('FLASK_HOST', '127.0.0.1')
    FLASK_PORT = int(os.getenv('FLASK_PORT', '5000'))
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
    DB_PORT = int(os.getenv('DB_PORT', '3306'))
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', '')
    DB_NAME = os.getenv('DB_NAME', 'trustbridge_kenya')
    JWT_SECRET = os.getenv('JWT_SECRET', 'dev-trustbridge-secret')
    JWT_EXPIRES_IN_HOURS = int(os.getenv('JWT_EXPIRES_IN_HOURS', '24'))
    JWT_EXPIRY_DELTA = timedelta(hours=JWT_EXPIRES_IN_HOURS)
