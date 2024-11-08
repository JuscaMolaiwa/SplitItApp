import React, { useState } from 'react';

// Main App Component
const UserSystemApp = () => {
    return (
      <div className="max-w-md mx-auto py-8">
        <nav className="mb-8">
          <ul className="flex space-x-4">
            <li><a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">User Registration</a></li>
            <li><a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">Group Creation</a></li>
            <li><a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">Profile Management</a></li>
          </ul>
        </nav>
  
        <UserRegistration />
        <GroupCreation />
        <ProfileManagement />
      </div>
    );
  };
  
  export default UserSystemApp;