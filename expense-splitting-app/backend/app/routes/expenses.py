import logging
from typing import Dict
from flask import Blueprint, request, jsonify # type: ignore
from ..services.expense_service import ExpenseService  # Import the ExpenseService
from ..utils.auth_utils import get_current_user_id, login_required
from flask_jwt_extended import jwt_required # type: ignore

bp = Blueprint('expenses', __name__)

@bp.route('/api/expenses', methods=['POST'])
@login_required
@jwt_required()
def add_expense(user_id):
    user_id = get_current_user_id()  # Get the current logged-in user's ID

    split_data = request.get_json()
    #print(f"Received data: {split_data}")  # Debug log

    # Validate input data
    if not split_data:
        return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
    required_fields = [
        'amount', 'description', 'group_id', 
        'split_type', 'paid_by', 'participants'
    ]
        
    for field in required_fields:
        if field not in split_data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
        
    # Validate participants
    if not isinstance(split_data['participants'], list) or len(split_data['participants']) == 0:
        return jsonify({'error': 'Invalid or empty participants list'}), 400
    

    # Extract fields from the request body
    amount = split_data['amount']
    description = split_data['description']
    group_id = split_data['group_id']  # Expect group_id in the request
    split_type = split_data['split_type']
    paid_by = split_data['paid_by']
    participants = split_data.get('participants', [])

    try:
        # Add expense using the service
        expense = ExpenseService.add_expense(
            user_id, 
            amount, 
            description, 
            group_id, 
            split_type=split_type,
            paid_by=paid_by,
            participants=participants
        )
        return jsonify({'message': 'Expense added successfully', 'expense_id': expense.id}), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except PermissionError as pe:
        return jsonify({'error': str(pe)}), 403
    except Exception as e:
        logging.error(f"Failed to add expense: {str(e)}")  # Log the error
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

    try:
        expenses = ExpenseService.get_expenses(user_id, group_id)
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

    except PermissionError as perm:
        return jsonify ({'error': str(perm)}), 403
    except Exception as e:
        logging.error(f"Failed to retrieve expenses: {str(e)}")  # Log the error
        return jsonify({'error': 'Failed to retrieve expenses', 'details': str(e)}), 400