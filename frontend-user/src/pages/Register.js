import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './Login.css';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    vehicleNumber: ''
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
      const response = await axios.post('/auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Account created! Welcome to Smart Parking 🚗');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
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
          <h1>Join Smart Parking</h1>
          <p>Create your account and start parking smarter today!</p>

          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">🎫</span>
              <div>
                <h4>Free Registration</h4>
                <p>No hidden charges to sign up</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⚡</span>
              <div>
                <h4>Instant Booking</h4>
                <p>Reserve spots in real-time</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <div>
                <h4>Smart Reminders</h4>
                <p>Never miss your parking time</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🛡️</span>
              <div>
                <h4>Secure & Safe</h4>
                <p>24/7 CCTV monitored parking</p>
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
              <p>Security</p>
            </div>
            <div className="auth-stat">
              <h3>100%</h3>
              <p>Digital</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h2>Create Account 🚗</h2>
            <p>Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-wrapper">
                  <span className="input-icon">📱</span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Your phone number"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Your email address"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Vehicle Number</label>
              <div className="input-wrapper">
                <span className="input-icon">🚗</span>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="e.g., KA-01-AB-1234"
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
                  placeholder="Create a strong password"
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
                  Creating Account...
                </span>
              ) : (
                '🚀 Create Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account?
              <Link to="/login"> Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;