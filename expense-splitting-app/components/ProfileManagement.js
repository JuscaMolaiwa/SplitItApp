import React, { useState } from 'react';

// Profile Management
const ProfileManagement = () => {
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
  
    const handleProfileUpdate = () => {
      // Call backend API to update user profile
      // ...
    };
  
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Profile Management</h2>
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
        <div>
          <label htmlFor="bio" className="block font-medium">Bio</label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
        <button
          onClick={handleProfileUpdate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Update Profile
        </button>
      </div>
    );
  };

  export default ProfileManagement;