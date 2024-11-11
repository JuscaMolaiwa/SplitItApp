import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory # type: ignore
from ..models import User
from .. import db
from .auth import get_current_user_id, login_required
from werkzeug.utils import secure_filename # type: ignore

bp = Blueprint('profile', __name__)

# Function to check allowed image extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@bp.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)  # Corrected to use UPLOAD_FOLDER

@bp.route('/api/profile', methods=['GET'])  
@login_required
def get_profile(user_id):
    current_user_id = get_current_user_id()  

    if current_user_id is None:
        return jsonify({'error': 'Authorization token is required'}), 401  

    if current_user_id != user_id:
        return jsonify({'error': 'You do not have permission to view this profile'}), 403
    
    user = User.query.get_or_404(user_id)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': user.full_name,
        'profile_image': user.profile_image,
        'bio': user.bio
    }), 200

@bp.route('/api/profile', methods=['PUT'])  # Removed <int:user_id> from the route
@login_required
def update_profile(user_id):
    current_user_id = get_current_user_id()  # Get the current user's ID

    if current_user_id is None:
        return jsonify({'error': 'Authorization token is required'}), 401  # Handle unauthorized access

    # Retrieve the user based on the current user's ID
    user = User.query.get_or_404(current_user_id)

    data = request.get_json() if request.is_json else request.form

    full_name = data.get('full_name')
    bio = data.get('bio')

    if not full_name or not bio:
        return jsonify({'message': 'Full Name and Bio are required'}), 400

    # Ensure the upload folder exists
    if not os.path.exists(current_app.config['UPLOAD_FOLDER']):
        os.makedirs(current_app.config['UPLOAD_FOLDER'])

    # Check for profile image
    profile_image = request.files.get('profile_image')
    image_url = None
    if profile_image and allowed_file(profile_image.filename):
        filename = secure_filename(profile_image.filename)
        image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        try:
            profile_image.save(image_path)  # Save the profile image
            image_url = f"/uploads/{filename}"  # Create the image URL
        except Exception as e:
            return jsonify({'error': 'Failed to save the profile image'}), 500

    # Update user profile fields
    user.full_name = full_name
    user.bio = bio
    if image_url:  # Update only if a new image was uploaded
        user.profile_image = image_url

    db.session.commit()  # Commit the changes to the database
    
    return jsonify({
        'message': 'Profile updated successfully',
        'profile_image_url': image_url
        }), 200