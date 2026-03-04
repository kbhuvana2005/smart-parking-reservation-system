import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSpots: 0,
    availableSpots: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalUsers: 0,
    todayRevenue: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const admin = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch parking spots
      const spotsRes = await axios.get('/parking-spots');
      const spots = spotsRes.data.data;

      // Fetch bookings
      const bookingsRes = await axios.get('/bookings');
      const bookings = bookingsRes.data.data;

      // Fetch users
      const usersRes = await axios.get('/users');
      const users = usersRes.data.data;

      // Calculate stats
      const availableSpots = spots.filter(s => s.isAvailable).length;
      const activeBookings = bookings.filter(
        b => b.status === 'active' || b.status === 'reserved'
      ).length;

      // Calculate revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayRevenue = bookings
        .filter(b => new Date(b.createdAt) >= today && b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      const totalRevenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

      setStats({
        totalSpots: spots.length,
        availableSpots,
        totalBookings: bookings.length,
        activeBookings,
        totalUsers: users.length,
        todayRevenue,
        totalRevenue
      });

      // Recent bookings
      setRecentBookings(bookings.slice(0, 10));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      reserved: { icon: '🟡', label: 'Reserved', class: 'badge-reserved' },
      active: { icon: '🟢', label: 'Active', class: 'badge-active' },
      completed: { icon: '✅', label: 'Completed', class: 'badge-completed' },
      cancelled: { icon: '🔴', label: 'Cancelled', class: 'badge-cancelled' }
    };
    return badges[status] || badges.reserved;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* Welcome Banner */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>{getGreeting()}, {admin.name?.split(' ')[0] || 'Admin'}! 👋</h1>
          <p>Here's what's happening with your parking system today</p>
        </div>
        <button className="refresh-btn" onClick={fetchDashboardData}>
          🔄 Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">🅿️</div>
          <div className="stat-content">
            <h3>{stats.totalSpots}</h3>
            <p>Total Parking Spots</p>
          </div>
          <div className="stat-badge">Total</div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.availableSpots}</h3>
            <p>Available Spots</p>
          </div>
          <div className="stat-badge available">Available Now</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>{stats.activeBookings}</h3>
            <p>Active Bookings</p>
          </div>
          <div className="stat-badge active">Live</div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
          <div className="stat-badge">All Time</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Registered Users</p>
          </div>
          <div className="stat-badge">Total</div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>₹{stats.todayRevenue}</h3>
            <p>Today's Revenue</p>
          </div>
          <div className="stat-badge today">Today</div>
        </div>

        <div className="stat-card total-revenue">
          <div className="stat-icon">💵</div>
          <div className="stat-content">
            <h3>₹{stats.totalRevenue}</h3>
            <p>Total Revenue</p>
          </div>
          <div className="stat-badge">All Time</div>
        </div>

        <div className="stat-card occupancy">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>
              {stats.totalSpots > 0
                ? Math.round(((stats.totalSpots - stats.availableSpots) / stats.totalSpots) * 100)
                : 0}%
            </h3>
            <p>Occupancy Rate</p>
          </div>
          <div className="stat-badge">Current</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2>⚡ Quick Actions</h2>
        <div className="quick-actions-grid">
          <div className="action-card" onClick={() => navigate('/parking-spots')}>
            <div className="action-icon">🅿️</div>
            <h3>Manage Spots</h3>
            <p>Add, edit or delete parking spots</p>
          </div>
          <div className="action-card" onClick={() => navigate('/bookings')}>
            <div className="action-icon">📋</div>
            <h3>View Bookings</h3>
            <p>Monitor all parking reservations</p>
          </div>
          <div className="action-card" onClick={() => navigate('/users')}>
            <div className="action-icon">👥</div>
            <h3>Manage Users</h3>
            <p>View registered user accounts</p>
          </div>
          <div className="action-card" onClick={() => navigate('/qr-scanner')}>
            <div className="action-icon">📷</div>
            <h3>QR Scanner</h3>
            <p>Check-in/out vehicles</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="recent-bookings-section">
        <div className="section-header">
          <h2>📋 Recent Bookings</h2>
          <button className="view-all-btn" onClick={() => navigate('/bookings')}>
            View All →
          </button>
        </div>

        {recentBookings.length > 0 ? (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Spot</th>
                  <th>Vehicle</th>
                  <th>User</th>
                  <th>Arrival Time</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => {
                  const badge = getStatusBadge(booking.status);
                  return (
                    <tr key={booking._id}>
                      <td>
                        <span className="booking-id">
                          #{String(booking._id).slice(-6).toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className="spot-number">
                          {booking.parkingSpot?.spotNumber || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <span className="vehicle-number">
                          🚗 {booking.vehicleNumber}
                        </span>
                      </td>
                      <td>{booking.user?.name || 'N/A'}</td>
                      <td>{new Date(booking.arrivalTime).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${badge.class}`}>
                          {badge.icon} {badge.label}
                        </span>
                      </td>
                      <td>
                        <span className="amount">
                          {booking.totalAmount > 0 ? `₹${booking.totalAmount}` : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-bookings">
            <p>No bookings yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;