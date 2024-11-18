from flask import Blueprint, request, jsonify # type: ignore
from ..services.group_service import GroupService  # Import the GroupService
from flask_jwt_extended import jwt_required # type: ignore
from ..utils.auth_utils import get_current_user_id, login_required

bp = Blueprint('groups', __name__)

@bp.route('/api/groups', methods=['POST'])
@login_required
@jwt_required()
def create_group(user_id):
    user_id = get_current_user_id()  # Get the current logged-in user's ID
    data = request.get_json() if request.is_json else request.form

    group_name = data.get('name')
    description = data.get('description', '')

    try:
        group = GroupService.create_group(user_id, group_name, description)
        return jsonify({'message': 'Group created successfully', 'group_id': group.id}), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 409
    except Exception as e:
        print(f"Error creating group: { str(e)}")  # Log the error
        return jsonify({'error': 'Failed to create group', 'details': str(e)}), 400

@bp.route('/api/groups', methods=['GET'])
@login_required
@jwt_required()
def get_groups(user_id):
    user_id = get_current_user_id()

    try:
        groups = GroupService.get_user_groups(user_id)
        return jsonify({'groups': groups}), 200
    except PermissionError as pe:
        return jsonify({'error': str(pe)}), 403
    except Exception as e:
        print(f"Error fetching groups: {str(e)}")  # Log the error
        return jsonify({'error': 'Failed to fetch groups', 'details': str(e)}), 400

@bp.route('/api/groups/join', methods=['POST'])
@login_required
@jwt_required()
def join_group(user_id):
    current_user_id = get_current_user_id()
    data = request.get_json()
    unique_code = data.get('unique_code')

    try:
        GroupService.join_group(unique_code, current_user_id)
        return jsonify({"success": True, "message": "Successfully joined the group."}), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        print(f"Error joining group: {str(e)}")  # Log the error
        return jsonify({'error': 'Failed to join group', 'details': str(e)}), 400

@bp.route('/api/groups/members', methods=['GET'])
@login_required
@jwt_required()
def get_group_members(user_id):
    group_id = request.args.get('group_id', type=int)

    try:
        members = GroupService.get_group_members(group_id)
        return jsonify({"group_id": group_id, "members": members}), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        print(f"Error fetching group members: {str(e)}")  # Log the error
        return jsonify({'error': 'Failed to fetch group members', 'details': str(e)}), 400