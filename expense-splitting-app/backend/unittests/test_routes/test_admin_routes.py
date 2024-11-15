import unittest
from unittest.mock import patch, MagicMock
from flask import Flask, json # type: ignore
import jwt # type: ignore
import time
from app.routes.admin import bp  # Import the admin blueprint
from app.services.admin_service import AdminService

class TestAdminRoutes(unittest.TestCase):
    def setUp(self):
        """Set up the test client and any necessary configurations."""
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        
        # Register the blueprint
        self.app.register_blueprint(bp)
        
        # Create test client
        self.client = self.app.test_client()

    def _generate_test_token(self, user_id, role='admin'):
        """Helper method to generate a test JWT token."""
        payload = {
            'sub': user_id,
            'role': role,
            'exp': int(time.time()) + 3600  # Token valid for 1 hour
        }
        return jwt.encode(payload, self.app.config['SECRET_KEY'], algorithm='HS256')

    def test_promote_user_success(self):
        """Test successful user promotion to admin."""
        # Setup
        admin_token = self._generate_test_token(1)
        test_user_id = 2
        mock_result = {'message': 'User successfully promoted to admin'}

        # Mock the AdminService method
        with patch('app.routes.admin.AdminService.promote_user_to_admin') as mock_promote:
            mock_promote.return_value = mock_result

            # Send request
            response = self.client.post(f'/api/admin/users/{test_user_id}/promote', 
                                        headers={'Authorization': f'Bearer {admin_token}'})

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.json, mock_result)
        mock_promote.assert_called_once_with(test_user_id)

    def test_promote_user_failure(self):
        """Test user promotion failure."""
        # Setup
        admin_token = self._generate_test_token(1)
        test_user_id = 2
        error_message = 'User already an admin'

        # Mock the AdminService method
        with patch('app.routes.admin.AdminService.promote_user_to_admin') as mock_promote:
            mock_promote.side_effect = ValueError(error_message)

            # Send request
            response = self.client.post(f'/api/admin/users/{test_user_id}/promote', 
                                        headers={'Authorization': f'Bearer {admin_token}'})

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(response.json, {'error': error_message})

    def test_revoke_user_success(self):
        """Test successful revocation of admin privileges."""
        # Setup
        admin_token = self._generate_test_token(1)
        test_user_id = 2
        mock_result = {'message': 'Admin privileges revoked'}

        # Mock the AdminService method
        with patch('app.routes.admin.AdminService.revoke_user_admin_role') as mock_revoke:
            mock_revoke.return_value = mock_result

            # Send request
            response = self.client.post(f'/api/admin/users/{test_user_id}/revoke', 
                                        headers={'Authorization': f'Bearer {admin_token}'})

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.json, mock_result)
        mock_revoke.assert_called_once_with(test_user_id)

    def test_revoke_user_failure(self):
        """Test failure in revoking admin privileges."""
        # Setup
        admin_token = self._generate_test_token(1)
        test_user_id = 2
        error_message = 'User is not an admin'

        # Mock the AdminService method
        with patch('app.routes.admin.AdminService.revoke_user_admin_role') as mock_revoke:
            mock_revoke.side_effect = ValueError(error_message)

            # Send request
            response = self.client.post(f'/api/admin/users/{test_user_id}/revoke', 
                                        headers={'Authorization': f'Bearer {admin_token}'})

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertDictEqual(response.json, {'error': error_message})

    def test_delete_user_success(self):
        """Test successful user deletion."""
        # Setup
        admin_token = self._generate_test_token(1)
        test_user_id = 2
        mock_result = {'message': 'User successfully deleted'}

        # Mock the AdminService method
        with patch('app.routes.admin.AdminService.delete_user') as mock_delete:
            mock_delete.return_value = mock_result

            # Send request
            response = self.client.delete(f'/api/delete-user/{test_user_id}', 
                                          headers={'Authorization': f'Bearer {admin_token}'})

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.json, mock_result)
        mock_delete.assert_called_once_with(test_user_id)

    def test_delete_user_not_found(self):
        """Test user deletion when user is not found."""
        # Setup
        admin_token = self._generate_test_token(1)
        test_user_id = 2
        error_message = 'User not found'

        # Mock the AdminService method
        with patch('app.routes.admin.AdminService.delete_user') as mock_delete:
            mock_delete.side_effect = ValueError(error_message)

            # Send request
            response = self.client.delete(f'/api/delete-user/{test_user_id}', 
                                          headers={'Authorization': f'Bearer {admin_token}'})

        # Assertions
        self.assertEqual(response.status_code, 404)
        self.assertDictEqual(response.json, {'error': error_message})

    def test_non_admin_access_denied(self):
        """Test that non-admin users cannot access admin routes."""
        # Setup test cases for different admin routes
        routes_to_test = [
            ('/api/admin/users/2/promote', 'POST'),
            ('/api/admin/users/2/revoke', 'POST'),
            ('/api/delete-user/2', 'DELETE')
        ]

        # Generate a non-admin token
        non_admin_token = self._generate_test_token(1, role='user')

        # Test each route
        for route, method in routes_to_test:
            with self.subTest(route=route, method=method):
                # Send request based on method
                if method == 'POST':
                    response = self.client.post(route, 
                                                headers={'Authorization': f'Bearer {non_admin_token}'})
                elif method == 'DELETE':
                    response = self.client.delete(route, 
                                                  headers={'Authorization': f'Bearer {non_admin_token}'})

                # Assert forbidden access
                self.assertEqual(response.status_code, 403)
                self.assertIn('Admin access required', str(response.json))

if __name__ == '__main__':
    unittest.main()