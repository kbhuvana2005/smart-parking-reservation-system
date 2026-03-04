import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './ParkingSpots.css';

function ParkingSpots() {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSpot, setCurrentSpot] = useState(null);
  const [formData, setFormData] = useState({
    spotNumber: '',
    floor: 1,
    zone: 'A',
    type: 'regular',
    pricePerHour: 10
  });

  useEffect(() => {
    fetchParkingSpots();
  }, []);

  const fetchParkingSpots = async () => {
    try {
      const response = await axios.get('/parking-spots');
      setSpots(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch parking spots');
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditMode(false);
    setCurrentSpot(null);
    setFormData({
      spotNumber: '',
      floor: 1,
      zone: 'A',
      type: 'regular',
      pricePerHour: 10
    });
    setShowModal(true);
  };

  const handleEdit = (spot) => {
    setEditMode(true);
    setCurrentSpot(spot);
    setFormData({
      spotNumber: spot.spotNumber,
      floor: spot.floor,
      zone: spot.zone,
      type: spot.type,
      pricePerHour: spot.pricePerHour
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this parking spot?')) {
      try {
        await axios.delete(`/parking-spots/${id}`);
        toast.success('Parking spot deleted successfully');
        fetchParkingSpots();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete parking spot');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`/parking-spots/${currentSpot._id}`, formData);
        toast.success('Parking spot updated successfully');
      } else {
        await axios.post('/parking-spots', formData);
        toast.success('Parking spot created successfully');
      }
      setShowModal(false);
      fetchParkingSpots();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="loading">Loading parking spots...</div>;
  }

  return (
    <div className="parking-spots-page">
      <div className="page-header">
        <div>
          <h1>Parking Spots Management</h1>
          <p>Manage all parking spots in the system</p>
        </div>
        <button className="add-btn" onClick={handleAddNew}>
          + Add New Spot
        </button>
      </div>

      <div className="spots-summary">
        <div className="summary-card">
          <h4>Total Spots</h4>
          <p>{spots.length}</p>
        </div>
        <div className="summary-card">
          <h4>Available</h4>
          <p>{spots.filter(s => s.isAvailable).length}</p>
        </div>
        <div className="summary-card">
          <h4>Occupied</h4>
          <p>{spots.filter(s => !s.isAvailable).length}</p>
        </div>
      </div>

      <div className="spots-table">
        <table>
          <thead>
            <tr>
              <th>Spot Number</th>
              <th>Floor</th>
              <th>Zone</th>
              <th>Type</th>
              <th>Price/Hour</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {spots.map((spot) => (
              <tr key={spot._id}>
                <td><strong>{spot.spotNumber}</strong></td>
                <td>{spot.floor}</td>
                <td>{spot.zone}</td>
                <td><span className="type-badge">{spot.type}</span></td>
                <td>₹{spot.pricePerHour}</td>
                <td>
                  <span className={`status-badge ${spot.isAvailable ? 'available' : 'occupied'}`}>
                    {spot.isAvailable ? 'Available' : 'Occupied'}
                  </span>
                </td>
                <td>
                  <button className="action-btn edit" onClick={() => handleEdit(spot)}>
                    Edit
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(spot._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editMode ? 'Edit Parking Spot' : 'Add New Parking Spot'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Spot Number *</label>
                <input
                  type="text"
                  name="spotNumber"
                  value={formData.spotNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., A-101"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Floor *</label>
                  <select name="floor" value={formData.floor} onChange={handleChange} required>
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Zone *</label>
                  <select name="zone" value={formData.zone} onChange={handleChange} required>
                    <option value="A">Zone A</option>
                    <option value="B">Zone B</option>
                    <option value="C">Zone C</option>
                    <option value="D">Zone D</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type *</label>
                  <select name="type" value={formData.type} onChange={handleChange} required>
                    <option value="regular">Regular</option>
                    <option value="compact">Compact</option>
                    <option value="handicapped">Handicapped</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Price per Hour (₹) *</label>
                  <input
                    type="number"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParkingSpots;