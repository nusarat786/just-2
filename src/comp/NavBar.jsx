// Sidebar.js

import React from 'react';
import "./sidebar";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        {/* You can add Twitter logo or your custom logo here */}
        Logo
      </div>
      <nav>
        <ul>
          <li>Home</li>
          <li>Explore</li>
          <li>Notifications</li>
          <li>Messages</li>
          {/* Add more navigation items as needed */}
        </ul>
      </nav>
      {/* Additional components or features can be added here */}
    </div>
  );
};

export default Sidebar;
