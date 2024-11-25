import os
from werkzeug.utils import secure_filename # type: ignore
from ..models import User
from .. import db
from flask import current_app # type: ignore

class ProfileService:

    @staticmethod
    def get_user_profile(user_id):
        user = User.query.get_or_404(user_id)
        return {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'profile_image': user.profile_image,
            'bio': user.bio
        }

    @staticmethod
    def update_user_profile(current_user_id, full_name, bio, profile_image):
        user = User.query.get_or_404(current_user_id)

        # Update user profile fields 
        # these are the fields that are required to be filled
        user.full_name = full_name
        user.bio = bio

        # Handle profile image upload
        image_url = None
        if profile_image:
            if not ProfileService.allowed_file(profile_image.filename):
                raise ValueError("Invalid file type. Allowed types are: " + ", ".join(current_app.config['ALLOWED_EXTENSIONS']))

            filename = secure_filename(profile_image.filename)
            image_path = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            try:
                profile_image.save(image_path)  # Save the profile image
                image_url = f"/uploads/{filename}"  # Create the image URL
            except Exception as e:
                raise Exception('Failed to save the profile image: ' + str(e))

        if image_url:  # Update only if a new image was uploaded
            user.profile_image = image_url

        db.session.commit()  # Commit the changes to the database
        return user

    @staticmethod
    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']