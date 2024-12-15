import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar state for mobile
  const navigate = useNavigate(); // For navigation after logout

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg fixed w-full top-0 left-0 z-50">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        {/* Branding */}
        <div className="text-xl font-bold">
          <NavLink to="/dashboard" className="hover:text-indigo-200 transition-all duration-200">
            SplitItApp
          </NavLink>
        </div>

        {/* Hamburger Menu Toggle (Mobile) */}
        <button
          className="text-white lg:hidden focus:outline-none"
          onClick={() => {
            setIsOpen(!isOpen);
            setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar visibility for mobile
          }}
        >
          {isOpen ? (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" // Close (✖) icon
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7" // Open (☰) icon
              />
            </svg>
          )}
        </button>

        {/* Links */}
        <ul
          className={`lg:flex lg:space-x-8 ${
            isOpen ? 'block' : 'hidden'
          } lg:block bg-indigo-600 lg:bg-transparent absolute lg:static top-16 left-0 w-full lg:w-auto text-center lg:text-left transition-all duration-300`}
        >
          <li className="py-2 lg:py-0">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? 'text-indigo-200 font-semibold'
                  : 'hover:text-indigo-200 transition-all duration-200'
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li className="py-2 lg:py-0">
            <NavLink
              to="/create-group"
              className={({ isActive }) =>
                isActive
                  ? 'text-indigo-200 font-semibold'
                  : 'hover:text-indigo-200 transition-all duration-200'
              }
            >
              Create Group
            </NavLink>
          </li>
          <li className="py-2 lg:py-0">
            <button
              onClick={handleLogout}
              className="hover:text-indigo-200 transition-all duration-200"
            >
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
