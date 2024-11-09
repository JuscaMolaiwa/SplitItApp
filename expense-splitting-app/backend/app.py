from functools import wraps
from flask import Flask, request, jsonify # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from werkzeug.security import generate_password_hash, check_password_hash # type: ignore
import jwt # type: ignore
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv # type: ignore

from flask_migrate import Migrate # type: ignore

from flask import Flask, send_from_directory # type: ignore

from flask_cors import CORS # type: ignore

app = Flask(__name__)

load_dotenv()

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')


db = SQLAlchemy(app)
migrate = Migrate(app, db)

# In your CORS configuration, check that OPTIONS is an allowed method
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# User Model
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100))
    profile_image = db.Column(db.String(255))
    bio = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Group Model
class Group(db.Model):
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Group Members Model
class GroupMember(db.Model):
    __tablename__ = 'group_members'
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

# User Registration
@app.route('/api/register', methods=['POST'])
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
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500

# User Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    if user and check_password_hash(user.password_hash, data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.utcnow() + timedelta(days=1)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({'token': token})
    return jsonify({'error': 'Invalid credentials'}), 401

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


# Create Group with login_required decorator
@app.route('/api/groups', methods=['POST'])
@login_required
def create_group():
    user_id = get_current_user_id()
    data = request.get_json()
    try:
        group = Group(
            name=data['name'],
            description=data.get('description', ''),
            created_by=user_id
        )
        db.session.add(group)
        db.session.commit()

        # Add creator as a member
        member = GroupMember(
            group_id=group.id,
            user_id=user_id
        )
        db.session.add(member)
        db.session.commit()

        return jsonify({'message': 'Group created successfully', 'group_id': group.id}), 201
    except Exception as e:
        return jsonify({'error': 'Failed to create group', 'details': str(e)}), 400

# Helper function to get the current user ID from the JWT token
def get_current_user_id():
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        return None  # No token found

    try:
        token = auth_header.split(" ")[1]
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        return decoded_token['user_id']
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired, please log in again'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token, please log in again'}), 401

# Profile update route
@app.route('/api/profile', methods=['PUT'])
@login_required
def update_profile(user_id):
    current_user_id = get_current_user_id()  # Call the helper function
    if not current_user_id:
        return jsonify({'error': 'Unauthorized'}), 401


    data = request.get_json()
    full_name = data.get('full_name')
    bio = data.get('bio')

    if not full_name or not bio:
        return jsonify({'message': 'Full Name and Bio are required'}), 400

    # Logic to update the user's profile in the database
    user = User.query.get(current_user_id)
    user.full_name = full_name
    user.bio = bio
    db.session.commit()

    return jsonify({'message': 'Profile updated successfully!'}), 200

@app.route('/api/profile', methods=['GET'])
@login_required
def get_profile(user_id):
    # Retrieve the user's profile from the database
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    # Return the profile data (e.g., name and bio)
    return jsonify({
        'username': user.username,
        'full_name':user.full_name,
        'bio':user.bio
    }), 200


@app.route('/')
def homepage():
    return send_from_directory(app.template_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True,port=5000)