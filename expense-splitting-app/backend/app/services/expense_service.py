from ..models import Expense, GroupMember
from .. import db

class ExpenseService:

    @staticmethod
    def add_expense(user_id, amount, description, group_id):

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
            raise ValueError('Amount and group are required.')

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
            user_id=user_id  # Add user_id to associate with the expense
        )
        
        db.session.add(expense)
        db.session.commit()

        # Implement a fucntion to Create expense splits

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