import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>Sidebar</h3>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/create-group">Create Group</Link></li>
        <li><Link to="/group/1">Group Details</Link></li>
        <li><Link to="/login">Logout</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;