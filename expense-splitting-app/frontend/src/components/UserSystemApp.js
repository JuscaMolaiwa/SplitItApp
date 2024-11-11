import React, { useState } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import GroupCreation from './GroupCreation';
import ProfileManagement from './ProfileManagement';
import CreateExpense from './CreateExpenses'; 


const UserSystemApp = () => {
  const [activeGroupId, setActiveGroupId] = useState(null); // State for the active group

  const handleGroupCreation = (groupId) => {
    setActiveGroupId(groupId); // Set the active group when created
  };

  const handleExpenseCreated = () => {
    // Logic to handle after an expense is created, e.g., refresh data
    console.log('Expense has been created!');
  };

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
          <li>
            <Link to="/app/create-expense" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Create Expense
            </Link>
          </li>
        </ul>
      </nav>
      <Routes>
        <Route path="group" element={<GroupCreation onGroupCreation={handleGroupCreation} />} />
        <Route path="profile" element={<ProfileManagement />} />
        <Route path="create-expense" element={<CreateExpense groupId={activeGroupId} onExpenseCreated={handleExpenseCreated} />} />
      </Routes>
    </div>
  );
};

export default UserSystemApp;