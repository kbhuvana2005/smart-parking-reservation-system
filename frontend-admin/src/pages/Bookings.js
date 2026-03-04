import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './Bookings.css';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [activeFilter, searchTerm, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get('/bookings');
      setBookings(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch bookings');
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (activeFilter !== 'all') {
      filtered = filtered.filter(b => b.status === activeFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(b =>
        b.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.parkingSpot?.spotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(filtered);
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

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await axios.put(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getFilterCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  const exportToCSV = () => {
    const headers = ['Booking ID', 'Spot', 'Vehicle', 'User', 'Arrival Time', 'Status', 'Amount'];
    const rows = filteredBookings.map(b => [
      String(b._id).slice(-8).toUpperCase(),
      b.parkingSpot?.spotNumber || 'N/A',
      b.vehicleNumber,
      b.user?.name || 'N/A',
      new Date(b.arrivalTime).toLocaleString(),
      b.status,
      b.totalAmount || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Exported to CSV!');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading bookings...</p>
      </div>
    );
  }

  return (
    <div className="bookings-container">

      {/* Page Header */}
      <div className="bookings-header">
        <div className="header-left">
          <h1>📋 Bookings Management</h1>
          <p>View and manage all parking reservations</p>
        </div>
        <div className="header-actions">
          <button className="export-btn" onClick={exportToCSV}>
            📥 Export CSV
          </button>
          <button className="refresh-btn" onClick={fetchBookings}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bookings-stats">
        <div className="stat-item">
          <span className="stat-number">{bookings.length}</span>
          <span className="stat-label">Total Bookings</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {bookings.filter(b => b.status === 'active' || b.status === 'reserved').length}
          </span>
          <span className="stat-label">Active/Reserved</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {bookings.filter(b => b.status === 'completed').length}
          </span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            ₹{bookings
              .filter(b => b.status === 'completed')
              .reduce((sum, b) => sum + (b.totalAmount || 0), 0)}
          </span>
          <span className="stat-label">Total Revenue</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bookings-controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by vehicle, spot, or user name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-tabs">
          {[
            { key: 'all', label: 'All' },
            { key: 'reserved', label: 'Reserved' },
            { key: 'active', label: 'Active' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label} ({getFilterCount(tab.key)})
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length > 0 ? (
        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Spot</th>
                <th>Vehicle Number</th>
                <th>User</th>
                <th>Arrival Time</th>
                <th>Check-in</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map(booking => {
                const badge = getStatusBadge(booking.status);
                return (
                  <tr key={booking._id}>
                    <td>
                      <span className="booking-id">
                        #{String(booking._id).slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span className="spot-badge">
                        {booking.parkingSpot?.spotNumber || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="vehicle-number">
                        🚗 {booking.vehicleNumber}
                      </span>
                    </td>
                    <td>{booking.user?.name || 'N/A'}</td>
                    <td className="time-cell">
                      {new Date(booking.arrivalTime).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short'
                      })}
                    </td>
                    <td className="time-cell">
                      {booking.checkInTime
                        ? new Date(booking.checkInTime).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })
                        : '-'}
                    </td>
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
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => handleViewDetails(booking)}
                        >
                          📌
                        </button>
                        {booking.status === 'reserved' && (
                          <button
                            className="btn-cancel"
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-bookings">
          <div className="no-bookings-icon">📋</div>
          <h3>No bookings found</h3>
          <p>
            {searchTerm
              ? 'Try adjusting your search terms'
              : activeFilter === 'all'
              ? 'No bookings in the system yet'
              : `No ${activeFilter} bookings`}
          </p>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📋 Booking Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Booking ID</span>
                  <span className="detail-value">
                    #{String(selectedBooking._id).slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Parking Spot</span>
                  <span className="detail-value">
                    {selectedBooking.parkingSpot?.spotNumber || 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Vehicle Number</span>
                  <span className="detail-value">{selectedBooking.vehicleNumber}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User Name</span>
                  <span className="detail-value">
                    {selectedBooking.user?.name || 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User Email</span>
                  <span className="detail-value">
                    {selectedBooking.user?.email || 'N/A'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Arrival Time</span>
                  <span className="detail-value">
                    {new Date(selectedBooking.arrivalTime).toLocaleString()}
                  </span>
                </div>
                {selectedBooking.checkInTime && (
                  <div className="detail-item">
                    <span className="detail-label">Check-in Time</span>
                    <span className="detail-value">
                      {new Date(selectedBooking.checkInTime).toLocaleString()}
                    </span>
                  </div>
                )}
                {selectedBooking.checkOutTime && (
                  <div className="detail-item">
                    <span className="detail-label">Check-out Time</span>
                    <span className="detail-value">
                      {new Date(selectedBooking.checkOutTime).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value">
                    {getStatusBadge(selectedBooking.status).label}
                  </span>
                </div>
                {selectedBooking.totalAmount > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">Amount</span>
                    <span className="detail-value amount-large">
                      ₹{selectedBooking.totalAmount}
                    </span>
                  </div>
                )}
              </div>

              {selectedBooking.qrCode && (
                <div className="qr-section">
                  <h3>QR Code</h3>
                  <img
                    src={selectedBooking.qrCode}
                    alt="QR Code"
                    className="qr-image"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;