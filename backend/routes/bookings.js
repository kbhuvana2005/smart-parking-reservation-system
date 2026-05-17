const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');
const QRCode = require('qrcode');
const { protect, authorize } = require('../middleware/auth');
const { sendBookingConfirmation, sendCheckoutReceipt } = require('../utils/emailService');

// @route   POST /api/bookings
// @desc    Create a new booking (only arrival time needed)
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { parkingSpotId, vehicleNumber, arrivalTime } = req.body;

    // Validate input
    if (!parkingSpotId || !vehicleNumber || !arrivalTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if parking spot exists
    const parkingSpot = await ParkingSpot.findById(parkingSpotId);
    if (!parkingSpot) {
      return res.status(404).json({
        success: false,
        message: 'Parking spot not found'
      });
    }

    // Parse arrival time
    const arrival = new Date(arrivalTime);
    const now = new Date();

    // Validate arrival time
    if (arrival < now) {
      return res.status(400).json({
        success: false,
        message: 'Arrival time cannot be in the past'
      });
    }

    // Check if spot is currently occupied (has active or reserved booking)
    const activeBooking = await Booking.findOne({
      parkingSpot: parkingSpotId,
      status: { $in: ['reserved', 'active'] }
    });

    if (activeBooking) {
      return res.status(400).json({
        success: false,
        message: 'This parking spot is currently occupied or reserved. Please choose another spot or different time.'
      });
    }

    // Generate QR Code with booking info
    const bookingId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const qrData = {
      bookingId: bookingId,
      spotNumber: parkingSpot.spotNumber,
      spotId: parkingSpot._id,
      vehicleNumber: vehicleNumber,
      arrivalTime: arrival.toISOString(),
      userId: req.user._id
    };
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      parkingSpot: parkingSpotId,
      vehicleNumber,
      arrivalTime: arrival,
      qrCode,
      status: 'reserved',
      paymentStatus: 'pending'
    });

    // Mark parking spot as unavailable
    parkingSpot.isAvailable = false;
    await parkingSpot.save();

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('parkingSpot')
      .populate('user', 'name email phone');

    // Send confirmation email
    try {
      await sendBookingConfirmation(populatedBooking, populatedBooking.user, qrCode);
      console.log('✅ Confirmation email sent to:', populatedBooking.user.email);
    } catch (emailError) {
      console.error('❌ Email send failed:', emailError.message);
      // Don't fail the booking if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Booking created successfully! Check your email for confirmation.',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create booking'
    });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings (admin) or user's bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    // If not admin, show only user's bookings
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const bookings = await Booking.find(query)
      .populate('parkingSpot')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('parkingSpot')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (req.user.role !== 'admin' && booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/bookings/scan-qr
// @desc    Scan QR code for check-in or check-out
// @access  Public (can be accessed by parking attendant)
router.post('/scan-qr', async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    // Parse QR data
    const data = JSON.parse(qrData);
    const { spotId, vehicleNumber } = data;

    // Find the booking
    const booking = await Booking.findOne({
      parkingSpot: spotId,
      vehicleNumber: vehicleNumber,
      status: { $in: ['reserved', 'active'] }
    }).populate('parkingSpot').populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'No active booking found for this vehicle'
      });
    }

    // If status is 'reserved', perform check-in
    if (booking.status === 'reserved') {
      booking.status = 'active';
      booking.checkInTime = new Date();
      await booking.save();

      return res.status(200).json({
        success: true,
        action: 'check-in',
        message: `Welcome! Checked in at ${booking.parkingSpot.spotNumber}`,
        data: booking
      });
    }

    // If status is 'active', perform check-out
    if (booking.status === 'active') {
      booking.status = 'completed';
      booking.checkOutTime = new Date();

      // Calculate duration and amount
      const duration = (booking.checkOutTime - booking.checkInTime) / (1000 * 60 * 60); // hours
      booking.totalHours = Math.ceil(duration);
      booking.totalAmount = booking.totalHours * booking.parkingSpot.pricePerHour;

      await booking.save();

      // Make parking spot available
      await ParkingSpot.findByIdAndUpdate(booking.parkingSpot._id, {
        isAvailable: true
      });

      // Send checkout receipt email - Re-populate to get fresh data
      try {
        const freshBooking = await Booking.findById(booking._id)
          .populate('parkingSpot')
          .populate('user', 'name email phone');
        
        if (freshBooking && freshBooking.user && freshBooking.user.email) {
          await sendCheckoutReceipt(freshBooking, freshBooking.user);
          console.log('✅ Checkout receipt email sent to:', freshBooking.user.email);
        } else {
          console.error('❌ Receipt email failed: Missing user or email data');
        }
      } catch (emailError) {
        console.error('❌ Receipt email failed:', emailError.message);
        // Don't fail the checkout if email fails
      }

      // Re-populate for response
      const finalBooking = await Booking.findById(booking._id)
        .populate('parkingSpot')
        .populate('user', 'name email phone');

      return res.status(200).json({
        success: true,
        action: 'check-out',
        message: `Checked out successfully! Total: ₹${booking.totalAmount}`,
        data: {
          booking: finalBooking,
          duration: finalBooking.totalHours,
          amount: finalBooking.totalAmount
        }
      });
    }

  } catch (error) {
    console.error('QR Scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Invalid QR code or scan failed'
    });
  }
});

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Can only cancel reserved bookings
    if (booking.status !== 'reserved') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel ${booking.status} booking`
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Make parking spot available again
    await ParkingSpot.findByIdAndUpdate(booking.parkingSpot, {
      isAvailable: true
    });

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
