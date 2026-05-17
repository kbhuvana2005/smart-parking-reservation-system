const cron = require('node-cron');
const Booking = require('../models/Booking');
const ParkingSpot = require('../models/ParkingSpot');

// Run every 5 minutes to check for no-shows
const startAutoReleaseScheduler = () => {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const now = new Date();
      const twentyMinutesAgo = new Date(now.getTime() - 20 * 60 * 1000);

      // Find reserved bookings where arrival time was more than 20 minutes ago
      // and user hasn't checked in yet
      const noShowBookings = await Booking.find({
        status: 'reserved',
        arrivalTime: { $lt: twentyMinutesAgo },
        checkInTime: null
      }).populate('parkingSpot user');

      if (noShowBookings.length > 0) {
        console.log(`🔄 Found ${noShowBookings.length} no-show booking(s) - auto-releasing...`);

        for (const booking of noShowBookings) {
          // Cancel the booking
          booking.status = 'cancelled';
          await booking.save();

          // Release the parking spot
          if (booking.parkingSpot) {
            await ParkingSpot.findByIdAndUpdate(booking.parkingSpot._id, {
              isAvailable: true
            });
            console.log(`✅ Released spot ${booking.parkingSpot.spotNumber} - No show for booking ${booking._id}`);
          }

          // Optional: Send email notification to user
          // await sendNoShowNotification(booking, booking.user);
        }

        console.log(`✅ Auto-released ${noShowBookings.length} spot(s)`);
      }
    } catch (error) {
      console.error('❌ Auto-release scheduler error:', error);
    }
  });

  console.log('🔄 Auto-release scheduler started - checking every 5 minutes');
};

module.exports = { startAutoReleaseScheduler };
