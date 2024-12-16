import unittest
from unittest.mock import patch, MagicMock
from flask import Flask, json # type: ignore
import jwt # type: ignore
import time
from flask import Flask, json # type: ignore
from flask_jwt_extended import JWTManager, create_access_token, jwt_required # type: ignore
from app.services.group_service import GroupService
from app.routes.profile import bp 
from app import db

class TestGroupRoutes(unittest.TestCase):
    def setUp(self):
        """Set up the test client and any necessary configurations."""
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        self.app.config['TESTING'] = True

        # Register the blueprint
        self.app.register_blueprint(bp)

        ## Create test client
        self.client = self.app.test_client()
        self.group_service = GroupService()

    def _generate_test_token(self, user_id):
        """Helper method to generate a test JWT token."""
        payload = {
            'sub': user_id,
            'exp': int(time.time()) + 3600  # Token valid for 1 hour
        }
        return jwt.encode(payload, self.app.config['SECRET_KEY'], algorithm='HS256')

    def _prepare_auth_headers(self, user_id):
        """
        Prepare authentication headers for a test request.
        
        Args:
            user_id (int): The user ID to generate token for
        
        Returns:
            dict: Headers with JWT token
        """
        token = self._generate_test_token(user_id)
        return {'Authorization': f'Bearer {token}'}

    def test_create_group_success(self):
        """Test successful group creation."""
        # Setup
        test_user_id = 1
        token = self.get_current_user_id(test_user_id)
        
        # Mock GroupService method
        group_data = {'id': 1, 'name': 'Test Group', 'description': 'Test Description'}
        with patch('app.routes.groups.GroupService.create_group') as mock_create_group:
            mock_create_group.return_value = MagicMock(**group_data)

            # Prepare data for group creation
            group_payload = {'name': 'Test Group', 'description': 'Test Description'}

            # Send request to create group
            response = self.client.post('/api/groups', 
                                       headers={'Authorization': f'Bearer {token}'})
           

        # Assertions
        print(f"Response data: {response.get_json()}")  # Debug print
        self.assertEqual(response.status_code, 201)
        response_json = response.get_json()
        self.assertIn('message', response_json)
        self.assertIn('Group created successfully', response_json['message'])
        self.assertEqual(response_json.get('group_id'), 1)

    def test_create_group_error(self):
        """Test group creation failure."""
        test_user_id = 1

        # Mock GroupService method to raise an error
        with patch('app.routes.groups.GroupService.create_group') as mock_create_group:
            mock_create_group.side_effect = ValueError('Group name already exists')

            # Prepare data for group creation
            group_payload = {'name': 'Test Group', 'description': 'Test Description'}

            # Send request to create group
            response = self.client.post(
                '/api/groups',
                headers=self._prepare_auth_headers(test_user_id),
                json=group_payload
            )

        # Assertions
        print(f"Response data: {response.get_json()}")  # Debug print
        self.assertEqual(response.status_code, 409)
        response_json = response.get_json()
        self.assertIn('error', response_json)
        self.assertIn('Group name already exists', response_json['error'])

    def test_get_groups_success(self):
        """Test successful retrieval of groups."""
        test_user_id = 1

        # Mock GroupService method
        mock_groups = [{'id': 1, 'name': 'Test Group', 'description': 'Test Description'}]
        with patch('app.routes.groups.GroupService.get_user_groups') as mock_get_groups:
            mock_get_groups.return_value = mock_groups

            # Send request to get groups
            response = self.client.get(
                '/api/groups',
                headers=self._prepare_auth_headers(test_user_id)
            )

        # Assertions
        print(f"Response data: {response.get_json()}")  # Debug print
        self.assertEqual(response.status_code, 200)
        response_json = response.get_json()
        self.assertIn('groups', response_json)
        self.assertEqual(len(response_json['groups']), 1)
        self.assertEqual(response_json['groups'][0]['name'], 'Test Group')

    def test_join_group_success(self):
        """Test successful joining of a group."""
        test_user_id = 1

        # Mock GroupService method
        with patch('app.routes.groups.GroupService.join_group') as mock_join_group:
            mock_join_group.return_value = None

            # Prepare data for joining group
            join_payload = {'unique_code': '12345'}

            # Send request to join group
            response = self.client.post(
                '/api/groups/join',
                headers=self._prepare_auth_headers(test_user_id),
                json=join_payload
            )

        # Assertions
        print(f"Response data: {response.get_json()}")  # Debug print
        self.assertEqual(response.status_code, 200)
        response_json = response.get_json()
        self.assertIn('message', response_json)
        self.assertIn('Successfully joined the group', response_json['message'])

    def test_join_group_error(self):
        """Test failure to join group with invalid code."""
        test_user_id = 1

        # Mock GroupService method to raise an error
        with patch('app.routes.groups.GroupService.join_group') as mock_join_group:
            mock_join_group.side_effect = ValueError('Invalid group code')

            # Prepare data for joining group
            join_payload = {'unique_code': 'invalid_code'}

            # Send request to join group
            response = self.client.post(
                '/api/groups/join',
                headers=self._prepare_auth_headers(test_user_id),
                json=join_payload
            )

        # Assertions
        print(f"Response data: {response.get_json()}")  # Debug print
        self.assertEqual(response.status_code, 404)
        response_json = response.get_json()
        self.assertIn('error', response_json)
        self.assertIn('Invalid group code', response_json['error'])

    def test_get_group_members_success(self):
        """Test successful retrieval of group members."""
        test_user_id = 1

        # Mock GroupService method
        mock_members = [{'user_id': 1, 'name': 'John Doe'}, {'user_id': 2, 'name': 'Jane Doe'}]
        with patch('app.routes.groups.GroupService.get_group_members') as mock_get_members:
            mock_get_members.return_value = mock_members

            # Send request to get group members
            response = self.client.get(
                '/api/groups/members?group_id=1',
                headers=self._prepare_auth_headers(test_user_id) )

        # Assertions
        print(f"Response data: {response.get_json()}")  # Debug print
        self.assertEqual(response.status_code, 200)
        response_json = response.get_json()
        self.assertEqual(response_json['group_id'], 1)
        self.assertEqual(len(response_json['members']), 2)

    def test_get_group_members_error(self):
        """Test failure to get group members."""
        test_user_id = 1

        # Mock GroupService method to raise an error
        with patch('app.routes.groups.GroupService.get_group_members') as mock_get_members:
            mock_get_members.side_effect = ValueError('Group not found')

            # Send request to get group members
            response = self.client.get(
                '/api/groups/members?group_id=999',
                headers=self._prepare_auth_headers(test_user_id)
            )

        # Assertions
        print(f"Response data: {response.get_json()}")  # Debug print
        self.assertEqual(response.status_code, 404)
        response_json = response.get_json()
        self.assertIn('error', response_json)
        self.assertIn('Group not found', response_json['error'])


    def tearDown(self):
        """Tear down the test database."""
        db.session.remove()
        db.drop_all()

if __name__ == '__main__':
    unittest.main()