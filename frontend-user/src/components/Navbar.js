import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode, toggleDarkMode } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/dashboard" className="navbar-logo">
          <span className="logo-icon">🅿️</span>
          <span className="logo-text">Smart Parking</span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="navbar-links">
          <Link 
            to="/dashboard" 
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            Dashboard
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
          <Link 
            to="/near-me" 
            className={`nav-link ${isActive('/near-me') ? 'active' : ''}`}
          >
            <span className="nav-icon">🗺️</span>
            Near Me
          </Link>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          {/* Dark Mode Toggle */}
          <button 
            className="dark-mode-toggle" 
            onClick={toggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* User Menu */}
          <div className="user-menu">
            <div 
              className="user-info" 
              onClick={() => navigate('/profile')} 
              style={{ cursor: 'pointer' }}
            >
              <div className="user-avatar">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user.name || 'User'}</span>
                <span className="user-role">Driver</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
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
          <Link 
            to="/near-me" 
            className={`mobile-link ${isActive('/near-me') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            🗺️ Near Me
          </Link>
          <Link 
            to="/profile" 
            className={`mobile-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            👤 Profile
          </Link>
          <button className="mobile-dark-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <button className="mobile-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;