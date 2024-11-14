import React, { useState, useEffect } from 'react';

const ProfileManagement = () => {
  const [full_name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profile_image_url, setProfileImage] = useState(''); // To store the image URL or image data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch existing profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get the token from local storage (ensure that the user is logged in)
        const token = localStorage.getItem('auth_token');
        if (!token) {
          setError('Authentication token is missing!');
          return;
        }

        const response = await fetch('http://127.0.0.1:5000/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();

        // Prepopulate the fields with existing data
        setName(data.full_name || ''); // Use empty string if no name
        setBio(data.bio || ''); // Use empty string if no bio
        setProfileImage(data.profile_image_url || ''); // Use empty string if no profile image
    
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError(error.message); // Set error to be displayed in the UI
      }
    };

    fetchProfile();
  }, []); // Empty dependency array ensures this runs once on mount

  // Update the user's profile
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error on each update attempt

      // Get the token from local storage (ensure that the user is logged in)
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setError('Authentication token is missing!');
        return;
      }

      // Prepare the form data for the profile update
      const formData = new FormData();
      formData.append('full_name', full_name);
      formData.append('bio', bio);

      // If there's a profile image, append it to the form data
      if (profile_image_url) {
        formData.append('profile_image', profile_image_url); // This should be the file object or image data
      }

      const response = await fetch('http://127.0.0.1:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData, // Sending FormData allows us to send files
      });

      if (!response.ok) {
        throw new Error('Profile update failed!');
      }

      // On success, you can handle the response (e.g., show a success message, redirect, etc.)
      const data = await response.json();
      console.log('Profile updated:', data);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message); // Set error to be displayed in the UI
    } finally {
      setLoading(false);
    }
  };

  // Handle the profile image change (when the user selects an image)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file); // Save the selected file
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Profile Management</h2>

      {/* Name Input */}
      <div>
        <label htmlFor="full_name" className="block font-medium">Full Name</label>
        <input
          id="full_name"
          type="text"
          value={full_name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      
      {/* Bio Input */}
      <div>
        <label htmlFor="bio" className="block font-medium">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Profile Image Input */}
      <div>
        <label htmlFor="profile_image_url" className="block font-medium">Profile Image</label>
        <input
          id="profile_image_url"
          type="file"
          onChange={handleImageChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      {/* Display any error messages */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Update Button */}
      <button
        onClick={handleProfileUpdate}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
        disabled={loading} // Disable button during API call
      >
        {loading ? 'Updating...' : 'Update Profile'}
      </button>
    </div>
  );
};

export default ProfileManagement;
