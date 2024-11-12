from flask import Blueprint, request, jsonify # type: ignore
from ..models import Group, GroupMember, User
from .. import db
from .auth import get_current_user_id, login_required
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt # type: ignore
from flask_jwt_extended import get_jwt_identity # type: ignore
import uuid  

bp = Blueprint('groups', __name__)

@bp.route('/api/groups', methods=['POST'])
@login_required
@jwt_required()
def create_group(user_id):
    
    user_id = get_current_user_id()  # Get the current logged-in user's ID

    data = request.get_json() if request.is_json else request.form

    # Ensure that the group name is provided in the request
    group_name = data.get('name')
    if not group_name:
        return jsonify({'error': 'Group name is required to create a group'}), 400
    
    # Check for duplicate group name
    existing_group = Group.query.filter_by(name=group_name).first()
    if existing_group:
        return jsonify({'error': 'A group with this name already exists.'}), 409 

    try:
        
        # Generate a unique code for the group
        unique_code = str(uuid.uuid4())  # Generate a UUID as a unique code

        # Create a new group
        group = Group(
            name=group_name,
            description=data.get('description', ''),
            unique_code=unique_code, 
            created_by=user_id
        )
        db.session.add(group)
        db.session.commit()

        # Add creator as a member of the group
        member = GroupMember(
            group_id=group.id,
            user_id=user_id
        )
        db.session.add(member)
        db.session.commit()

        return jsonify({'message': 'Group created successfully', 'group_id': group.id}), 201
    except Exception as e:
        print(f"Error creating group: {str(e)}")  # Log the error
        return jsonify({'error': 'Failed to create group', 'details': str(e)}), 400

@bp.route('/api/groups', methods=['GET'])
@login_required
@jwt_required()
def get_groups(user_id):

    user_id = get_current_user_id()

    groups = Group.query.filter_by(created_by=user_id).all()

    group_list = []
    
    # Create a set of group IDs where the user is a member
    user_group_ids = {member.group_id for member in GroupMember.query.filter_by(user_id=user_id).all()}

    for group in groups:
        # If the user is a member of the group or is the creator, add it to the list
        if group.id in user_group_ids or group.created_by == user_id:
            group_list.append({
                'group_id': group.id,
                'name': group.name,
                'description': group.description,
                'created_by': group.created_by,
                'unique_code': group.unique_code
            })

    if not group_list:
        return jsonify({'error': 'You do not have permission to access these groups'}), 403

    return jsonify({'groups': group_list}), 200

def add_user_to_group(user_id, group_id):
    # Check if the user is already a member of the group
    existing_member = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
    if existing_member:
        return existing_member 

    # Create a new GroupMember instance
    new_member = GroupMember(user_id=user_id, group_id=group_id)
    
    # Add the new member to the session and commit
    db.session.add(new_member)
    db.session.commit()
    
    return new_member

@bp.route('/api/groups/join', methods=['POST'])
@login_required
@jwt_required()
def join_group(user_id):
    current_user_id = get_current_user_id()
    data = request.get_json()
    unique_code = data.get('unique_code')

    group = Group.query.filter_by(unique_code=unique_code).first()
    if not group:
        return jsonify({"error": "Group not found."}), 404

    add_user_to_group(current_user_id, group.id)

    return jsonify({"success": True, "message": "Successfully joined the group."}), 200


@bp.route('/api/groups/members', methods=['GET'])
@login_required
@jwt_required()
def get_group_members(user_id):
    # Fetch the group to ensure it exists
    group_id = request.args.get('group_id', type=int)

    group = Group.query.get(group_id)
    if not group:
        return jsonify({"error": "Group not found."}), 404

    # Query to get members of the group
    members = (
        db.session.query(User)
        .join(GroupMember)
        .filter(GroupMember.group_id == group_id)
        .all()
    )

    # Create a list of member details to return
    member_list = [{"id": member.id, "username": member.username, "full_name": member.full_name} for member in members]

    return jsonify({"group_id": group_id, "members": member_list}), 200