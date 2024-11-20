from enum import Enum
import logging
from typing import Any, Dict, List, Union
from urllib import request
from ..models import Expense, ExpenseSplit, GroupMember
from .. import db
from flask import request, jsonify # type: ignore
import logging

class SplitType(Enum):
    EQUAL = "equal"
    PERCENTAGE = "percentage"
    EXACT = "exact"

class ExpenseService:

    @staticmethod
    def add_expense(
        user_id: int, 
        amount: Union[int, float, str], 
        description: str, 
        group_id: int, 
        split_type: str,
        paid_by: str,
        participants: List[Dict[str, Any]],
        ) -> Expense:

        """
        Create an expense with split
        """

        """Comprehensive input validation"""
        # User ID validation
        if not user_id or not isinstance(user_id, int):
            raise ValueError("Invalid user ID")
        
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
        
        # Group ID validation
        if not group_id or not isinstance(group_id, int):
            raise ValueError("Invalid group ID")
        
        # Split type validation
        if not split_type or split_type.lower() not in ['equal', 'percentage', 'exact']:
            raise ValueError("Invalid split type")
        
        # Paid by validation
        if not paid_by or not isinstance(paid_by, str):
            raise ValueError("Invalid paid by")
        
        # Participants validation
        if not participants or not isinstance(participants, list):
            raise ValueError("Invalid participants")
        
        for participant in participants:
            if not isinstance(participant, dict):
                raise ValueError("Each participant must be a dictionary")
            
            if 'user_id' not in participant or 'name' not in participant:
                raise ValueError("Participant must have user_id and name")

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
        
        elif split_type == SplitType.EXACT.value:
            splits = ExpenseService._calculate_exact_split(participants)
        
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
        return [
            {**participant, 'amount': amount * (participant.get('percentage', 0) / 100)} 
            for participant in participants
        ]

    # Function to calculate exact split
    @staticmethod
    def _calculate_exact_split(participants: List[Dict]) -> List[Dict]:
        """Return exact split amounts"""
        return participants