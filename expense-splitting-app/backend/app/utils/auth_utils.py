from functools import wraps
from flask import request, jsonify, current_app # type: ignore
import jwt # type: ignore


def get_current_user_id():
    """Get the current user ID from the JWT token."""
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None  # No token found

    try:
        token = auth_header.split(" ")[1]
        decoded_token = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
        user_id = decoded_token['sub']
        return user_id
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

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