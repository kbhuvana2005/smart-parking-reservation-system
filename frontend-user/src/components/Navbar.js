import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <div className="logo-icon">🅿</div>
          <div className="logo-text">
            <span className="logo-main">Smart</span>
            <span className="logo-sub">Parking</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
          </Link>
          
          {/* ✅ ADDED - Near Me Link */}
          <Link
            to="/near-me"
            className={`nav-link ${isActive('/near-me') ? 'active' : ''}`}
          >
            <span className="nav-icon">🗺️</span>
            Near Me
          </Link>
          
          <Link
            to="/parking-spots"
            className={`nav-link ${isActive('/parking-spots') ? 'active' : ''}`}
          >
            <span className="nav-icon">🅿️</span>
            Find Parking
          </Link>
          
          <Link
            to="/my-bookings"
            className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
          >
            <span className="nav-icon">📋</span>
            My Bookings
          </Link>
        </div>

        {/* User Section */}
        <div className="navbar-user">
          <div className="user-avatar">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user.name || 'User'}</span>
            <span className="user-role">Driver</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link
            to="/dashboard"
            className={`mobile-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            🏠 Dashboard
          </Link>
          
          {/* ✅ ADDED - Near Me in Mobile */}
          <Link
            to="/near-me"
            className={`mobile-link ${isActive('/near-me') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            🗺️ Near Me
          </Link>
          
          <Link
            to="/parking-spots"
            className={`mobile-link ${isActive('/parking-spots') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            🅿️ Find Parking
          </Link>
          
          <Link
            to="/my-bookings"
            className={`mobile-link ${isActive('/my-bookings') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            📋 My Bookings
          </Link>
          
          <button className="mobile-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;