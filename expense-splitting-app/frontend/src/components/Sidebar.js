import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = ({ isSidebarOpen }) => {
  return (
    <aside
      className={`w-64 bg-gray-100 h-screen p-6 fixed top-16 left-0 border-r shadow-md transition-transform ${
        isSidebarOpen ? 'transform-none' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:w-64 z-40`}
    >
      <h3 className="text-2xl font-bold text-indigo-600 mb-8">SplitItApp</h3>
      <ul className="space-y-4">
        <li>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? 'block py-2 px-4 bg-indigo-100 text-indigo-700 rounded'
                : 'block py-2 px-4 hover:bg-indigo-100 hover:text-indigo-700 rounded'
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
                ? 'block py-2 px-4 bg-indigo-100 text-indigo-700 rounded'
                : 'block py-2 px-4 hover:bg-indigo-100 hover:text-indigo-700 rounded'
            }
          >
            Create Group
          </NavLink>
        </li>
        <li>
          <button className="block py-2 px-4 hover:bg-indigo-100 hover:text-indigo-700 rounded w-full text-left">
            Logout
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
