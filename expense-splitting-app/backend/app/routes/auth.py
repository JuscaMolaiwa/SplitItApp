from functools import wraps
from flask import Blueprint, request, jsonify # type: ignore
from flask import Blueprint, request, jsonify, current_app # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
import jwt # type: ignore
from datetime import datetime, timedelta
from ..models import User
from .. import db

bp = Blueprint('auth', __name__)


# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_current_user_id()  #  this is a function that retrieves the logged-in user ID.
        if not user_id:
            return jsonify({'error': 'Authentication required'}), 401
        # Pass the user_id as a keyword argument to the view function
        return f(user_id=user_id, *args, **kwargs)
    return decorated_function


# Helper function to get the current user ID from the JWT token
def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None  # No token found

    try:
        token = auth_header.split(" ")[1]
        decoded_token = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        return decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired, please log in again'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token, please log in again'}), 401


@bp.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 409
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already taken'}), 409

    try:
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            full_name=data.get('full_name', ''),
            profile_image=data.get('profile_image', '')
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'User  registered successfully'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

@bp.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()

    # Check if the required fields are present
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        }, current_app.config['SECRET_KEY'], algorithm='HS256')
        return jsonify({'token': token}), 200
    return jsonify({'error': 'Invalid credentials'}), 401