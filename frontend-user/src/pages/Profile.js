import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './Profile.css';

function Profile() {
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleNumber: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      vehicleNumber: userData.vehicleNumber || ''
    });
    setLoading(false);
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/users/${user._id}`, formData);
      
      // Update localStorage
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    try {
      await axios.put(`/users/${user._id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordChange(false);
      toast.success('Password changed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return <div className="loading"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>👤 My Profile</h1>
        <p>Manage your account settings</p>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar-large">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <h2>{user.name}</h2>
          <p className="profile-email">{user.email}</p>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleUpdateProfile} className="profile-form">
          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!editing}
                required
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                title="Email cannot be changed"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!editing}
                placeholder="10-digit number"
                pattern="[0-9]{10}"
              />
            </div>

            <div className="form-group">
              <label>Vehicle Number</label>
              <input
                type="text"
                value={formData.vehicleNumber}
                onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value.toUpperCase() })}
                disabled={!editing}
                placeholder="TN59AK1234"
              />
            </div>
          </div>

          <div className="profile-actions">
            {!editing ? (
              <button type="button" className="btn-edit" onClick={() => setEditing(true)}>
                ✏️ Edit Profile
              </button>
            ) : (
              <>
                <button type="button" className="btn-cancel" onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    vehicleNumber: user.vehicleNumber || ''
                  });
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  💾 Save Changes
                </button>
              </>
            )}
          </div>
        </form>

        {/* Change Password Section */}
        <div className="password-section">
          {!showPasswordChange ? (
            <button className="btn-change-password" onClick={() => setShowPasswordChange(true)}>
              🔒 Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="password-form">
              <h3>Change Password</h3>
              
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  minLength="6"
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  minLength="6"
                  required
                />
              </div>

              <div className="password-actions">
                <button type="button" className="btn-cancel" onClick={() => {
                  setShowPasswordChange(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;