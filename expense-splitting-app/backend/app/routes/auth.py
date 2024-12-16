from functools import wraps
from flask import Blueprint, request, jsonify, current_app # type: ignore
from ..services.user_service import UserService  # Import the UserService
import jwt # type: ignore
from ..models import User

bp = Blueprint('auth', __name__)

@bp.route('/api/register', methods=['POST'])
def register():
    """A method to register a new user."""
    data = request.get_json()

    # Required fields for registration
    required_fields = {'username', 'email', 'password', 'full_name'}

    # Find missing fields
    missing_fields = required_fields - data.keys() if data else required_fields

    if missing_fields:
        return jsonify({'error': 'Missing required fields', 'missing_fields': list(missing_fields)}), 400
    
    try:
        user = UserService.register_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            full_name=data.get('full_name', ''),
            profile_image=data.get('profile_image', '')
        )
        return jsonify({'message': 'User registered successfully'}), 201
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
        # Check for remember_me flag
        remember_me = data.get('remember_me', False)

        # Generate token with different expiration based on remember_me
        token = UserService.generate_jwt_token(user.id, user.role, remember_me)
        return jsonify({'token': token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401


@bp.route('/api/check-email', methods=['POST'])
def check_email():
    email = request.json.get('email')
    if not email:
        return jsonify({'message': 'Email is required'}), 400

    if UserService.validate_email(email):
        return jsonify({'isRegistered': True}), 200

    return jsonify({'isRegistered': False}), 200

@bp.route('/api/check-username', methods=['POST'])
def check_username():
    data = request.get_json()
    username = data.get('username')
    if User.query.filter_by(username=username).first():
        return jsonify({"isTaken": True, "message": "Username is already taken"}), 409
    return jsonify({"isTaken": False, "message": "Username is available"}), 200