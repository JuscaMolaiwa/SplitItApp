# unittests/test_profile_routes.py
import unittest
from unittest.mock import patch, MagicMock
from flask import Flask, json # type: ignore
import jwt # type: ignore
import time
import io
from app import db
from app.routes.profile import bp  # Import the profile blueprint
from app.services.profile_service import ProfileService

class TestProfileRoutes(unittest.TestCase):
    def setUp(self):
        """Set up the test client and any necessary configurations."""
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        self.app.config['TESTING'] = True
        self.app.config['UPLOAD_FOLDER'] = '/tmp'  # Temporary upload folder for testing
        
        # Register the blueprint
        self.app.register_blueprint(bp)
        
        # Create test client
        self.client = self.app.test_client()
        self.profile_service = ProfileService()

    def _generate_test_token(self, user_id):
        """Helper method to generate a test JWT token."""
        payload = {
            'sub': user_id,
            'exp': int(time.time()) + 3600  # Token valid for 1 hour
        }
        return jwt.encode(payload, self.app.config['SECRET_KEY'], algorithm='HS256')

    def test_get_profile_success(self):
        """Test successful profile retrieval."""
        # Setup
        test_user_id = 1
        token = self.get_current_user_id(test_user_id)
        mock_profile_data = {
            'user_id': test_user_id,
            'full_name': 'John Doe',
            'bio': 'Test bio',
            'profile_image': 'test_image.jpg'
        }

        # Mock the ProfileService method
        with patch('app.routes.profile.ProfileService.get_user_profile') as mock_get_profile:
            mock_get_profile.return_value = mock_profile_data

            # Send request
            response = self.client.get('/api/profile', 
                                       headers={'Authorization': f'Bearer {token}'})

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertDictEqual(response.json, mock_profile_data)
        mock_get_profile.assert_called_once_with(test_user_id)

    def test_get_profile_unauthorized(self):
        """Test profile retrieval without authorization."""
        # Send request without token
        response = self.client.get('/api/profile')

        # Assertions
        self.assertEqual(response.status_code, 401)
        self.assertIn('Authorization token is required', str(response.json))

    def test_update_profile_success(self):
        """Test successful profile update."""
        # Setup
        test_user_id = 1
        token = self._generate_test_token(test_user_id)
        
        # Prepare update data
        update_data = {
            'full_name': 'Updated Name',
            'bio': 'Updated bio'
        }

        # Mock the ProfileService method
        with patch('app.routes.profile.ProfileService.update_user_profile') as mock_update_profile:
            mock_update_profile.return_value = MagicMock(profile_image='updated_image.jpg')

            # Send request
            response = self.client.put('/api/profile', 
                                       headers={'Authorization': f'Bearer {token}'},
                                       json=update_data)

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertIn('Profile updated successfully', response.json['message'])
        self.assertEqual(response.json['profile_image_url'], 'updated_image.jpg')
        mock_update_profile.assert_called_once_with(
            test_user_id, 
            update_data['full_name'], 
            update_data['bio'], 
            None
        )

    def test_update_profile_with_image(self):
        """Test profile update with image upload."""
        # Setup
        test_user_id = 1
        token = self._generate_test_token(test_user_id)
        
        # Prepare update data with image
        update_data = {
            'full_name': 'Updated Name',
            'bio': 'Updated bio'
        }

        # Create a mock image file
        image_data = io.BytesIO(b'test image data')
        image_data.name = 'test_image.jpg'

        # Mock the ProfileService method
        with patch('app.routes.profile.ProfileService.update_user_profile') as mock_update_profile:
            mock_update_profile.return_value = MagicMock(profile_image='updated_image.jpg')

            # Send request with multipart/form-data
            response = self.client.put('/api/profile', 
                                       headers={'Authorization': f'Bearer {token}'},
                                       data={
                                           **update_data,
                                           'profile_image': (image_data, 'test_image.jpg')
                                       },
                                       content_type='multipart/form-data')

        # Assertions
        self.assertEqual(response.status_code, 200)
        self.assertIn('Profile updated successfully', response.json['message'])
        mock_update_profile.assert_called_once()
        # Verify the image was passed to the service method

    def test_update_profile_missing_fields(self):
        """Test profile update with missing required fields."""
        # Setup
        test_user_id = 1
        token = self._generate_test_token(test_user_id)
        
        # Prepare incomplete update data
        update_data = {
            'full_name': 'Updated Name'
            # Missing bio
        }

        # Send request
        response = self.client.put('/api/profile', 
                                   headers={'Authorization': f'Bearer {token}'},
                                   json=update_data)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertIn('Full Name and Bio are required', str(response.json))

    def test_update_profile_service_error(self):
        """Test profile update with service layer error."""
        # Setup
        test_user_id = 1
        token = self._generate_test_token(test_user_id)
        
        # Prepare update data
        update_data = {
            'full_name': 'Updated Name',
            'bio': 'Updated bio'
        }

        # Mock the ProfileService method to raise an error
        with patch('app.routes.profile.ProfileService.update_user_profile') as mock_update_profile:
            mock_update_profile.side_effect = ValueError('Invalid profile data')

            # Send request
            response = self.client.put('/api/profile', 
                                       headers={'Authorization': f'Bearer {token}'},
                                       json=update_data)

        # Assertions
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid profile data', str(response.json))

    def test_uploaded_file_route(self):
        """Test the file upload route."""
        # This test assumes you have a way to mock send_from_directory
        with patch('app.routes.profile.send_from_directory') as mock_send:
            mock_send.return_value = 'File content'
            
            # Send request to retrieve a file
            response = self.client.get('/uploads/test_image.jpg')
            
            # Verify send_from_directory was called with correct arguments
            mock_send.assert_called_once_with(
                self.app.config['UPLOAD_FOLDER'], 
                'test_image.jpg'
            )

    def tearDown(self):
        """Tear down the test database."""
        db.session.remove()
        db.drop_all()
        self.app_context.pop()

if __name__ == '__main__':
    unittest.main()