import sqlite3
import unittest
from unittest.mock import patch, MagicMock
from flask import Flask, json , request, jsonify # type: ignore
from app.routes.auth import bp as auth_bp  # type: ignore
from app.services.user_service import UserService
from app import create_app 
import sys
import os
from app.config import TestingConfig
from app import create_app, db
from app.routes.auth import get_current_user_id, login_required

class AuthBlueprintTests(unittest.TestCase):
    def setUp(self):
        """Set up a Flask app for testing."""
        self.app = create_app(TestingConfig) 
        self.app.config['SECRET_KEY'] = 'SECRET_KEY'

        # Create the test database tables
        
        self.app_context = self.app.app_context()
        self.app_context.push()
        
        db.create_all()

        self.client = self.app.test_client()
        self.user_service = UserService()
        self.client = self.app.test_client()
    

    def test_get_current_user_id_valid_token(self):
        """Test getting user ID from a valid token."""
        with self.app.test_request_context(headers={'Authorization': 'Bearer test_token'}):
            with patch('app.routes.auth.jwt.decode') as mock_jwt_decode:
                # Simulate a valid decoded token
                mock_jwt_decode.return_value = {'sub': 123}
                
                user_id = get_current_user_id()
                self.assertEqual(user_id, 123)

    
    def test_get_current_user_id_no_token(self):
        """Test getting user ID with no token."""
        with self.app.test_request_context():
            # Ensure no Authorization header
            self.assertIsNone(request.headers.get('Authorization'))
            
            user_id = get_current_user_id()
            self.assertIsNone(user_id)

    def test_register_user_success(self):
        """Test successful user registration."""
        data = {
            'username': 'test_user',
            'email': 'test@example.com',
            'password': 'password123'
        }
        
        with patch('app.services.user_service.UserService.register_user') as mock_register:
            mock_register.return_value = MagicMock(id=1)
            
            response = self.client.post('/api/register', 
                data=json.dumps(data), 
                content_type='application/json'
            )
            
            self.assertEqual(response.status_code, 201)
            self.assertIn('User registered successfully', response.json['message'])

    def test_register_user_missing_fields(self):
        test_cases = [
            {'username': 'test_user'},  # Missing email and password
            {'email': 'test@example.com'},  # Missing username and password
            {'password': 'password123'}  # Missing username and email
            ]
        for data in test_cases:
            with self.subTest(data=data):
                response = self.client.post('/api/register', 
                    data=json.dumps(data), 
                    content_type='application/json'
                )
                self.assertEqual(response.status_code, 400)
                self.assertIn('Missing required fields', response.json['error'])


    def test_login_success(self):
        """Test successful login."""
        data = {
            'username': 'test_user', 
            'password': 'password123'
        }
        
        with patch('app.services.user_service.UserService.authenticate_user') as mock_auth, \
             patch('app.services.user_service.UserService.generate_jwt_token') as mock_token:
            
            # Create a mock user
            mock_user = MagicMock()
            mock_user.id = 1
            mock_user.role = 'user'
            
            # Setup mocks
            mock_auth.return_value = mock_user
            mock_token.return_value = 'test_jwt_token'
            
            response = self.client.post('/api/login', 
                data=json.dumps(data), 
                content_type='application/json'
            )
            
            self.assertEqual(response.status_code, 200)
            self.assertIn('token', response.json)

    def test_login_invalid_credentials(self):
        """Test login with invalid credentials."""
        data = {
            'username': 'test_user', 
            'password': 'wrong_password'
        }
        
        with patch('app.services.user_service.UserService.authenticate_user') as mock_auth:
            mock_auth.return_value = None
            
            response = self.client.post('/api/login', 
                data=json.dumps(data), 
                content_type='application/json'
            )
            
            self.assertEqual(response.status_code, 401)
            self.assertIn('Invalid credentials', response.json['error'])

    def test_admin_required_decorator(self):
        """Test admin_required decorator."""
        # Scenario 1: Admin access
        with patch('app.routes.auth.jwt.decode') as mock_jwt_decode:
            mock_jwt_decode.return_value = {'role': 'admin'}
            
            # Create a test route with admin_required decorator
            with self.app.test_client() as client:
                @self.app.route('/admin-test')
                def test_admin_view():
                    from app.routes.auth import admin_required
                    @admin_required
                    def protected_view():
                        return "Admin Access Granted"
                    return protected_view()

                # Simulate request with admin token
                headers = {'Authorization': 'Bearer admin_token'}
                response = client.get('/admin-test', headers=headers)
                self.assertEqual(response.status_code, 200)

        # Scenario 2: Non-admin access
        with patch('app.routes.auth.jwt.decode') as mock_jwt_decode:
            mock_jwt_decode.return_value = {'role': 'user'}
            
            with self.app.test_client() as client:
                headers = {'Authorization': 'Bearer user_token'}
                response = client.get('/admin-test', headers=headers)
                self.assertEqual(response.status_code, 403)

    def test_login_required_decorator(self):
        """Test login_required decorator."""
        # Mock the get_current_user_id function
        with patch('app.routes.auth.get_current_user_id') as mock_get_user_id:
            # Scenario 1: Authenticated access
            mock_get_user_id.return_value = 1

            @login_required
            def protected_view(user_id):
                return f"Access granted for user {user_id}"

            with self.app.test_request_context(headers={'Authorization': 'Bearer valid_token'}):
                result = protected_view()
                self.assertEqual(result, "Access granted for user 1")

            # Scenario 2: Unauthenticated access
            mock_get_user_id.return_value = None

            # Patch jsonify in the module where it is used
            with patch('app.routes.auth.jsonify') as mock_jsonify:
                mock_jsonify.return_value = MagicMock(status_code=401)

                @login_required
                def protected_view_unauth(user_id):
                    return jsonify({'error': 'Authentication required'}), 401

                with self.app.test_request_context():
                    result = protected_view_unauth()
                    
                    # Check that the response is a 401 unauthorized
                    self.assertEqual(result[1], 401)
                    mock_jsonify.assert_called_once_with({'error': 'Authentication required'})


    def tearDown(self):
        """Tear down the test database."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

if __name__ == '__main__':
    unittest.main()