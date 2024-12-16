from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
import jwt # type: ignore
from datetime import datetime, timedelta
from ..models import User
from .. import db
from flask import current_app # type: ignore

class AdminService:

    @staticmethod
    def promote_user_to_admin(user_id):
        """Promote a user to admin role."""
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        if user.role == 'admin':
            raise ValueError("User is already an admin")

        try:
            user.role = 'admin'
            db.session.commit()
            return {'message': f'User {user.username} promoted to admin'}
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to promote user to admin: {str(e)}")
        
    @staticmethod
    def assign_first_admin(user_id):
        """Assign the first admin if no admin exists."""
        # Check if there are any users with the admin role
        admin_user = User.query.filter_by(role='admin').first()
        if admin_user:
            raise ValueError("An admin user already exists.")

        # Check if the specified user exists
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found.")

        # If no admin exists, promote the specified user
        return AdminService.promote_user_to_admin(user_id)
        
    @staticmethod
    def revoke_user_admin_role(user_id):
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found.")

        if user.role != 'admin':
            raise ValueError("User is not an admin.")
        
        try:
            user.role = 'user'  # or whatever the default role is
            db.session.commit()
            return {'message': f'User  {user.username} has been revoked from admin'}
        except Exception as e:
            db.session.rollback()
            raise Exception(f"Failed to revoke user admin role: {str(e)}")

    @staticmethod
    def delete_user(user_id):
        user = User.query.get(user_id)  # Assuming you have a User model
        if not user:
            raise ValueError("User not found.")

        # Delete the user from the database
        db.session.delete(user)
        db.session.commit()  # Commit the changes to the database

        return {'message': f'User {user_id} deleted successfully.'}