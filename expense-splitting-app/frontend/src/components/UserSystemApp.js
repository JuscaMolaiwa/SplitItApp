import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import GroupList from "./GroupList"; // Displays user's groups
import GroupDetail from "../pages/GroupDetail"; // Group-specific details and expenses
import GroupMembers from "./GroupMembers"; // Displays members of a group

const UserSystemApp = ({ onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true); // Sidebar state

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside
        className={`bg-indigo-700 text-white p-4 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 fixed md:relative z-50 h-full`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">My Groups</h2>
          <button
            onClick={toggleSidebar}
            className="text-white text-2xl md:hidden"
            aria-label="Close Sidebar"
          >
            ×
          </button>
        </div>
        <GroupList />
        <button
          onClick={onLogout}
          className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 bg-gray-100 p-6 ml-64 ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        } transition-all duration-300`}
      >
        {/* Header for Mobile Screens */}
        <header className="md:hidden bg-indigo-700 text-white p-4 flex justify-between items-center">
          <button
            onClick={toggleSidebar}
            className="text-2xl"
            aria-label="Open Sidebar"
          >
            ☰
          </button>
          <h1 className="text-lg font-bold">SplitItApp</h1>
        </header>

        {/* Main Content Routes */}
        <main className="overflow-y-auto">
          <Routes>
            {/* Default Route: Redirect to Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" />} />

            {/* Group Detail: Expenses and Members */}
            <Route path="group/:id" element={<GroupDetail />} />

            {/* Group Members */}
            <Route path="group/:id/members" element={<GroupMembers />} />

            {/* Default Route: Redirect to Group List */}
            <Route path="*" element={<Navigate to="/app/group-list" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserSystemApp;
