from functools import wraps
from flask import Blueprint, request, jsonify, current_app  # type: ignore
from ..services.user_service import UserService  # Import the UserService
import jwt  # type: ignore
from flask_jwt_extended import jwt_required  # type: ignore
from .auth import get_current_user_id, login_required, admin_required
from ..models import User
from .. import db

bp = Blueprint('user', __name__)

# Get a specific user
@bp.route('/api/user', methods=['GET'])
@login_required 
def get_user(user_id):
    user_info = UserService.get_user_by_id(user_id)
    if not user_info:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({"user": user_info}), 200

# Get all users
@bp.route('/api/users', methods=['GET'])
@login_required  
def get_users(user_id):
    users = UserService.get_all_users()
    return jsonify({'users': users}), 200
