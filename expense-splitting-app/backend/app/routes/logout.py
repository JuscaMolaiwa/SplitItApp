from flask import Blueprint, jsonify, session # type: ignore
from flask_jwt_extended import jwt_required, get_jwt # type: ignore

bp = Blueprint('logout', __name__)

# In-memory blacklist for demonstration (you may want to use a database)
blacklist = set()

# Define the token in blocklist loader function
def blacklist_loader(jwt_header, jwt_payload):
    jti = jwt_payload['jti']  # Get the unique identifier for the token
    return jti in blacklist  # Return True if the token is blacklisted

@bp.route('/api/logout', methods=['POST'])
@jwt_required()  # Ensure the user is logged in with a valid JWT
def logout():
    try:
        jti = get_jwt()['jti']  # Get the unique identifier for the token
        blacklist.add(jti)  # Add the token's jti to the blacklist
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        print(f"Logout error: {e}")  # Log the error
        return jsonify({'error': 'Failed to log out', 'details': str(e)}), 400
