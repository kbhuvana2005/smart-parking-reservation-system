const cron = require('node-cron');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { sendReminderEmail } = require('./emailService');

// Run every minute to check for upcoming bookings
const startReminderScheduler = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const fifteenMinutesLater = new Date(now.getTime() + 15 * 60 * 1000);
      const sixteenMinutesLater = new Date(now.getTime() + 16 * 60 * 1000);

      // Find bookings that are 15 minutes away and haven't been reminded
      const upcomingBookings = await Booking.find({
        status: 'reserved',
        arrivalTime: {
          $gte: fifteenMinutesLater,
          $lt: sixteenMinutesLater
        },
        reminderSent: { $ne: true }
      }).populate('parkingSpot user');

      for (const booking of upcomingBookings) {
        if (booking.user) {
          console.log(`📧 Sending reminder for booking ${booking._id}`);
          await sendReminderEmail(booking, booking.user);
          
          // Mark reminder as sent
          booking.reminderSent = true;
          await booking.save();
        }
      }

      if (upcomingBookings.length > 0) {
        console.log(`✅ Sent ${upcomingBookings.length} reminder email(s)`);
      }
    } catch (error) {
      console.error('❌ Reminder scheduler error:', error);
    }
  });

  console.log('⏰ Reminder scheduler started - checking every minute');
};

module.exports = { startReminderScheduler };