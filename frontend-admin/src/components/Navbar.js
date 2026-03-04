import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  return (
    <nav className="admin-navbar">
      <div className="navbar-left">
        <h1 className="page-title">Admin Dashboard</h1>
      </div>

      <div className="navbar-right">
        <div className="admin-profile">
          <div className="admin-avatar">
            {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="admin-info">
            <span className="admin-name">{admin.name || 'Admin'}</span>
            <span className="admin-role">Administrator</span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;