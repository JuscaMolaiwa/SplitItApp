import React, { useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import GroupCreation from './GroupCreation';
import ProfileManagement from './ProfileManagement';
import CreateExpense from './CreateExpenses';
import GroupMembers from './GroupMembers'; 
import ExpenseManager from './ExpenseManager';
import JoinGroupForm from './JoinGroupForm';

const UserSystemApp = ({ onLogout }) => {
  const [activeGroupId, setActiveGroupId] = useState(null); // State for the active group
  const [showExpenseManager, setShowExpenseManager] = useState(false); // State to control ExpenseManager visibility
  const navigate = useNavigate(); // To navigate after logout

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    onLogout();
    navigate('/'); // Redirect to the login page after logging out
  };

  const handleGroupCreation = (groupId) => {
    setActiveGroupId(groupId); // Set the active group when created
  };

  const handleExpenseCreated = () => {
    console.log('Expense has been created!');
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold">User System</h1>
        <div className="flex space-x-4">
          <Link to="/profile" className="hover:underline">Profile</Link>
          <Link to="/groups" className="hover:underline">Groups</Link>
          <Link to="/expenses" className="hover:underline">Expenses</Link>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm">
            Logout
          </button>
        </div>
      </nav>
      <Routes>
        <Route path="group" element={<GroupCreation onGroupCreation={handleGroupCreation} />} />
        <Route path="profile" element={<ProfileManagement />} />
        <Route 
          path="create-expense" 
          element={
            <>
              <CreateExpense groupId={activeGroupId} onExpenseCreated={handleExpenseCreated} />
              {showExpenseManager && (
                <ExpenseManager groupId={activeGroupId} onClose={handleExpenseManagerClose} />
              )}
            </>
          } 
        />
        <Route path="/groups/:groupId/members" element={<GroupMembers />} />
      </Routes>
    </div>
  );
};

export default UserSystemApp;
