from enum import Enum
from typing import Any, Dict, List
from ..models import Expense, ExpenseSplit, GroupMember
from .. import db

class SplitType(Enum):
    EQUAL = "equal"
    PERCENTAGE = "percentage"
    EXACT = "exact"

class ExpenseService:

    @staticmethod
    def add_expense(
        user_id: int, 
        amount: float, 
        description: str, 
        group_id: int, 
        split_type: str, 
        participants: List[Dict[str, Any]]
        ) -> Expense:

        """
        Create an expense with split
        
        :param user_id: The ID of the user creating the expense.
        :param total_amount: The total amount of the expense.
        :param description: A description of the expense.
        :param split_type: The type of split (e.g., EQUAL, PERCENTAGE, etc.).
        :param group_id: The group ID for the expense.
        :param participants: A list of names participating in the split.
        :param paid_by: The user who paid the total amount of the expense.
        :return: The created expense and its splits.
        """

        # Validate required fields
        if amount is None or group_id is None:
            raise ValueError('Amount and group ID are required.')

        try:
            amount = float(amount)  # Convert amount to float
        except (ValueError, TypeError):
            raise ValueError("Invalid amount. Must be a number.")

        # Validate amount
        if amount <= 0:
            raise ValueError('Amount must be greater than 0.')

        # Check if the user is a member of the group
        is_member = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
        if not is_member:
            raise PermissionError('User is not part of the selected group.')
        
        

        # Create a new expense
        expense = Expense(
            amount=amount,
            description=description,
            group_id=group_id,
            user_id=user_id,  # Add user_id to associate with the expense
            split_type=split_type
        )
        
        db.session.add(expense)
        db.session.commit()

        # Implement a fucntion to Create expense splits
        splits = ExpenseService.calculate_splits({
            'split_type': split_type,
            'amount': amount,
            'participants': participants,
        })
        
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

    @staticmethod
    def get_expenses(user_id, group_id):
        # Check if the user belongs to the group
        is_member = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
        if not is_member:
            raise PermissionError('User is not part of the selected group.')

        # Query the expenses for the group
        expenses = Expense.query.filter_by(group_id=group_id).all()

        return expenses
    
    
    # A function to calculate splits based on the split type
    @staticmethod
    def calculate_splits(request_data: Dict) -> List[Dict]:
        """Calculate splits based on split type"""
        split_type = SplitType(request_data['split_type'])
        total_amount = request_data['amount']
        participants = request_data['participants']

        if split_type == SplitType.EQUAL.value:
            return ExpenseService._calculate_equal_split(total_amount, participants)
        
        elif split_type == SplitType.PERCENTAGE.value:
            return ExpenseService._calculate_percentage_split(total_amount, participants)
        
        elif split_type == SplitType.EXACT.value:
            return ExpenseService._calculate_exact_split(participants)
        
        raise ValueError("Invalid split type")

    # Function to calculate equal split
    @staticmethod
    def _calculate_equal_split(total_amount: float, participants: List[Dict]) -> List[Dict]:
        """Calculate equal split"""
        per_person_amount = total_amount / len(participants)
        
        return [
            {**participant, 'amount': per_person_amount} 
            for participant in participants
        ]

    # Function to calculate percentage split
    @staticmethod
    def _calculate_percentage_split(total_amount: float, participants: List[Dict]) -> List[Dict]:
        """Calculate percentage split"""
        return [
            {**participant, 'amount': total_amount * (participant.get('percentage', 0) / 100)} 
            for participant in participants
        ]

    # Function to calculate exact split
    @staticmethod
    def _calculate_exact_split(participants: List[Dict]) -> List[Dict]:
        """Return exact split amounts"""
        return participants