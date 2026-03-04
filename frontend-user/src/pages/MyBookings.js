import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './MyBookings.css';

function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [activeFilter, bookings]);

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
    if (activeFilter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(b => b.status === activeFilter));
    }
  };

  const handleCancel = async (e, bookingId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await axios.put(`/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    }
  };

  const downloadQR = async (e, booking) => {
    e.stopPropagation();
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 400;
      canvas.height = 500;

      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 400, 80);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 22px Poppins, Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🅿 SMART PARKING', 200, 35);
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.fillText('Entry / Exit QR Code', 200, 60);

      ctx.fillStyle = 'white';
      ctx.fillRect(0, 80, 400, 420);

      const qrImage = new Image();
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 25, 100, 350, 250);

        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Spot: ${booking.parkingSpot?.spotNumber}`, 200, 385);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(`Vehicle: ${booking.vehicleNumber}`, 200, 410);
        ctx.fillText(`${new Date(booking.arrivalTime).toLocaleString()}`, 200, 435);

        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 13px Arial';
        ctx.fillText('Show this QR at entry and exit gate', 200, 465);

        const link = document.createElement('a');
        link.download = `parking-qr-${booking.parkingSpot?.spotNumber}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success('QR Code downloaded!');
      };
      qrImage.src = booking.qrCode;
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const getFilterCount = (status) => {
    if (status === 'all') return bookings.length;
    return bookings.filter(b => b.status === status).length;
  };

  if (loading) return <div className="loading">Loading bookings...</div>;

  return (
    <div className="my-bookings-container">

      {/* Header */}
      <div className="page-header">
        <h1>My Bookings</h1>
        <p>Manage all your parking reservations</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {[
          { key: 'all', label: '🅿️ All' },
          { key: 'reserved', label: '🟡 Reserved' },
          { key: 'active', label: '🟢 Active' },
          { key: 'completed', label: '✅ Completed' },
          { key: 'cancelled', label: '🔴 Cancelled' }
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

      {/* Bookings Grid */}
      {filteredBookings.length > 0 ? (
        <div className="bookings-grid">
          {filteredBookings.map(booking => (
            <div
              key={booking._id}
              className="booking-card"
              onClick={() => navigate(`/booking/${booking._id}`)}
            >
              {/* Card Top */}
              <div className="booking-card-top">
                <div className="booking-spot-info">
                  <h3>🅿️ {booking.parkingSpot?.spotNumber || 'N/A'}</h3>
                  <p>Floor {booking.parkingSpot?.floor} • Zone {booking.parkingSpot?.zone}</p>
                </div>
                <span className={`booking-status-badge ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              {/* Card Body */}
              <div className="booking-card-body">
                <div className="booking-detail">
                  <span className="booking-detail-label">Vehicle</span>
                  <span className="booking-detail-value">🚗 {booking.vehicleNumber}</span>
                </div>
                <div className="booking-detail">
                  <span className="booking-detail-label">Arrival Time</span>
                  <span className="booking-detail-value">
                    {new Date(booking.arrivalTime).toLocaleString()}
                  </span>
                </div>
                {booking.checkInTime && (
                  <div className="booking-detail">
                    <span className="booking-detail-label">Check In</span>
                    <span className="booking-detail-value">
                      {new Date(booking.checkInTime).toLocaleString()}
                    </span>
                  </div>
                )}
                {booking.totalAmount > 0 && (
                  <div className="booking-detail">
                    <span className="booking-detail-label">Amount</span>
                    <span className={`booking-detail-value amount ${booking.paymentStatus}`}>
                      ₹{booking.totalAmount}
                      {booking.paymentStatus === 'pending' && (
                        <span style={{ fontSize: '11px', marginLeft: '5px' }}>
                          (Pending)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="booking-card-footer">
                <button
                  className="btn-view"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/booking/${booking._id}`);
                  }}
                >
                  View Details
                </button>

                {(booking.status === 'reserved' || booking.status === 'active') && (
                  <button
                    className="btn-download"
                    onClick={(e) => downloadQR(e, booking)}
                  >
                    📥 QR Code
                  </button>
                )}

                {booking.status === 'reserved' && (
                  <button
                    className="btn-cancel"
                    onClick={(e) => handleCancel(e, booking._id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-bookings">
          <div className="no-bookings-icon">🅿️</div>
          <h3>No {activeFilter === 'all' ? '' : activeFilter} bookings found</h3>
          <p>
            {activeFilter === 'all'
              ? 'Start by booking your first parking spot!'
              : `You have no ${activeFilter} bookings.`}
          </p>
          {activeFilter === 'all' && (
            <Link to="/parking-spots" className="book-now-btn">
              🚗 Book Parking Now
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default MyBookings;