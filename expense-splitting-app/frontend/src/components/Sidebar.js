import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation(); // Hook to track the current URL
  
  // Function to determine if the current link is active
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <div className="sidebar">
      <h3 className="sidebar-header">Sidebar</h3>
      <ul className="sidebar-list">
        <li className={`sidebar-item ${isActive('/dashboard')}`}>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li className={`sidebar-item ${isActive('/create-group')}`}>
          <Link to="/create-group">Create Group</Link>
        </li>
        <li className={`sidebar-item ${isActive('/group/1')}`}>
          <Link to="/group/1">Group Details</Link>
        </li>
        <li className={`sidebar-item ${isActive('/login')}`}>
          <Link to="/login">Logout</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
