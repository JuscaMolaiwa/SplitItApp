from flask import Blueprint, request, jsonify # type: ignore
from ..models import Group, GroupMember
from .. import db
from .auth import get_current_user_id, login_required
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt # type: ignore

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

    try:
        # Create a new group
        group = Group(
            name=group_name,
            description=data.get('description', ''),
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
                'id': group.id,
                'name': group.name,
                'description': group.description,
                'created_by': group.created_by
            })

    if not group_list:
        return jsonify({'error': 'You do not have permission to access these groups'}), 403

    return jsonify({'groups': group_list}), 200