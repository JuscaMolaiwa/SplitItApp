import React from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import GroupCreation from './GroupCreation';
import ProfileManagement from './ProfileManagement';

const UserSystemApp = () => {
  return (
    <div className="max-w-md mx-auto py-8">
      <nav className="mb-8">
        <ul className="flex space-x-4">
          <li>
            <Link to="/app/group" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Group Creation
            </Link>
          </li>
          <li>
            <Link to="/app/profile" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Profile Management
            </Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="group" element={<GroupCreation />} />
        <Route path="profile" element={<ProfileManagement />} />
      </Routes>
    </div>
  );
};

export default UserSystemApp;
