# In app/utils/auth_utils.py
from functools import wraps
from flask import request, jsonify, current_app # type: ignore
import jwt # type: ignore
import time
from typing import Optional, Union

def decode_token(token: str) -> Union[dict, str]:
    """
    Decode and validate a JWT token.
    
    Returns:
    - Decoded payload if token is valid
    - 'expired' if token is expired
    - None if token is invalid
    """
    try:
        decoded_token = jwt.decode(
            token, 
            current_app.config['SECRET_KEY'], 
            algorithms=["HS256"]
        )
        return decoded_token
    except jwt.ExpiredSignatureError:
        return 'expired'
    except jwt.InvalidTokenError:
        return None

def get_current_user_id() -> Optional[Union[int, str]]:
    """
    Extract user ID from JWT token in the request header.
    
    Returns:
        int: User ID if token is valid
        'expired': If token is expired
        None: If no token or invalid token
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None

    try:
        # Assumes 'Bearer <token>' format
        token = auth_header.split(" ")[1]
        decoded_result = decode_token(token)
        
        if decoded_result == 'expired':
            return 'expired'
        
        if isinstance(decoded_result, dict):
            return decoded_result.get('sub')
        
        return None
    except (IndexError, ValueError):
        return None

def login_required(f):
    """
    Decorator to require a valid JWT token for route access.
    
    Adds user_id to the function arguments if token is valid.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_current_user_id()
        
        if user_id is None:
            return jsonify({'error': 'Authentication required'}), 401
        
        if user_id == 'expired':
            return jsonify({'error': 'Token expired, please log in again'}), 401
        
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