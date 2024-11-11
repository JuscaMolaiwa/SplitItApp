import logging
import os
from flask import Blueprint, request, jsonify # type: ignore
from ..models import GroupMember, User, Expense  # Ensure Expense is imported
from .. import db
from .auth import get_current_user_id, login_required
from flask_jwt_extended import jwt_required # type: ignore

bp = Blueprint('expenses', __name__)

def get_user_groups(user_id):
        # Query the groups the user belongs to through GroupMember
        return GroupMember.query.filter_by(user_id=user_id).all()


@bp.route('/api/expenses', methods=['POST'])
@login_required
@jwt_required()
def add_expense(user_id):
    user_id = get_current_user_id()  # Get the current logged-in user's ID

    data = request.get_json()
    print(f"Received data: {data}")  # Debug log

    amount = data.get('amount')
    description = data.get('description')
    group_id = data.get('group_id')  # Expect group_id in the request

    # Validate required fields
    if amount is None or group_id is None:
        return jsonify({'error': 'Amount, category, and group are required.'}), 400
    
    try:
        amount = float(amount)  # Convert amount to float
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid amount. Must be a number."}), 422
    
    # Validate amount
    if amount <= 0:
        return jsonify({'error': 'Amount must be greater than 0.'}), 400
    
    # Get user's active groups
    user_groups = get_user_groups(user_id)

    # Check if the user has any active groups
    if not user_groups:
        return jsonify({"error": "User has no active groups."}), 403

    # Check if the user is a member of the group
    is_member = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not is_member:
        return jsonify({'error': 'User is not part of the selected group.'}), 403

    try:
        # Create a new expense
        expense = Expense(
            amount=amount,
            description=description,
            group_id=group_id,
            user_id=user_id  # Add user_id to associate with the expense
        )
        db.session.add(expense)
        db.session.commit()
        
        return jsonify({'message': 'Expense added successfully', 'expense_id': expense.id}), 201
    except Exception as e:
        db.session.rollback()  # Rollback session in case of error
        return jsonify({'error': 'Failed to add expense', 'details': str(e)}), 400
    

@bp.route('/api/expenses', methods=['GET'])
@login_required
@jwt_required()
def get_expenses(user_id):
    user_id = get_current_user_id()  # Get the current logged-in user's ID

    # Get the group_id parameter from the query string
    group_id = request.args.get('group_id')  # The group_id to filter the expenses by (if provided)

    if not group_id or not group_id.isdigit():
        return jsonify({'error': 'A valid Group ID is required to fetch expenses.'}), 400

    group_id = int(group_id)  # Convert to integer after validation

    # Check if the user belongs to the group
    is_member = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not is_member:
        return jsonify({'error': 'User is not part of the selected group.'}), 403

    try:
        # Query the expenses for the group
        expenses = Expense.query.filter_by(group_id=group_id).all()

        if not expenses:
            return jsonify({'message': 'No expenses found for this group.'}), 404
        
        # Format the result into a list of dictionaries to return as JSON
        expenses_data = [{
            'id': expense.id,
            'amount': expense.amount,
            'description': expense.description,
            'created_at': expense.created_at,
            'user_id': expense.user_id
        } for expense in expenses]

        return jsonify({'expenses': expenses_data, 'total_expenses': len(expenses)}), 200

    except Exception as e:
        logging.error(f"Failed to retrieve expenses: {str(e)}")  # Log the error
        return jsonify({'error': 'Failed to retrieve expenses', 'details': str(e)}), 400
