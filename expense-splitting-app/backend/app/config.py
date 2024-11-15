import os
from dotenv import load_dotenv # type: ignore

load_dotenv()  # Load environment variables from a .env file

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'SECRET_KEY')  # Use a default for development
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'DATABASE_URI')  # Default to SQLite
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')
    ALLOWED_EXTENSIONS = os.getenv('ALLOWED_EXTENSIONS')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000')  # Default origin
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URI', 'TEST_DATABASE_URI')

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False