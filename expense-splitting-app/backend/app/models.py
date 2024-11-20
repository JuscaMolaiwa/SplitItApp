from . import db
from datetime import datetime
from sqlalchemy.orm import relationship  # type: ignore
from sqlalchemy import Column, Integer, String, ForeignKey  # type: ignore

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100))
    profile_image = db.Column(db.String(255))
    bio = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    role = db.Column(db.String(50), default='user')

class Group(db.Model):
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    unique_code = db.Column(db.String(10), unique=True, nullable=False)  # Unique code for joining
    description = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to expenses
    expenses = db.relationship('Expense', back_populates='group')
    members = db.relationship('User', secondary='group_members')

class GroupMember(db.Model):
    __tablename__ = 'group_members'
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

class Expense(db.Model):
    __tablename__ = 'expenses'
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id')) 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    split_type = db.Column(db.String(50), nullable=False)  

    # Relationship back to Group
    group = relationship('Group', back_populates='expenses')
    user = relationship('User', backref='expenses')

class Category(db.Model):
    __tablename__ = 'categories'  
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)

    def __repr__(self):
        return f'<Category {self.name}>'
    
class ExpenseSplit(db.Model):
    __tablename__ = 'expense_splits'
    id = db.Column(db.Integer, primary_key=True)
    expense_id = db.Column(db.Integer, db.ForeignKey('expenses.id'), nullable=False) 
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) 
    amount = db.Column(db.Float, nullable=False)
    name = db.Column(db.String(100), nullable=False)

    expense = db.relationship('Expense', backref='expense_splits') 