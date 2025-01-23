import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
    className="bg-gray-900 text-white p-4 flex justify-between items-center lg:hidden fixed top-0 left-0 right-0 z-40"
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
  </header>
);

// Card Component
const Card = ({ title, description, link, className }) => (
  <Link to={link} className={`block ${className}`}>
    <div className="bg-white h-full rounded-lg shadow-lg hover:shadow-xl p-8 transition-shadow duration-300 hover:bg-gray-50">
      <h3 className="text-2xl font-semibold mb-4 text-indigo-600">{title}</h3>
      <p className="text-gray-600 text-lg">{description}</p>
    </div>
  </Link>
);

// Main Dashboard Component
const Dashboard = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen w-screen flex">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header for Small Screens */}
        <Header onMenuClick={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full place-content-center">
            <Card
              title="Create Group"
              description="Start a new group and split expenses easily."
              link="/create-group"
              className="w-full max-w-md"
            />
            <Card
              title="Manage Groups"
              description="View, edit, or delete your existing groups."
              link="/manage-groups"
              className="w-full max-w-md"
            />
            <Card
              title="Recent Activity"
              description="Check the latest updates on group expenses."
              link="/recent-activity"
              className="w-full max-w-md"
            />
            <Card
              title="Profile"
              description="Update your profile and account settings."
              link="/profile"
              className="w-full max-w-md"
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
