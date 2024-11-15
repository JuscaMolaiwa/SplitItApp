import unittest
from unittest.mock import patch, MagicMock
from flask import Flask, json # type: ignore
import jwt # type: ignore
from app.routes.user import bp  # Import the blueprint to test
from app.routes.auth import UserService  # Import UserService from auth route

class TestUserRoutes(unittest.TestCase):
    def setUp(self):
        """Set up the test client and any necessary configurations."""
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        
        # Register the blueprint
        self.app.register_blueprint(bp)
        
        # Create test client
        self.client = self.app.test_client()

    def _generate_test_token(self, user_id, role='user'):
        """Helper method to generate a test JWT token."""
        payload = {
            'sub': user_id,
            'role': role,
            'exp': jwt.utils.make_timestamp() + 3600  # Token valid for 1 hour
        }
        return jwt.encode(payload, self.app.config['SECRET_KEY'], algorithm='HS256')

    def test_get_user_success(self):
        """Test the get_user endpoint when the user exists."""
        # Setup mock user and token
        mock_user_id = 1
        mock_token = self._generate_test_token(mock_user_id)
        mock_user_info = {'id': mock_user_id, 'name': 'John Doe', 'email': 'john@example.com'}

        # Mock the UserService method
        with patch('app.routes.user.UserService.get_user_by_id') as mock_get_user_by_id:
            mock_get_user_by_id.return_value = mock_user_info

            # Send request with token
            response = self.client.get('/api/user', 
                                       headers={'Authorization': f'Bearer {mock_token}'})

        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.json, {"user": mock_user_info})
        mock_get_user_by_id.assert_called_once_with(mock_user_id)

    def test_get_user_not_found(self):
        """Test the get_user endpoint when the user does not exist."""
        # Setup mock user and token
        mock_user_id = 1
        mock_token = self._generate_test_token(mock_user_id)

        # Mock the UserService method
        with patch('app.routes.user.UserService.get_user_by_id') as mock_get_user_by_id:
            mock_get_user_by_id.return_value = None

            # Send request with token
            response = self.client.get('/api/user', 
                                       headers={'Authorization': f'Bearer {mock_token}'})

        self.assertEqual(response.status_code, 404)
        self.assertDictEqual(response.json, {'error': 'User not found'})
        mock_get_user_by_id.assert_called_once_with(mock_user_id)

    def test_get_users_success(self):
        """Test the get_users endpoint when users are retrieved successfully."""
        # Setup mock user and token
        mock_user_id = 1
        mock_token = self._generate_test_token(mock_user_id)
        mock_users = [
            {'id': 1, 'name': 'John Doe', 'email': 'john@example.com'},
            {'id': 2, 'name': 'Jane Smith', 'email': 'jane@example.com'}
        ]

        # Mock the UserService method
        with patch('app.routes.user.UserService.get_all_users') as mock_get_all_users:
            mock_get_all_users.return_value = mock_users

            # Send request with token
            response = self.client.get('/api/users', 
                                       headers={'Authorization': f'Bearer {mock_token}'})

        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.json, {'users': mock_users})
        mock_get_all_users.assert_called_once()

    def test_unauthorized_access(self):
        """Test that unauthorized requests are handled correctly."""
        # Test get_user without authentication
        response = self.client.get('/api/user')
        self.assertEqual(response.status_code, 401)  # Unauthorized

        # Test get_users without authentication
        response = self.client.get('/api/users')
        self.assertEqual(response.status_code, 401)  # Unauthorized

    def test_expired_token(self):
        """Test handling of expired token."""
        # Create an expired token
        expired_payload = {
            'sub': 1,
            'exp': jwt.utils.make_timestamp() - 3600  # Expired token
        }
        expired_token = jwt.encode(expired_payload, self.app.config['SECRET_KEY'], algorithm='HS256')

        # Send request with expired token
        response = self.client.get('/api/user', 
                                   headers={'Authorization': f'Bearer {expired_token}'})

        self.assertEqual(response.status_code, 401)
        self.assertIn('Token expired', str(response.json))

    def test_admin_access(self):
        """Test admin-only access."""
        # Create an admin token
        admin_token = self._generate_test_token(1, role='admin')

        # Mock an admin-only endpoint (you'll need to add this to your routes)
        with patch('app.routes.user.UserService.get_all_users') as mock_get_all_users:
            mock_get_all_users.return_value = []

            # Send request with admin token
            response = self.client.get('/api/admin/users', 
                                       headers={'Authorization': f'Bearer {admin_token}'})

            # Adjust the assertion based on your actual implementation
            self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()