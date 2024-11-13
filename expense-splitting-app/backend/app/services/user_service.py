from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
import jwt # type: ignore
from datetime import datetime, timedelta
from ..models import User
from .. import db
from flask import current_app # type: ignore

class UserService:

    @staticmethod
    def register_user(username, email, password, full_name='', profile_image=''):
        if User.query.filter_by(email=email).first():
            raise ValueError("Email already registered")
        if User.query.filter_by(username=username).first():
            raise ValueError("Username already taken")

        try:
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password),
                full_name=full_name,
                profile_image=profile_image
            )
            db.session.add(user)
            db.session.commit()
            return user
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
    def generate_jwt_token(user_id):
        token = jwt.encode({
            'sub': user_id,
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
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'profile_image': user.profile_image
            }
            for user in users
        ]