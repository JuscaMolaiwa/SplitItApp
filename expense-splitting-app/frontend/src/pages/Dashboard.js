import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Dashboard.css";

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

// Card Component with Animation
const Card = ({ title, description, link, className, index }) => (
  <Link
    to={link}
    className={`block ${className} animate-slide-in card-hover-effect`}
    style={{
      animationDelay: `${index * 200}ms`,
      opacity: 0,
      animation: "slide-in 0.6s ease forwards",
    }}
  >
    <div className="bg-white h-full rounded-lg shadow-lg hover:shadow-xl p-8 transition-all duration-300 hover:bg-gray-50 transform hover:scale-105">
      <h3 className="text-2xl font-semibold mb-4 text-indigo-600">{title}</h3>
      <p className="text-gray-600 text-lg">{description}</p>
    </div>
  </Link>
);

// Main Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleAddExpense = () => {
    navigate("/app/create-expense");
  };

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const cards = [
    {
      title: "Create Group",
      description: "Start a new group and split expenses easily.",
      link: "/create-group",
    },
    {
      title: "Add Expense", // New card
      description: "Add a new expense to split with your group.",
      onClick: handleAddExpense, // Use the function here
    },
    {
      title: "Recent Activity",
      description: "Check the latest updates on group expenses.",
      link: "/recent-activity",
    },
    {
      title: "Profile",
      description: "Update your profile and account settings.",
      link: "/profile",
    },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={toggleSidebar} />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
            >
              {cards.map((card, index) =>
                card.onClick ? (
                  <div
                    key={card.title}
                    onClick={card.onClick}
                    className="cursor-pointer block h-full card-hover-effect"
                  >
                    <div className="bg-white h-full rounded-lg shadow-lg hover:shadow-xl p-8 transition-all duration-300 hover:bg-gray-50 transform hover:scale-105">
                      <h3 className="text-2xl font-semibold mb-4 text-indigo-600">
                        {card.title}
                      </h3>
                      <p className="text-gray-600 text-lg">
                        {card.description}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Card
                    key={card.title}
                    {...card}
                    className="h-full card-hover-effect"
                    index={index}
                  />
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
