import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const menuItems = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/analytics', icon: '📊', label: 'Analytics' }, 
  { path: '/parking-spots', icon: '🅿️', label: 'Parking Spots' },
  { path: '/bookings', icon: '📋', label: 'Bookings' },
  { path: '/users', icon: '👥', label: 'Users' },
  { path: '/revenue', icon: '💰', label: 'Revenue' },
  { path: '/qr-scanner', icon: '📷', label: 'QR Scanner' }
];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🅿</div>
        <div className="logo-text">
          <span className="logo-main">Smart Parking</span>
          <span className="logo-sub">Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>© 2026 Smart Parking</p>
        <p>Admin Dashboard v1.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;