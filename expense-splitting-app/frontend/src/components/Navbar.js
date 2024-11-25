import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State for mobile menu
  const navigate = useNavigate(); // For logout navigation

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* Branding */}
        <div className="text-lg font-bold">
          <NavLink to="/dashboard" className="hover:text-indigo-200 transition">
            MyApp
          </NavLink>
        </div>

        {/* Hamburger Menu Toggle (Mobile) */}
        <button
          className="text-white lg:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            )}
          </svg>
        </button>

        {/* Links */}
        <ul
          className={`lg:flex lg:space-x-4 ${
            isOpen ? 'block' : 'hidden'
          } lg:block bg-indigo-600 lg:bg-transparent`}
        >
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? 'text-indigo-200 font-semibold'
                  : 'hover:text-indigo-200 transition'
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/create-group"
              className={({ isActive }) =>
                isActive
                  ? 'text-indigo-200 font-semibold'
                  : 'hover:text-indigo-200 transition'
              }
            >
              Create Group
            </NavLink>
          </li>
          <li>
            <button
              onClick={handleLogout}
              className="hover:text-indigo-200 transition"
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
