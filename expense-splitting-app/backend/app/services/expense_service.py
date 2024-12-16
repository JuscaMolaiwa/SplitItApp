from enum import Enum
import logging
from typing import Any, Dict, List, Union
from urllib import request
from ..models import Expense, ExpenseSplit, Group, GroupMember, User
from .. import db
import logging
from sqlalchemy.orm.exc import NoResultFound # type: ignore

class SplitType(Enum):
    EQUAL = "equal"
    PERCENTAGE = "percentage"
    CUSTOM_AMOUNT = "custom_amount"

CURRENCY_SYMBOLS = {
    "ZAR": "R",
    "USD": "$",
    "EUR": "€",
    "GBP": "£"
    }

class ExpenseService:

    @staticmethod
    def get_participants_user_ids(group_id: int) -> List[Dict[str, Any]]:
        """Fetch user_ids of participants in a group."""
        group = Group.query.get(group_id)
        if not group:
            raise ValueError("Group not found")

        # Create a list of participants with user_id and name
        user_ids = [{'user_id': user.id, 'name': user.username} for user in group.members]
        return user_ids


    @staticmethod
    def add_expense(
        user_id: int, 
        amount: Union[int, float, str], 
        description: str, 
        group_id: int, 
        split_type: str,
        paid_by: str,
        currency: str,
        participants: List[Dict[str, Any]],
        ) -> Expense:
        """
        Create an expense with split
        """

        """Comprehensive input validation"""
        # User ID validation
        if not user_id or not isinstance(user_id, int):
            raise ValueError("User not found")
        
        # Amount validation
        try:
            # Convert amount to float if it's a string
            if isinstance(amount, str):
                amount = float(amount)
            
            # Validate amount is a number and positive
            if not isinstance(amount, (int, float)) or amount <= 0:
                raise ValueError("Invalid amount")
        except (TypeError, ValueError):
            raise ValueError("Amount must be a valid positive number")
        
        # Description validation
        if not description or not isinstance(description, str):
            raise ValueError("Invalid description")
        
        # Check for duplicate description in the same group
        existing_expense = Expense.query.filter_by(group_id=group_id, description=description).first()
        if existing_expense:
            raise ValueError("Duplicate description found in the same group")
        
        # Group ID validation
        if not group_id or not isinstance(group_id, int):
            raise ValueError("Invalid group ID")
        
        # Split type validation
        if not split_type or split_type.lower() not in ['equal', 'percentage', 'custom_amount']:
            raise ValueError("Invalid split type")
        
        # Paid by validation
        if not paid_by or not isinstance(paid_by, str):
            raise ValueError("Invalid paid by")
        
        # Currency validation
        if not currency or not isinstance(currency, str):
            raise ValueError("Currency is required")

        valid_currencies = set(CURRENCY_SYMBOLS.keys())
        if currency.upper() not in valid_currencies:
            raise ValueError("Invalid currency. Must be a valid ISO 4217 code.")
        
        # Fetch participants from the group
        participants = ExpenseService.get_participants_user_ids(group_id)
        
        # Participants validation
        if not participants or not isinstance(participants, list):
            raise ValueError("Invalid participants")
        
        for participant in participants:
            if not isinstance(participant, dict):
                raise ValueError("Each participant must be a dictionary")
            
            if 'user_id' not in participant or 'name' not in participant:
                raise ValueError("Participant must have user_id and name")
            
             # Ensure each user_id exists in the users table
            try:
                user = User.query.filter_by(id=participant['user_id']).one()
            except NoResultFound:
                raise ValueError(f"User with ID {participant['user_id']} not found")
            

        # Check if the user is a member of the group
        is_member = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
        if not is_member:
            raise PermissionError('User is not part of the selected group.')
        
        try:
            # Create a new expense
            expense = Expense(
                amount=amount,
                description=description,
                group_id=group_id,
                user_id=user_id,  # Add user_id to associate with the expense
                split_type=split_type,
                paid_by=paid_by,
                currency=currency.upper(),
            )

            db.session.add(expense)
            db.session.commit()

            logging.debug(f"Calling calculate_splits with data: {{'split_type': split_type, 'amount': amount, 'participants': participants}}")

            # Call calculate_splits function to generate splits
            splits = ExpenseService.calculate_splits({
                'split_type': split_type,
                'amount': amount,
                'participants': participants,
            })

            # Iterate over each split and create an ExpenseSplit for each participant
            for split in splits:
                expense_split = ExpenseSplit(
                    expense_id=expense.id,
                    user_id=split['user_id'],
                    amount=split['amount'],
                    name=split['name']
                )
                db.session.add(expense_split)

            db.session.commit()
            return expense
        
        except Exception as e:
            db.session.rollback()
            logging.error(f"Failed to add expense: {str(e)}")
            raise

    @staticmethod
    def get_expenses(user_id, group_id, page=1, per_page=10):
        # Check if the user belongs to the group
        is_member = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
        if not is_member:
            raise PermissionError('User is not part of the selected group.')

        # Query and paginate expenses for the group
        expenses_query = Expense.query.filter_by(group_id=group_id)
        paginated_expenses = expenses_query.paginate(page=page, per_page=per_page, error_out=False)

        return paginated_expenses

    
    
    # A function to calculate splits based on the split type
    @staticmethod
    def calculate_splits(split_data: Dict) -> List[Dict]:
        """Calculate splits based on split type"""
        split_type = split_data.get('split_type').lower()
        amount = split_data['amount']
        participants = split_data.get('participants', [])

        if not amount or amount <= 0:
            raise ValueError("Invalid amount for split calculation")

        if split_type == SplitType.EQUAL.value:
            splits = ExpenseService._calculate_equal_split(amount, participants)

        elif split_type == SplitType.PERCENTAGE.value:
            splits = ExpenseService._calculate_percentage_split(amount, participants)
        
        elif split_type == SplitType.CUSTOM_AMOUNT.value:
            splits = ExpenseService._calculate_custom_amount_split(amount, participants)
        
        else:
            raise ValueError("Invalid split type")
        
        # Add the 'name' to each split
        for i, participant in enumerate(participants):
            splits[i]['name'] = participant['name']  # Add the name of the participant to the split

        logging.debug(f"Calculated splits: {splits}")

        return splits
    
    # Function to calculate equal split
    @staticmethod
    def _calculate_equal_split(amount: float, participants: List[Dict]) -> List[Dict]:
        """Calculate equal split"""
        per_person_amount = amount / len(participants)
        
        return [
            {**participant, 'amount': per_person_amount} 
            for participant in participants
        ]
    

    # Function to calculate percentage split
    @staticmethod
    def _calculate_percentage_split(amount: float, participants: List[Dict]) -> List[Dict]:
        """Calculate percentage split"""
        total_percentage = sum(p.get('percentage', 0) for p in participants)
        if total_percentage != 100:
            raise ValueError("Total percentage must equal 100%")
        return [
            {
                **participant,
                'amount': round(amount * (participant['percentage'] / 100), 2)
            }
            for participant in participants
        ]

    # Function to calculate custom split
    @staticmethod
    def _calculate_custom_amount_split(amount: float, participants: List[Dict]) -> List[Dict]:
        """Calculate and return custom split amounts for each participant"""
        total_custom_amount = sum(participant.get('amount', 0) for participant in participants)
        
        if total_custom_amount != amount:
            raise ValueError("The total of custom amounts must match the total amount.")

        # Assign custom amounts to each participant
        return [
            {**participant, 'amount': participant.get('amount', 0)}
            for participant in participants
        ]
    
    # Function to add currency to the amount
    def format_amount_with_currency(amount: Union[int, float], currency: str) -> str:
        """
        Format the amount with the corresponding currency symbol.
        """
        currency_symbol = CURRENCY_SYMBOLS.get(currency.upper(), currency.upper())  # Default to the currency code
        return f"{currency_symbol}{amount:.2f}"
    
    

