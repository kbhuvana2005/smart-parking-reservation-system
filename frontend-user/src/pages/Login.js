import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Welcome back! 🚗');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">

      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="brand-logo">🅿</div>
          <h1>Smart Parking</h1>
          <p>Your intelligent parking solution for hassle-free parking experience</p>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">🚗</span>
              <div>
                <h4>Easy Reservation</h4>
                <p>Book your spot in seconds</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📱</span>
              <div>
                <h4>QR Check-in</h4>
                <p>Contactless entry & exit</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <div>
                <h4>Smart Billing</h4>
                <p>Pay only for what you use</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📧</span>
              <div>
                <h4>Instant Alerts</h4>
                <p>Email notifications always</p>
              </div>
            </div>
          </div>

          <div className="auth-stats">
            <div className="auth-stat">
              <h3>60+</h3>
              <p>Parking Slots</p>
            </div>
            <div className="auth-stat">
              <h3>24/7</h3>
              <p>Available</p>
            </div>
            <div className="auth-stat">
              <h3>3</h3>
              <p>Floors</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Welcome Back! 👋</h2>
            <p>Login to manage your parking reservations</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span>
                  Logging in...
                </span>
              ) : (
                '🚗 Login to Park'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account?
              <Link to="/register"> Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;