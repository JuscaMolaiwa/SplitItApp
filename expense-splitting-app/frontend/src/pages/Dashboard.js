import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom"; // Import for routing

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-gray-900 text-white transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 transition-transform duration-300 ease-in-out z-50`}
    >
      <div className="flex flex-col h-full p-5">
        <h1 className="text-2xl font-bold mb-10">SplitItApp</h1>
        <nav className="flex flex-col gap-4" aria-label="Sidebar Navigation">
          <Link
            to="/dashboard"
            className={`${
              isActive("/dashboard") ? "text-blue-400" : "text-gray-300"
            } hover:text-white`}
          >
            Dashboard
          </Link>
          <Link
            to="/create-group"
            className={`${
              isActive("/create-group") ? "text-blue-400" : "text-gray-300"
            } hover:text-white`}
          >
            Create Group
          </Link>
          <Link
            to="/manage-groups"
            className={`${
              isActive("/manage-groups") ? "text-blue-400" : "text-gray-300"
            } hover:text-white`}
          >
            Manage Groups
          </Link>
        </nav>
        <button
          onClick={toggleSidebar}
          className="mt-auto bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg lg:hidden"
          aria-label="Close Sidebar"
        >
          Close Sidebar
        </button>
      </div>
    </aside>
  );
};

// Header Component
const Header = ({ onMenuClick }) => (
  <header
    className="bg-gray-900 text-white p-4 flex justify-between items-center lg:hidden"
    aria-label="Header Navigation"
  >
    <button
      onClick={onMenuClick}
      className="text-2xl text-white hover:text-gray-300"
      aria-label="Open Sidebar"
    >
      ☰
    </button>
    <h1 className="text-xl font-bold">SplitItApp</h1>
    <button className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500">
      Logout
    </button>
  </header>
);

// Card Component
const Card = ({ title, description }) => (
  <div className="bg-white rounded-lg shadow hover:shadow-md p-6 transition-shadow duration-300">
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Main Dashboard Component
const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-gray-100 lg:ml-64">
        {/* Header for Small Screens */}
        <Header onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 p-6">
          <h2 className="text-2xl font-semibold mb-6">Welcome to SplitItApp</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            <Card
              title="Create Group"
              description="Start a new group and split expenses easily."
            />
            <Card
              title="Manage Groups"
              description="View, edit, or delete your existing groups."
            />
            <Card
              title="Recent Activity"
              description="Check the latest updates on group expenses."
            />
            <Card
              title="Profile"
              description="Update your profile and account settings."
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
