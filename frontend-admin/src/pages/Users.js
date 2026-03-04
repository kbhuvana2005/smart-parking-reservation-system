import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      // Fetch both users and bookings
      const [usersResponse, bookingsResponse] = await Promise.all([
        axios.get('/users'),
        axios.get('/bookings')
      ]);

      const allUsers = usersResponse.data.data;
      const allBookings = bookingsResponse.data.data;

      // Count bookings per user
      const usersWithBookings = allUsers.map(user => {
        const userBookings = allBookings.filter(
          booking => booking.user && booking.user._id === user._id
        );
        return {
          ...user,
          bookingCount: userBookings.length
        };
      });

      setUsers(usersWithBookings);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.vehicleNumber && user.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const getStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: users.length,
      newToday: users.filter(u => new Date(u.createdAt) >= today).length,
      newThisMonth: users.filter(u => new Date(u.createdAt) >= thisMonth).length,
      withBookings: users.filter(u => u.bookingCount > 0).length
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="users-container">

      {/* Header */}
      <div className="users-header">
        <div className="header-left">
          <h1>👥 Users Management</h1>
          <p>View and manage registered users</p>
        </div>
        <button className="refresh-btn" onClick={fetchUsers}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-card-user total">
          <div className="stat-icon-user">👥</div>
          <div className="stat-content-user">
            <h3>{stats.total}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card-user new">
          <div className="stat-icon-user">✨</div>
          <div className="stat-content-user">
            <h3>{stats.newToday}</h3>
            <p>New Today</p>
          </div>
        </div>
        <div className="stat-card-user month">
          <div className="stat-icon-user">📅</div>
          <div className="stat-content-user">
            <h3>{stats.newThisMonth}</h3>
            <p>This Month</p>
          </div>
        </div>
        <div className="stat-card-user active">
          <div className="stat-icon-user">🚗</div>
          <div className="stat-content-user">
            <h3>{stats.withBookings}</h3>
            <p>Active Users</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="users-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by name, email, or vehicle number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>
        <div className="result-count">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length > 0 ? (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Vehicle Number</th>
                <th>Registered On</th>
                <th>Total Bookings</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user._id}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.phone || '-'}</td>
                  <td>
                    {user.vehicleNumber ? (
                      <span className="vehicle-badge">{user.vehicleNumber}</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="date-cell">
                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="count-cell">
                    {user.bookingCount || 0}
                  </td>
                  <td>
                    <button
                      className="btn-view-user"
                      onClick={() => handleViewUser(user)}
                    >
                      👁️ View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-users">
          <div className="no-users-icon">👥</div>
          <h3>No users found</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search terms'
              : 'No users registered yet'}
          </p>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>👤 User Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="user-profile">
                <div className="user-avatar-large">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <h3>{selectedUser.name}</h3>
                <p className="user-email">{selectedUser.email}</p>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">
                    {selectedUser.phone || 'Not provided'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vehicle Number</span>
                  <span className="detail-value">
                    {selectedUser.vehicleNumber || 'Not provided'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Registered On</span>
                  <span className="detail-value">
                    {new Date(selectedUser.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Bookings</span>
                  <span className="detail-value">
                    {selectedUser.bookingCount || 0}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value" style={{ fontSize: '12px' }}>
                    {selectedUser._id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;