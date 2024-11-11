from flask import Blueprint, request, jsonify # type: ignore
from ..models import Group, GroupMember
from .. import db

bp = Blueprint('groups', __name__)

@bp.route('/api/groups', methods=['POST'])
def create_group():
    data = request.get_json()
    group = Group(name=data['name'], description=data.get('description', ''), created_by=data['user_id'])
    db.session.add(group)
    db.session.commit()
    return jsonify({'message': 'Group created successfully', 'group_id': group.id}), 201

@bp.route('/api/groups/<int:group_id>', methods=['GET'])
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    return jsonify({
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'created_by': group.created_by
    }), 200