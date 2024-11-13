from ..models import Group, GroupMember, User
from .. import db
import uuid

class GroupService:

    @staticmethod
    def create_group(user_id, group_name, description=''):
        # Ensure that the group name is provided
        if not group_name:
            raise ValueError('Group name is required to create a group')

        # Check for duplicate group name
        existing_group = Group.query.filter_by(name=group_name).first()
        if existing_group:
            raise ValueError('A group with this name already exists.')

        # Generate a unique code for the group
        unique_code = str(uuid.uuid4())  # Generate a UUID as a unique code

        # Create a new group
        group = Group(
            name=group_name,
            description=description,
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

        return group

    @staticmethod
    def get_user_groups(user_id):
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
            raise PermissionError('You do not have permission to access these groups')

        return group_list

    @staticmethod
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

    @staticmethod
    def join_group(unique_code, user_id):
        group = Group.query.filter_by(unique_code=unique_code).first()
        if not group:
            raise ValueError("Group not found.")

        GroupService.add_user_to_group(user_id, group.id)

    @staticmethod
    def get_group_members(group_id):
        # Query to get members of the group
        members = (
            db.session.query(User)
            .join(GroupMember)
            .filter(GroupMember.group_id == group_id)
            .all()
        )

        # Create a list of member details to return
        member_list = [{"id": member.id, "username": member.username, "full_name": member.full_name} for member in members]
        return member_list