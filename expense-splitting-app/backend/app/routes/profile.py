import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory # type: ignore
from ..models import User
from .. import db
from .auth import get_current_user_id, login_required
from flask_jwt_extended import jwt_required # type: ignore
from ..services.profile_service import ProfileService  # Import the ProfileService

bp = Blueprint('profile', __name__)

@bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

@bp.route('/api/profile', methods=['GET'])  
@login_required
@jwt_required()
def get_profile(user_id):
    current_user_id = get_current_user_id()  

    if current_user_id is None:
        return jsonify({'error': 'Authorization token is required'}), 401  

    if current_user_id != user_id:
        return jsonify({'error': 'You do not have permission to view this profile'}), 403
    
    try:
        profile_data = ProfileService.get_user_profile(user_id)
        return jsonify(profile_data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@bp.route('/api/profile', methods=['PUT'])
@login_required
def update_profile(user_id):
    current_user_id = get_current_user_id()  # Get the current user's ID

    if current_user_id is None:
        return jsonify({'error': 'Authorization token is required'}), 401  # Handle unauthorized access

    data = request.get_json() if request.is_json else request.form

    full_name = data.get('full_name')
    bio = data.get('bio')

    if not full_name or not bio:
        return jsonify({'message': 'Full Name and Bio are required'}), 400

    # Check for profile image
    profile_image = request.files.get('profile_image')

    try:
        user = ProfileService.update_user_profile(current_user_id, full_name, bio, profile_image)
        return jsonify({
            'message': 'Profile updated successfully',
            'profile_image_url': user.profile_image
        }), 200
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500