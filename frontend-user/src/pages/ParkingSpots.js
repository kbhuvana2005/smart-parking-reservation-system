import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import ParkingMap from '../components/ParkingMap';
import './ParkingSpots.css';

function ParkingSpots() {
  const navigate = useNavigate();
  const [parkingSpots, setParkingSpots] = useState([]);
  const [filteredSpots, setFilteredSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    floor: '',
    zone: '',
    type: '',
    available: ''
  });
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    vehicleNumber: '',
    arrivalTime: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchParkingSpots = useCallback(async () => {
    try {
      const response = await axios.get('/parking-spots');
      setParkingSpots(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch parking spots');
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...parkingSpots];

    if (filters.floor) {
      filtered = filtered.filter(spot => spot.floor === parseInt(filters.floor));
    }
    if (filters.zone) {
      filtered = filtered.filter(spot => spot.zone === filters.zone);
    }
    if (filters.type) {
      filtered = filtered.filter(spot => spot.type === filters.type);
    }
    if (filters.available === 'true') {
      filtered = filtered.filter(spot => spot.isAvailable);
    } else if (filters.available === 'false') {
      filtered = filtered.filter(spot => !spot.isAvailable);
    }

    setFilteredSpots(filtered);
  }, [filters, parkingSpots]);

  useEffect(() => {
    fetchParkingSpots();
  }, [fetchParkingSpots]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchParkingSpots();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchParkingSpots]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSpotClick = (spot) => {
    setSelectedSpot(spot);

    if (!spot.isAvailable && spot.currentBooking) {
      setShowInfoModal(true);
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 30);
      const defaultArrival = now.toISOString().slice(0, 16);

      setBookingData({
        vehicleNumber: user.vehicleNumber || '',
        arrivalTime: defaultArrival
      });
      setShowBookingModal(true);
    }
  };

  const handleBookAnyway = () => {
    setShowInfoModal(false);

    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    const defaultArrival = now.toISOString().slice(0, 16);

    setBookingData({
      vehicleNumber: user.vehicleNumber || '',
      arrivalTime: defaultArrival
    });
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!bookingData.arrivalTime) {
      toast.error('Please select arrival time');
      return;
    }

    if (!bookingData.vehicleNumber.trim()) {
      toast.error('Please enter vehicle number');
      return;
    }

    const arrival = new Date(bookingData.arrivalTime);
    const now = new Date();

    if (arrival < now) {
      toast.error('Arrival time cannot be in the past');
      return;
    }

    try {
      const response = await axios.post('/bookings', {
        parkingSpotId: selectedSpot._id,
        vehicleNumber: bookingData.vehicleNumber.trim(),
        arrivalTime: bookingData.arrivalTime
      });

      toast.success('Booking created! Check your email for confirmation.');
      setShowBookingModal(false);
      fetchParkingSpots();
      navigate(`/booking/${response.data.data._id}`);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Booking failed.';
      toast.error(errorMessage);
    }
  };

  const getAvailabilityStatus = (spot) => {
    if (spot.isAvailable) {
      return { text: '✓ Available', className: 'available' };
    }

    if (spot.currentBooking) {
      const arrival = new Date(spot.currentBooking.arrivalTime);
      const now = new Date();
      const releaseTime = new Date(arrival.getTime() + 20 * 60 * 1000);

      if (spot.currentBooking.status === 'active') {
        return { text: '🚗 Occupied', className: 'occupied' };
      }

      if (now < arrival) {
        return { text: '🔒 Reserved', className: 'reserved' };
      } else if (now < releaseTime) {
        const minutesLeft = Math.ceil((releaseTime - now) / (1000 * 60));
        return { text: `⏰ ${minutesLeft}m left`, className: 'releasing' };
      }
    }

    return { text: '🔒 Reserved', className: 'reserved' };
  };

  if (loading) {
    return <div className="loading">Loading parking spots...</div>;
  }

  return (
    <div className="parking-spots-container">

      {/* ✅ Page Header */}
      <div className="page-header">
        <h1>🅿️ Parking Spots</h1>
        <p>Click on any spot to view details or reserve</p>
      </div>

      {/* ✅ Map Section */}
      <ParkingMap />

      {/* ✅ Filters Section */}
      <div className="filters-section">
        <div className="filters-grid">
          <select name="floor" value={filters.floor} onChange={handleFilterChange}>
            <option value="">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
          </select>

          <select name="zone" value={filters.zone} onChange={handleFilterChange}>
            <option value="">All Zones</option>
            <option value="A">Zone A</option>
            <option value="B">Zone B</option>
            <option value="C">Zone C</option>
            <option value="D">Zone D</option>
          </select>

          <select name="type" value={filters.type} onChange={handleFilterChange}>
            <option value="">All Types</option>
            <option value="regular">Regular</option>
            <option value="compact">Compact</option>
            <option value="handicapped">Handicapped</option>
            <option value="electric">Electric</option>
          </select>

          <select name="available" value={filters.available} onChange={handleFilterChange}>
            <option value="">All Spots</option>
            <option value="true">Available Only</option>
            <option value="false">Reserved Only</option>
          </select>
        </div>
      </div>

      {/* ✅ Legend */}
      <div className="spots-legend">
        <div className="legend-item">
          <div className="legend-dot available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot reserved"></div>
          <span>Reserved</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot occupied"></div>
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <div className="legend-dot releasing"></div>
          <span>Releasing Soon</span>
        </div>
      </div>

      {/* ✅ SPOTS GRID - Small rectangle boxes */}
      <div className="spots-grid">
        {filteredSpots.length > 0 ? (
          filteredSpots.map(spot => {
            const status = getAvailabilityStatus(spot);
            return (
              <div
                key={spot._id}
                className={`spot-card ${!spot.isAvailable ? 'occupied' : ''}`}
                onClick={() => handleSpotClick(spot)}
              >
                {/* Color Bar at top */}
                <div className={`spot-card-bar ${status.className}`}></div>

                {/* Card Body */}
                <div className="spot-card-body">

                  {/* Spot Number */}
                  <span className="spot-number">{spot.spotNumber}</span>

                  {/* Status Badge */}
                  <span className={`availability ${status.className}`}>
                    {status.text}
                  </span>

                  {/* Details */}
                  <div className="spot-details">
                    <div className="spot-detail-row">
                      <span className="detail-label">Floor</span>
                      <span className="detail-value">{spot.floor}</span>
                    </div>
                    <div className="spot-detail-row">
                      <span className="detail-label">Zone</span>
                      <span className="detail-value">{spot.zone}</span>
                    </div>
                    <div className="spot-detail-row">
                      <span className="detail-label">Type</span>
                      <span className={`spot-type-badge ${spot.type}`}>
                        {spot.type}
                      </span>
                    </div>
                    <div className="spot-detail-row">
                      <span className="detail-label">Rate</span>
                      <span className="spot-price">
                        ₹{spot.pricePerHour}<span>/hr</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Click Hint */}
                <div className="click-hint">
                  {spot.isAvailable ? '👆 Book' : '👆 Details'}
                </div>
              </div>
            );
          })
        ) : (
          <p className="no-spots">No parking spots found matching your filters.</p>
        )}
      </div>

      {/* ✅ INFO MODAL - Reserved Spot Details */}
      {showInfoModal && selectedSpot && (
        <div className="modal-overlay" onClick={() => setShowInfoModal(false)}>
          <div className="modal-content info-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🔒 Spot {selectedSpot.spotNumber}</h2>
              <button className="close-btn" onClick={() => setShowInfoModal(false)}>×</button>
            </div>

            <div className="spot-info-details">
              <div className="info-row">
                <span className="label">Floor</span>
                <span className="value">{selectedSpot.floor}</span>
              </div>
              <div className="info-row">
                <span className="label">Zone</span>
                <span className="value">{selectedSpot.zone}</span>
              </div>
              <div className="info-row">
                <span className="label">Type</span>
                <span className="value">{selectedSpot.type}</span>
              </div>
              <div className="info-row">
                <span className="label">Rate</span>
                <span className="value">₹{selectedSpot.pricePerHour}/hour</span>
              </div>
            </div>

            {selectedSpot.currentBooking && (
              <div className="current-booking-info">
                <h3>📋 Current Reservation</h3>
                <div className="booking-details">
                  <div className="detail-item">
                    <span className="icon">🚗</span>
                    <div>
                      <p className="detail-label">Status</p>
                      <p className="detail-value">
                        {selectedSpot.currentBooking.status === 'active'
                          ? 'Currently Occupied'
                          : 'Reserved'}
                      </p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="icon">⏰</span>
                    <div>
                      <p className="detail-label">
                        {selectedSpot.currentBooking.status === 'active'
                          ? 'Checked In At'
                          : 'Reserved From'}
                      </p>
                      <p className="detail-value">
                        {new Date(selectedSpot.currentBooking.arrivalTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedSpot.currentBooking.status === 'reserved' && (
                  <div className="availability-note">
                    <p>💡 <strong>Good News!</strong> You can book for a different time!</p>
                    <p>Auto-released if user doesn't arrive within 20 minutes.</p>
                  </div>
                )}

                {selectedSpot.currentBooking.status === 'active' && (
                  <div className="availability-note occupied-note">
                    <p>🚗 Currently occupied.</p>
                    <p>You can book it for a later time slot.</p>
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowInfoModal(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={handleBookAnyway}>
                Book for Different Time
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ BOOKING MODAL */}
      {showBookingModal && selectedSpot && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reserve {selectedSpot.spotNumber}</h2>
              <button className="close-btn" onClick={() => setShowBookingModal(false)}>×</button>
            </div>

            <div className="modal-body">
              <div className="selected-spot-info">
                <p>
                  <strong>Floor {selectedSpot.floor}</strong> •
                  <strong> Zone {selectedSpot.zone}</strong> •
                  <strong> {selectedSpot.type}</strong>
                </p>
                <p><strong>Rate:</strong> ₹{selectedSpot.pricePerHour}/hour</p>
                <p className="info-text">
                  💡 Amount calculated based on actual parking duration
                </p>
              </div>

              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label>Vehicle Number *</label>
                  <input
                    type="text"
                    value={bookingData.vehicleNumber}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      vehicleNumber: e.target.value
                    })}
                    required
                    placeholder="e.g., TN-59-BH-0425"
                  />
                </div>

                <div className="form-group">
                  <label>Expected Arrival Time *</label>
                  <input
                    type="datetime-local"
                    value={bookingData.arrivalTime}
                    onChange={(e) => setBookingData({
                      ...bookingData,
                      arrivalTime: e.target.value
                    })}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <small>📍 Scan QR at entry to check-in and at exit to check-out</small>
                  <small className="warning-text">
                    ⚠️ Auto-cancelled if you don't arrive within 20 minutes
                  </small>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowBookingModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    ✅ Confirm Reservation
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ParkingSpots;
