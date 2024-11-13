from flask import Blueprint, request, jsonify, current_app # type: ignore
from ..services.user_service import UserService  # Import the UserService

bp = Blueprint('auth', __name__)

@bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    try:
        user = UserService.register_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            full_name=data.get('full_name', ''),
            profile_image=data.get('profile_image', '')
        )
        return jsonify({'message': 'User  registered successfully'}), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 409
    except Exception as e:
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400

    user = UserService.authenticate_user(data['username'], data['password'])
    if user:
        token = UserService.generate_jwt_token(user.id)
        return jsonify({'token': token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401