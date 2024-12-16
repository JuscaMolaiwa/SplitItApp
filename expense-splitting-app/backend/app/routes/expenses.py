import logging
from typing import Dict
from flask import Blueprint, request, jsonify # type: ignore
from ..services.expense_service import ExpenseService  # Import the ExpenseService
from ..utils.auth_utils import get_current_user_id, login_required
from flask_jwt_extended import jwt_required # type: ignore
from ..models import Group, User

bp = Blueprint('expenses', __name__)

@bp.route('/api/expenses', methods=['POST'])
@login_required
@jwt_required()
def add_expense(user_id):
    user_id = get_current_user_id()  # Get the current logged-in user's ID

    split_data = request.get_json()
    if not split_data:
        return jsonify({'error': 'No data provided'}), 400
    
    # User ID validation
    if not user_id or not isinstance(user_id, int):
        return jsonify({'error': 'User not found'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 400
        
    paid_by = user.full_name 

    # Ensure that the creator is always included in the participants list
    creator_participant = {
        "user_id": user_id,
        "name": paid_by 
    }

    # Check if the creator is already included in participants
    participants = split_data.get('participants', [])
    if not any(p['user_id'] == user_id for p in participants):
        participants.append(creator_participant)

    split_data['paid_by'] = paid_by
        
    # Validate required field
    required_fields = [
        'amount', 'description', 'group_id', 
        'split_type', 'paid_by', 'participants'
    ]
        
    for field in required_fields:
        if field not in split_data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
        
    # Validate currency
    if 'currency' not in split_data or not isinstance(split_data['currency'], str):
        raise ValueError("Invalid or missing currency")
    if len(split_data['currency']) != 3 or not split_data['currency'].isalpha():
        raise ValueError("Currency must be a valid 3-letter ISO code")

        
    # Validate participants
    if not isinstance(split_data['participants'], list) or len(split_data['participants']) == 0:
        return jsonify({'error': 'Invalid or empty participants list'}), 400
    

    # Extract fields from the request body
    amount = split_data['amount']
    description = split_data['description']
    group_id = split_data['group_id']  # Expect group_id in the request
    split_type = split_data['split_type']
    paid_by = split_data['paid_by']
    currency = split_data['currency'] #Added curency
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
            participants=participants,
            currency = currency
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
    
    # Check if the group exists
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404

    try:
        # Use the ExpenseService to get expenses with pagination
        paginated_expenses = ExpenseService.get_expenses(
            user_id=user_id, group_id=group_id, page=page, per_page=per_page
        )

        # Serialize expenses for the response
        expense_list = [
            {
                'id': expense.id,
                'description': expense.description,
                'amount': ExpenseService.format_amount_with_currency(expense.amount, expense.currency),
                'currency': expense.currency,
                'group_id': expense.group_id,
                'split_type': expense.split_type,
                'paid_by': expense.paid_by,
                'participants': [
                    {
                        'user_id': split.user_id,
                        'amount': ExpenseService.format_amount_with_currency(split.amount, expense.currency),
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
