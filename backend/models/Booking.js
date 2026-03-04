const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parkingSpot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingSpot',
    required: true
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  arrivalTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['reserved', 'active', 'completed', 'cancelled'],
    default: 'reserved'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    default: ''
  },
  qrCode: {
    type: String,
    default: ''
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  totalHours: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  reminderSent: {
  type: Boolean,
  default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', bookingSchema);