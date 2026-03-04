const express = require('express');
const router = express.Router();
const ParkingSpot = require('../models/ParkingSpot');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/parking-spots
// @desc    Get all parking spots with booking info
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { floor, zone, type, available } = req.query;
    let query = {};

    if (floor) query.floor = floor;
    if (zone) query.zone = zone;
    if (type) query.type = type;
    if (available !== undefined) query.isAvailable = available === 'true';

    const parkingSpots = await ParkingSpot.find(query).sort({ spotNumber: 1 });

    // Get all active/reserved bookings
    const Booking = require('../models/Booking');
    const activeBookings = await Booking.find({
      status: { $in: ['reserved', 'active'] }
    }).populate('parkingSpot');

    // Map bookings to spots
    const bookingMap = {};
    activeBookings.forEach(booking => {
      if (booking.parkingSpot) {
        bookingMap[booking.parkingSpot._id.toString()] = {
          arrivalTime: booking.arrivalTime,
          vehicleNumber: booking.vehicleNumber,
          status: booking.status
        };
      }
    });

    // Attach booking info to spots
    const spotsWithBookings = parkingSpots.map(spot => {
      const spotObj = spot.toObject();
      const booking = bookingMap[spot._id.toString()];
      
      if (booking) {
        spotObj.currentBooking = {
          arrivalTime: booking.arrivalTime,
          vehicleNumber: booking.vehicleNumber,
          status: booking.status
        };
      }
      
      return spotObj;
    });

    res.status(200).json({
      success: true,
      count: spotsWithBookings.length,
      data: spotsWithBookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/parking-spots/:id
// @desc    Get single parking spot
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const parkingSpot = await ParkingSpot.findById(req.params.id);

    if (!parkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }

    res.status(200).json({
      success: true,
      data: parkingSpot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/parking-spots
// @desc    Create parking spot
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const parkingSpot = await ParkingSpot.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Parking spot created successfully',
      data: parkingSpot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/parking-spots/:id
// @desc    Update parking spot
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const parkingSpot = await ParkingSpot.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!parkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Parking spot updated successfully',
      data: parkingSpot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/parking-spots/:id
// @desc    Delete parking spot
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const parkingSpot = await ParkingSpot.findByIdAndDelete(req.params.id);

    if (!parkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Parking spot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;