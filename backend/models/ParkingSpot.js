const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  spotNumber: {
    type: String,
    required: true,
    unique: true
  },
  floor: {
    type: Number,
    required: true
  },
  zone: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  type: {
    type: String,
    required: true,
    enum: ['regular', 'compact', 'handicapped', 'electric']
  },
  pricePerHour: {
    type: Number,
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);