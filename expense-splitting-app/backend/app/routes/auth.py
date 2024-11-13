from functools import wraps
from flask import Blueprint, request, jsonify, current_app # type: ignore
from ..services.user_service import UserService  # Import the UserService
import jwt # type: ignore

bp = Blueprint('auth', __name__)

# Helper function to get the current user ID from the JWT token
def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None  # No token found

    try:
        token = auth_header.split(" ")[1]
        decoded_token = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = decoded_token['sub']
        return user_id
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired, please log in again'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token, please log in again'}), 401

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        return f(user_id=user_id, *args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'error': 'Authentication required'}), 401

        try:
            token = auth_header.split(" ")[1]
            decoded_token = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            if decoded_token.get('role') != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired, please log in again'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token, please log in again'}), 401
        return f(*args, **kwargs)
    return decorated_function

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
        token = UserService.generate_jwt_token(user.id, user.role)
        return jsonify({'token': token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401