import React, { useState } from 'react';

const ProfileManagement = () => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

      const response = await fetch('http://127.0.0.1:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, bio }),
      });

      if (!response.ok) {
        throw new Error('Profile update failed!');
      }

      // On success, you can handle the response (e.g., show a success message, redirect, etc.)
      const data = await response.json();
      console.log('Profile updated:', data);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.message); // Set error to be displayed in the UI
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Profile Management</h2>
      
      {/* Name Input */}
      <div>
        <label htmlFor="name" className="block font-medium">Name</label>
        <input
          id="name"
          type="text"
          value={name}
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
