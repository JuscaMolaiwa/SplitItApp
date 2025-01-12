import React, { useState } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import GroupCreation from "./GroupCreation";
import ProfileManagement from "./ProfileManagement";
import CreateExpense from "./CreateExpenses";
import GroupMembers from "./GroupMembers";
import ExpenseManager from "./ExpenseManager";

const UserSystemApp = ({ onLogout }) => {
  const [activeGroupId, setActiveGroupId] = useState(null); // State for the active group
  const [showExpenseManager, setShowExpenseManager] = useState(false); // State to control ExpenseManager visibility
  const navigate = useNavigate(); // To navigate after logout
  const expenseRef = React.useRef(); // Reference to access `fetchUserGroups` in CreateExpenses

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    onLogout();
    navigate("/"); // Redirect to the login page after logging out
  };

  // Callback to refresh the group list in CreateExpenses
  const refreshGroups = () => {
    if (expenseRef.current && expenseRef.current.fetchUserGroups) {
      expenseRef.current.fetchUserGroups();
    }
  };

  const handleGroupCreation = (groupId) => {
    setActiveGroupId(groupId); // Set the active group when created
    refreshGroups(); // Refresh the group list
  };

  const handleExpenseCreated = () => {
    console.log("Expense has been created!");
  };

  const handleExpenseManagerClose = () => {
    setShowExpenseManager(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">User System</h1>
        <div className="flex space-x-6 text-sm">
          <Link to="profile" className="hover:underline">
            Profile
          </Link>
          <Link to="groups" className="hover:underline">
            Groups
          </Link>
          <Link to="expenses" className="hover:underline">
            Expenses
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="flex-grow flex flex-col items-center px-4 py-6">
        <div className="max-w-5xl w-full bg-white rounded-lg shadow-lg p-8">
          <Routes>
            <Route path="profile" element={<ProfileManagement />} />
            <Route
              path="groups"
              element={<GroupCreation onGroupCreation={handleGroupCreation} />}
            />
            <Route
              path="expenses"
              element={
                <>
                  <CreateExpense
                    groupId={activeGroupId}
                    onExpenseCreated={handleExpenseCreated}
                    ref={expenseRef}
                  />
                  {showExpenseManager && (
                    <ExpenseManager
                      groupId={activeGroupId}
                      onClose={handleExpenseManagerClose}
                    />
                  )}
                </>
              }
            />
            <Route path="/groups/:groupId/members" element={<GroupMembers />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default UserSystemApp;
