from functools import wraps
from flask import Blueprint, request, jsonify, current_app  # type: ignore
from ..services.admin_service import AdminService  # Import the UserService
import jwt  # type: ignore
from flask_jwt_extended import jwt_required  # type: ignore
from ..utils.auth_utils import admin_required, get_current_user_id, login_required
from ..models import User
from .. import db

bp = Blueprint('admin', __name__)

@bp.route('/api/admin/assign-first', methods=['POST'])
@login_required
@jwt_required()
def assign_first_admin(user_id):
    """Assign the first admin if no admin exists."""

    user_id = get_current_user_id()  # Get the current logged-in user's ID
    
    # Get the user ID from the request body
    data = request.get_json()
    user_id = data.get('user_id')

    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    try:
        result = AdminService.assign_first_admin(user_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"Error in assign_first_admin: {str(e)}")
        return jsonify({'error': 'An unexpected error occurred.'}), 500

#Assign admin roles
@bp.route('/api/admin/users/<int:user_id>/promote', methods=['POST'])
@admin_required
def promote_user(user_id):
    """Promote a user to admin."""

    # Attempt to promote the user
    try:
        result = AdminService.promote_user_to_admin(user_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred.'}), 500
    
#Revoke admin role
@bp.route('/api/admin/users/<int:user_id>/revoke', methods=['POST'])
@admin_required
def revoke_user(user_id):
    """Revoke admin privileges from a user."""
    
    # Attempt to revoke the user's admin role
    try:
        result = AdminService.revoke_user_admin_role(user_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred.'}), 500
    
@bp.route('/api/delete-user/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        result = AdminService.delete_user(user_id)  # Call the service method
        return jsonify(result), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 404
    except Exception as e:
        return jsonify({'error': 'Failed to delete user', 'details': str(e)}), 500