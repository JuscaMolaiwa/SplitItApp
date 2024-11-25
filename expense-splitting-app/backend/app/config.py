import os
from dotenv import load_dotenv # type: ignore

load_dotenv()  # Load environment variables from a .env file

class Config:
    """Base configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'SECRET_KEY')  # Use a default for development
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URI', 'DATABASE_URI')  # Default to SQLite
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER')
    ALLOWED_EXTENSIONS = os.getenv('ALLOWED_EXTENSIONS')
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000')  # Default origin
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True
    CORS_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000']

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    CORS_ORIGINS = '*' 
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv('TEST_DATABASE_URI')

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = 'production-database-uri'
    CORS_ORIGINS = ['https://yourdomain.com']  # Specific production origins
    