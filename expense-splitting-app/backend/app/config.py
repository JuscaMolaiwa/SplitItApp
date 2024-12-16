import os
from dotenv import load_dotenv # type: ignore

load_dotenv()  # Load environment variables from a .env file

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_default_secret_key')  # Default to 'your_default_secret_key' for development
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:///default.db')  # Default to SQLite
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", None)
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', './uploads') # Default upload folder
    ALLOWED_EXTENSIONS = os.getenv('ALLOWED_EXTENSIONS', 'pdf,jpg,png').split(',') # Default file types
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000') # Default origin
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable modification tracking to save resources

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    CORS_ORIGINS = '*' # Allow all origins for testing
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", 'your_test_jwt_secret')  # Default JWT secret for testing
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URI', 'sqlite:///:memory:')  # Default to SQLite for testing)

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'sqlite:///production.db')  # Default to SQLite for production if not set
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'https://yourdomain.com').split(',')  # Specify production origins
    