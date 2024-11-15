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

  const handleCreateExpenseClick = () => {
    setShowExpenseManager(true); // Show ExpenseManager when Create Expense is clicked
  };

  const handleExpenseManagerClose = () => {
    setShowExpenseManager(false); // Hide ExpenseManager
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <nav className="mb-8">
        <ul className="flex space-x-4">
          <li>
            <Link to="/app/group" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Group Management
            </Link>
          </li>
          <li>
            <Link to="/app/profile" className="text-indigo-600 hover:text-indigo-800 font-medium">
              Profile Management
            </Link>
          </li>
          <li>
            <Link 
              to="/app/create-expense" 
              className="text-indigo-600 hover:text-indigo-800 font-medium"
              onClick={handleCreateExpenseClick} // Show ExpenseManager when clicked
            >
              Expenses
            </Link>
          </li>
        </ul>
        <button onClick={handleLogout} className="mt-4 text-red-600">Logout</button>
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
        <Route path="groups/:groupId/members" element={<GroupMembers />} />
      </Routes>
    </div>
  );
};

export default UserSystemApp;