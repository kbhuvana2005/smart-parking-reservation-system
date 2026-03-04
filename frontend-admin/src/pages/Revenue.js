import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './Revenue.css';

function Revenue() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/bookings');
      setBookings(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch revenue data');
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completed = bookings.filter(b => b.status === 'completed');

    switch (dateFilter) {
      case 'today':
        return completed.filter(b => new Date(b.createdAt) >= today);
      case 'week':
        return completed.filter(b => new Date(b.createdAt) >= weekAgo);
      case 'month':
        return completed.filter(b => new Date(b.createdAt) >= monthStart);
      default:
        return completed;
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const completedBookings = bookings.filter(b => b.status === 'completed');

    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + (b.totalAmount || 0),
      0
    );

    const todayRevenue = completedBookings
      .filter(b => new Date(b.createdAt) >= today)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const weekRevenue = completedBookings
      .filter(b => new Date(b.createdAt) >= weekAgo)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const monthRevenue = completedBookings
      .filter(b => new Date(b.createdAt) >= monthStart)
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const totalTransactions = completedBookings.length;
    const avgTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const pendingRevenue = bookings
      .filter(b => b.status === 'completed' && b.paymentStatus === 'pending')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return {
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalTransactions,
      avgTransaction,
      pendingRevenue
    };
  };

  const exportToCSV = () => {
    const filtered = getFilteredBookings();
    const headers = ['Date', 'Booking ID', 'User', 'Vehicle', 'Spot', 'Duration', 'Amount', 'Payment'];
    const rows = filtered.map(b => [
      new Date(b.createdAt).toLocaleDateString(),
      String(b._id).slice(-8).toUpperCase(),
      b.user?.name || 'N/A',
      b.vehicleNumber,
      b.parkingSpot?.spotNumber || 'N/A',
      `${b.totalHours || 0}h`,
      `₹${b.totalAmount || 0}`,
      b.paymentStatus
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Revenue report exported!');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading revenue data...</p>
      </div>
    );
  }

  const stats = calculateStats();
  const filteredBookings = getFilteredBookings();

  return (
    <div className="revenue-container">

      {/* Header */}
      <div className="revenue-header">
        <div className="header-left">
          <h1>💰 Revenue & Reports</h1>
          <p>Track your parking revenue and transactions</p>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={exportToCSV}>
            📥 Export Report
          </button>
          <button className="refresh-btn" onClick={fetchBookings}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="revenue-stats">
        <div className="revenue-card total">
          <div className="revenue-icon">💵</div>
          <div className="revenue-content">
            <h3>₹{stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>

        <div className="revenue-card today">
          <div className="revenue-icon">📅</div>
          <div className="revenue-content">
            <h3>₹{stats.todayRevenue.toFixed(2)}</h3>
            <p>Today's Revenue</p>
          </div>
        </div>

        <div className="revenue-card week">
          <div className="revenue-icon">📊</div>
          <div className="revenue-content">
            <h3>₹{stats.weekRevenue.toFixed(2)}</h3>
            <p>This Week</p>
          </div>
        </div>

        <div className="revenue-card month">
          <div className="revenue-icon">📈</div>
          <div className="revenue-content">
            <h3>₹{stats.monthRevenue.toFixed(2)}</h3>
            <p>This Month</p>
          </div>
        </div>

        <div className="revenue-card transactions">
          <div className="revenue-icon">🧾</div>
          <div className="revenue-content">
            <h3>{stats.totalTransactions}</h3>
            <p>Total Transactions</p>
          </div>
        </div>

        <div className="revenue-card average">
          <div className="revenue-icon">💳</div>
          <div className="revenue-content">
            <h3>₹{stats.avgTransaction.toFixed(2)}</h3>
            <p>Avg Transaction</p>
          </div>
        </div>

        <div className="revenue-card pending">
          <div className="revenue-icon">⏳</div>
          <div className="revenue-content">
            <h3>₹{stats.pendingRevenue.toFixed(2)}</h3>
            <p>Pending Payments</p>
          </div>
        </div>

        <div className="revenue-card collected">
          <div className="revenue-icon">✅</div>
          <div className="revenue-content">
            <h3>₹{(stats.totalRevenue - stats.pendingRevenue).toFixed(2)}</h3>
            <p>Collected</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="revenue-controls">
        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All Time' },
            { key: 'today', label: 'Today' },
            { key: 'week', label: 'This Week' },
            { key: 'month', label: 'This Month' }
          ].map(filter => (
            <button
              key={filter.key}
              className={`filter-tab ${dateFilter === filter.key ? 'active' : ''}`}
              onClick={() => setDateFilter(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <div className="result-count">
          {filteredBookings.length} transactions
        </div>
      </div>

      {/* Transactions Table */}
      {filteredBookings.length > 0 ? (
        <div className="revenue-table-wrapper">
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Booking ID</th>
                <th>User</th>
                <th>Vehicle</th>
                <th>Spot</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => (
                <tr key={booking._id}>
                  <td className="date-cell">
                    {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <span className="booking-id">
                      #{String(booking._id).slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td>{booking.user?.name || 'N/A'}</td>
                  <td>
                    <span className="vehicle-number">
                      {booking.vehicleNumber}
                    </span>
                  </td>
                  <td>
                    <span className="spot-badge">
                      {booking.parkingSpot?.spotNumber || 'N/A'}
                    </span>
                  </td>
                  <td className="duration-cell">
                    {booking.totalHours || 0} hours
                  </td>
                  <td>
                    <span className="amount">
                      ₹{booking.totalAmount || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`payment-badge ${booking.paymentStatus}`}>
                      {booking.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-revenue">
          <div className="no-revenue-icon">💰</div>
          <h3>No transactions found</h3>
          <p>Revenue will appear here once bookings are completed</p>
        </div>
      )}
    </div>
  );
}

export default Revenue;