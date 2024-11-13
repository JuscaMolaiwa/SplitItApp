from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
import jwt # type: ignore
from datetime import datetime, timedelta
from ..models import User
from .. import db
from flask import current_app # type: ignore
import re
from sqlalchemy.exc import IntegrityError  # type: ignore # For specific exception handling

class UserService:


    #Email validation method
    @staticmethod
    def validate_email(email):
        # Basic regex pattern for validating an email address
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        
        # Check if the email format is valid
        if not re.match(pattern, email):
            raise ValueError("Invalid email format")
        
        # Check if the email is already registered
        if User.query.filter_by(email=email).first():
            raise ValueError("Email already registered")
        
    #Username validation method
    def is_valid_username(username):
        if len(username) < 3 or len(username) > 50:
            raise ValueError("Username must be between 3 and 50 characters.")
        if not re.match(r'^[a-zA-Z0-9_-]+$', username):
            raise ValueError("Username can only contain letters, numbers, hyphens, and underscores.")
        if User.query.filter_by(username=username).first():
            raise ValueError("Username already taken")

    #Password validation  
    def is_valid_password(password):
        if len(password) < 5:
            raise ValueError("Password must be at least 5 characters long.")
        if not re.search(r'[A-Z]', password):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', password):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', password):
            raise ValueError("Password must contain at least one number.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValueError("Password must contain at least one special character.")
    
    #Full name validation   
    def is_valid_full_name(full_name):
        if len(full_name) < 3 or len(full_name) > 100:
            raise ValueError("Full name must be between 3 and 100 characters.")
        if not re.match(r'^[a-zA-Z\s\'-]+$', full_name):
            raise ValueError("Full name can only contain alphabetic characters, spaces, apostrophes, and hyphens.")

    @staticmethod
    def register_user(username, email, password, full_name='', profile_image=''):
        
        # Validate all input fields
        UserService.is_valid_username(username)
        UserService.validate_email(email)
        UserService.is_valid_password(password)
        UserService.is_valid_full_name(full_name)

        try:
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password),
                full_name=full_name,
                profile_image=profile_image,
                role='user'  # Set the default role to 'user'
            )
            db.session.add(user)
            db.session.commit()
            return user
        
        except IntegrityError:
            db.session.rollback()
            raise ValueError("Integrity error: Could not add user (duplicate entry or constraint violation)")
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Registration failed: {str(e)}")

    @staticmethod
    def authenticate_user(username, password):
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            return user
        return None

    @staticmethod
    def generate_jwt_token(user_id, role):
        token = jwt.encode({
            'sub': user_id,
            'role': role,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        return token
    
    @staticmethod
    def get_user_by_id(user_id):
        """Retrieve user information by user ID."""
        user = User.query.get(user_id)
        if not user:
            return None  # User not found

        # Return user information, excluding sensitive data
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'profile_image': user.profile_image
    }

    @staticmethod
    def get_all_users():
        """Retrieve all users from the database."""
        users = User.query.all()  # Fetch all users from the database
        return [
            {
                'id': user.id,
                'role': user.role,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'profile_image': user.profile_image
            }
            for user in users
        ]
    
    