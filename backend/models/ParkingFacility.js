const mongoose = require('mongoose');

const parkingFacilitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  totalSpots: {
    type: Number,
    required: true
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  amenities: [{
    type: String
  }],
  openTime: {
    type: String,
    default: '00:00'
  },
  closeTime: {
    type: String,
    default: '23:59'
  },
  priceRange: {
    type: String,
    default: '₹10-15/hr'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create geospatial index
parkingFacilitySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('ParkingFacility', parkingFacilitySchema);