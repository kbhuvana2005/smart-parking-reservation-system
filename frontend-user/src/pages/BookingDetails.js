import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './BookingDetails.css';

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const response = await axios.get(`/bookings/${id}`);
      setBooking(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load booking details');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.put(`/bookings/${id}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBooking();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    }
  };

  const downloadQRCode = async () => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 420;
      canvas.height = 560;

      // Background
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(0, 0, 420, 100);

      // Header Text
      ctx.fillStyle = 'white';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🅿 SMART PARKING', 210, 38);
      ctx.font = '14px Arial';
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillText('Entry / Exit QR Code', 210, 65);
      ctx.fillText('Prozone Mall, Coimbatore', 210, 85);

      // White background for QR
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 100, 420, 460);

      // QR Image
      const qrImage = new Image();
      qrImage.onload = () => {
        ctx.drawImage(qrImage, 35, 115, 350, 280);

        // Divider
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 415);
        ctx.lineTo(390, 415);
        ctx.stroke();

        // Booking Details
        ctx.fillStyle = '#1a1a2e';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Spot: ${booking.parkingSpot?.spotNumber}`, 210, 445);

        ctx.font = '14px Arial';
        ctx.fillStyle = '#666';
        ctx.fillText(`Vehicle: ${booking.vehicleNumber}`, 210, 468);
        ctx.fillText(
          `Arrival: ${new Date(booking.arrivalTime).toLocaleString()}`,
          210, 490
        );

        // Footer
        ctx.fillStyle = '#e94560';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('Show this QR at entry and exit gate', 210, 530);

        const link = document.createElement('a');
        link.download = `parking-qr-${booking.parkingSpot?.spotNumber}-${booking.vehicleNumber}.png`;
        link.href = canvas.toDataURL();
        link.click();
        toast.success('QR Code downloaded!');
      };
      qrImage.src = booking.qrCode;
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusInfo = (status) => {
    const statuses = {
      reserved: {
        icon: '🟡',
        label: 'Reserved',
        color: '#856404',
        bg: '#fff8e1',
        border: '#ffc107',
        description: 'Your spot is reserved. Show QR at entry gate.'
      },
      active: {
        icon: '🟢',
        label: 'Active',
        color: '#155724',
        bg: '#d4edda',
        border: '#28a745',
        description: 'You are currently parked. Show QR at exit gate.'
      },
      completed: {
        icon: '✅',
        label: 'Completed',
        color: '#0f3460',
        bg: '#e8f0fe',
        border: '#0f3460',
        description: 'Parking session completed successfully.'
      },
      cancelled: {
        icon: '🔴',
        label: 'Cancelled',
        color: '#721c24',
        bg: '#f8d7da',
        border: '#dc3545',
        description: 'This booking has been cancelled.'
      }
    };
    return statuses[status] || statuses.reserved;
  };

  const getTimeline = () => {
    const steps = [
      {
        key: 'booked',
        icon: '📋',
        label: 'Booking Created',
        time: booking.createdAt,
        done: true
      },
      {
        key: 'checkin',
        icon: '🚗',
        label: 'Checked In',
        time: booking.checkInTime,
        done: !!booking.checkInTime
      },
      {
        key: 'checkout',
        icon: '🏁',
        label: 'Checked Out',
        time: booking.checkOutTime,
        done: !!booking.checkOutTime
      },
      {
        key: 'payment',
        icon: '💰',
        label: 'Payment',
        time: null,
        done: booking.paymentStatus === 'paid',
        status: booking.paymentStatus
      }
    ];
    return steps;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading booking details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="not-found">
        <h2>Booking not found</h2>
        <button onClick={() => navigate('/my-bookings')}>
          Back to My Bookings
        </button>
      </div>
    );
  }

  const statusInfo = getStatusInfo(booking.status);
  const timeline = getTimeline();

  return (
    <div className="booking-details-container">

      {/* Back Button */}
      <button className="back-btn" onClick={() => navigate('/my-bookings')}>
        ← Back to My Bookings
      </button>

      {/* Status Banner */}
      <div
        className="status-banner"
        style={{
          background: statusInfo.bg,
          borderColor: statusInfo.border
        }}
      >
        <div className="status-banner-left">
          <span className="status-banner-icon">{statusInfo.icon}</span>
          <div>
            <h2 style={{ color: statusInfo.color }}>
              Booking {statusInfo.label}
            </h2>
            <p style={{ color: statusInfo.color }}>
              {statusInfo.description}
            </p>
          </div>
        </div>
        <div className="booking-id">
          <span>Booking ID</span>
          <strong>#{String(booking._id).slice(-8).toUpperCase()}</strong>
        </div>
      </div>

      <div className="details-grid">

        {/* LEFT COLUMN */}
        <div className="details-left">

          {/* Spot Info Card */}
          <div className="detail-card">
            <div className="card-header">
              <h3>🅿️ Parking Spot</h3>
            </div>
            <div className="card-body">
              <div className="spot-display">
                <div className="spot-display-number">
                  {booking.parkingSpot?.spotNumber}
                </div>
                <div className="spot-display-info">
                  <div className="spot-display-row">
                    <span>Floor</span>
                    <strong>{booking.parkingSpot?.floor}</strong>
                  </div>
                  <div className="spot-display-row">
                    <span>Zone</span>
                    <strong>{booking.parkingSpot?.zone}</strong>
                  </div>
                  <div className="spot-display-row">
                    <span>Type</span>
                    <strong style={{ textTransform: 'capitalize' }}>
                      {booking.parkingSpot?.type}
                    </strong>
                  </div>
                  <div className="spot-display-row">
                    <span>Rate</span>
                    <strong style={{ color: '#e94560' }}>
                      ₹{booking.parkingSpot?.pricePerHour}/hr
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle & Time Card */}
          <div className="detail-card">
            <div className="card-header">
              <h3>🚗 Booking Info</h3>
            </div>
            <div className="card-body">
              <div className="info-list">
                <div className="info-list-item">
                  <div className="info-list-icon">🚗</div>
                  <div>
                    <span>Vehicle Number</span>
                    <strong>{booking.vehicleNumber}</strong>
                  </div>
                </div>
                <div className="info-list-item">
                  <div className="info-list-icon">⏰</div>
                  <div>
                    <span>Arrival Time</span>
                    <strong>
                      {new Date(booking.arrivalTime).toLocaleString()}
                    </strong>
                  </div>
                </div>
                {booking.checkInTime && (
                  <div className="info-list-item">
                    <div className="info-list-icon">✅</div>
                    <div>
                      <span>Check-in Time</span>
                      <strong>
                        {new Date(booking.checkInTime).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                )}
                {booking.checkOutTime && (
                  <div className="info-list-item">
                    <div className="info-list-icon">🏁</div>
                    <div>
                      <span>Check-out Time</span>
                      <strong>
                        {new Date(booking.checkOutTime).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                )}
                {booking.totalHours > 0 && (
                  <div className="info-list-item">
                    <div className="info-list-icon">🕐</div>
                    <div>
                      <span>Duration</span>
                      <strong>
                        {booking.totalHours} hour{booking.totalHours !== 1 ? 's' : ''}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timeline Card */}
          <div className="detail-card">
            <div className="card-header">
              <h3>📍 Booking Timeline</h3>
            </div>
            <div className="card-body">
              <div className="timeline">
                {timeline.map((step, index) => (
                  <div
                    key={step.key}
                    className={`timeline-item ${step.done ? 'done' : 'pending'}`}
                  >
                    <div className="timeline-left">
                      <div className={`timeline-dot ${step.done ? 'done' : 'pending'}`}>
                        {step.done ? '✓' : '○'}
                      </div>
                      {index < timeline.length - 1 && (
                        <div className={`timeline-line ${step.done ? 'done' : ''}`}></div>
                      )}
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-header">
                        <span className="timeline-icon">{step.icon}</span>
                        <strong>{step.label}</strong>
                        {step.status && (
                          <span className={`timeline-badge ${step.status}`}>
                            {step.status}
                          </span>
                        )}
                      </div>
                      {step.time && (
                        <p className="timeline-time">
                          {new Date(step.time).toLocaleString()}
                        </p>
                      )}
                      {!step.time && !step.done && (
                        <p className="timeline-time pending-text">Pending</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="details-right">

          {/* QR Code Card */}
          {(booking.status === 'reserved' || booking.status === 'active') && (
            <div className="detail-card qr-card">
              <div className="card-header">
                <h3>📱 Your QR Code</h3>
              </div>
              <div className="card-body">
                <div className="qr-container">
                  <img
                    src={booking.qrCode}
                    alt="QR Code"
                    className="qr-image"
                  />
                </div>
                <p className="qr-instruction">
                  {booking.status === 'reserved'
                    ? '📍 Show this QR code at the entry gate to check-in'
                    : '🏁 Show this QR code at the exit gate to check-out'}
                </p>
                <div className="qr-actions">
                  <button
                    className="btn-download-qr"
                    onClick={downloadQRCode}
                  >
                    📥 Download QR
                  </button>
                  <button
                    className="btn-print-qr"
                    onClick={handlePrint}
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Card */}
          <div className="detail-card payment-card">
            <div className="card-header">
              <h3>💰 Payment Summary</h3>
            </div>
            <div className="card-body">
              <div className="payment-rows">
                <div className="payment-row">
                  <span>Rate</span>
                  <span>₹{booking.parkingSpot?.pricePerHour}/hour</span>
                </div>
                {booking.totalHours > 0 && (
                  <div className="payment-row">
                    <span>Duration</span>
                    <span>{booking.totalHours} hours</span>
                  </div>
                )}
                <div className="payment-row total">
                  <span>Total Amount</span>
                  <span className="total-amount">
                    {booking.totalAmount > 0
                      ? `₹${booking.totalAmount}`
                      : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="payment-row">
                  <span>Payment Status</span>
                  <span className={`payment-status ${booking.paymentStatus}`}>
                    {booking.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                  </span>
                </div>
              </div>

              {booking.status === 'completed' &&
               booking.paymentStatus === 'pending' && (
                <div className="pay-section">
                  <p className="pay-note">
                    Please complete your payment at the counter
                  </p>
                </div>
              )}

              {booking.paymentStatus === 'paid' && (
                <div className="paid-badge">
                  ✅ Payment Complete
                  {booking.paymentId && (
                    <p>ID: {booking.paymentId}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="detail-card">
            <div className="card-header">
              <h3>⚡ Actions</h3>
            </div>
            <div className="card-body">
              <div className="actions-list">
                {booking.status === 'reserved' && (
                  <button
                    className="action-btn cancel-btn"
                    onClick={handleCancel}
                  >
                    ❌ Cancel Booking
                  </button>
                )}
                <button
                  className="action-btn back-btn-action"
                  onClick={() => navigate('/parking-spots')}
                >
                  🅿️ Book Another Spot
                </button>
                <button
                  className="action-btn my-bookings-btn"
                  onClick={() => navigate('/my-bookings')}
                >
                  📋 All My Bookings
                </button>
              </div>
            </div>
          </div>

          {/* Important Note */}
          {booking.status === 'reserved' && (
            <div className="important-note">
              <h4>⚠️ Important Reminder</h4>
              <p>
                Your booking will be <strong>auto-cancelled</strong> if
                you don't arrive within <strong>20 minutes</strong> of
                your scheduled arrival time.
              </p>
              <p>
                Arrival Time:{' '}
                <strong>
                  {new Date(booking.arrivalTime).toLocaleString()}
                </strong>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookingDetails;