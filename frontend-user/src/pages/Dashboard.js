import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalSpent: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

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
      const response = await axios.get('/bookings');
      const bookings = response.data.data;

      setStats({
        total: bookings.length,
        active: bookings.filter(b => b.status === 'active' || b.status === 'reserved').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        totalSpent: bookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
      });

      setRecentBookings(bookings.slice(0, 5));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load dashboard');
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      reserved: { text: '🟡 Reserved', class: 'badge-reserved' },
      active: { text: '🟢 Active', class: 'badge-active' },
      completed: { text: '✅ Completed', class: 'badge-completed' },
      cancelled: { text: '🔴 Cancelled', class: 'badge-cancelled' }
    };
    return badges[status] || { text: status, class: '' };
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">

      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-left">
          <h1>{getGreeting()}, {user.name?.split(' ')[0]}! 👋</h1>
          <p>Ready to park smart today? Find your perfect spot below.</p>
          <Link to="/parking-spots" className="find-spot-btn">
            🅿️ Find Parking Spot
          </Link>
        </div>
        <div className="welcome-right">
          <div className="parking-illustration">
            <div className="car-icon">🚗</div>
            <div className="road-lines">
              <div></div><div></div><div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(15, 52, 96, 0.1)' }}>
            🅿️
          </div>
          <div className="stat-info">
            <h2>{stats.total}</h2>
            <p>Total Bookings</p>
          </div>
          <div className="stat-trend">All time</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
            🚗
          </div>
          <div className="stat-info">
            <h2>{stats.active}</h2>
            <p>Active / Reserved</p>
          </div>
          <div className="stat-trend active-trend">Live</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(233, 69, 96, 0.1)' }}>
            ✅
          </div>
          <div className="stat-info">
            <h2>{stats.completed}</h2>
            <p>Completed</p>
          </div>
          <div className="stat-trend">Finished</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
            💰
          </div>
          <div className="stat-info">
            <h2>₹{stats.totalSpent}</h2>
            <p>Total Spent</p>
          </div>
          <div className="stat-trend">Overall</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/parking-spots" className="action-card">
            <span className="action-icon">🅿️</span>
            <h3>Book Parking</h3>
            <p>Find and reserve a spot</p>
          </Link>
          <Link to="/my-bookings" className="action-card">
            <span className="action-icon">📋</span>
            <h3>My Bookings</h3>
            <p>View all reservations</p>
          </Link>
          <Link to="/my-bookings" className="action-card">
            <span className="action-icon">📱</span>
            <h3>My QR Codes</h3>
            <p>View entry/exit codes</p>
          </Link>
          <Link to="/my-bookings" className="action-card">
            <span className="action-icon">🧾</span>
            <h3>Receipts</h3>
            <p>View payment history</p>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-bookings">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <Link to="/my-bookings" className="view-all-link">
            View All →
          </Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="bookings-list">
            {recentBookings.map(booking => {
              const badge = getStatusBadge(booking.status);
              return (
                <div
                  key={booking._id}
                  className="booking-item"
                  onClick={() => navigate(`/booking/${booking._id}`)}
                >
                  <div className="booking-spot">
                    <div className="spot-badge">
                      {booking.parkingSpot?.spotNumber || 'N/A'}
                    </div>
                  </div>
                  <div className="booking-info">
                    <h4>{booking.parkingSpot?.spotNumber} - Floor {booking.parkingSpot?.floor}</h4>
                    <p>🚗 {booking.vehicleNumber}</p>
                    <p>⏰ {new Date(booking.arrivalTime).toLocaleString()}</p>
                  </div>
                  <div className="booking-right">
                    <span className={`status-badge ${badge.class}`}>
                      {badge.text}
                    </span>
                    {booking.totalAmount > 0 && (
                      <p className="booking-amount">₹{booking.totalAmount}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-bookings">
            <div className="no-bookings-icon">🅿️</div>
            <h3>No Bookings Yet</h3>
            <p>Start by booking your first parking spot!</p>
            <Link to="/parking-spots" className="book-now-btn">
              Book Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;