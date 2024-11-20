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

    # Extract query parameters
    group_id = request.args.get('group_id', type=int)
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('per_page', default=10, type=int)  # Default 10 items per page
    group_id = request.args.get('group_id', type=int)

    if not group_id:
        return jsonify({'error': 'Group ID is required'}), 400

    try:
        # Use the ExpenseService to get expenses with pagination
        paginated_expenses = ExpenseService.get_expenses(
            user_id=user_id, group_id=group_id, page=page, per_page=per_page
        )

        # Serialize expenses for the response
        expense_list = [
            {
                'id': expense.id,
                'amount': expense.amount,
                'description': expense.description,
                'group_id': expense.group_id,
                'split_type': expense.split_type,
                'paid_by': expense.paid_by,
                'participants': [
                    {
                        'user_id': split.user_id,
                        'amount': split.amount,
                        'name': split.name
                    }
                    for split in expense.expense_splits
                ]
            }
            for expense in paginated_expenses.items
        ]

        # Response with pagination metadata
        return jsonify({
            'expenses': expense_list,
            'total': paginated_expenses.total,
            'pages': paginated_expenses.pages,
            'current_page': paginated_expenses.page
        }), 200
    except PermissionError as pe:
        return jsonify({'error': str(pe)}), 403
    except Exception as e:
        logging.error(f"Failed to fetch expenses: {str(e)}")
        return jsonify({'error': 'Failed to fetch expenses', 'details': str(e)}), 400
