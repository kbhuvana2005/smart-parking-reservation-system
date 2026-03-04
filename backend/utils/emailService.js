const nodemailer = require('nodemailer');

// DON'T create transporter immediately - create it when needed
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  bookingConfirmation: (booking, user, qrCodeDataURL) => ({
    subject: '🎫 Parking Reservation Confirmed!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .label { color: #666; font-weight: 500; }
          .value { color: #333; font-weight: 600; }
          .qr-section { text-align: center; margin: 20px 0; }
          .qr-code { max-width: 300px; border: 2px solid #667eea; border-radius: 10px; padding: 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Parking Reserved Successfully!</h1>
            <p>Your parking spot is confirmed</p>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>Great news! Your parking reservation has been confirmed.</p>
            
            <div class="card">
              <h3>📋 Booking Details</h3>
              <div class="detail-row">
                <span class="label">Parking Spot:</span>
                <span class="value">${booking.parkingSpot.spotNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Floor:</span>
                <span class="value">${booking.parkingSpot.floor}</span>
              </div>
              <div class="detail-row">
                <span class="label">Zone:</span>
                <span class="value">${booking.parkingSpot.zone}</span>
              </div>
              <div class="detail-row">
                <span class="label">Vehicle Number:</span>
                <span class="value">${booking.vehicleNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Arrival Time:</span>
                <span class="value">${new Date(booking.arrivalTime).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Rate:</span>
                <span class="value">₹${booking.parkingSpot.pricePerHour}/hour</span>
              </div>
            </div>

            <div class="highlight">
              <strong>💡 Important:</strong> Amount will be calculated based on actual parking duration (Check-in to Check-out time)
            </div>

            <div class="qr-section">
              <h3>🎫 Your QR Code</h3>
              <p>Show this QR code at entry and exit</p>
              <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code" />
              <p style="color: #666; font-size: 14px;">Save this email or screenshot the QR code</p>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/booking/${booking._id}" class="button">View Booking Details</a>
            </div>

            <div class="card">
              <h4>📱 What's Next?</h4>
              <ol style="padding-left: 20px;">
                <li>Arrive at the parking facility</li>
                <li>Show your QR code at the entry gate</li>
                <li>Park at spot <strong>${booking.parkingSpot.spotNumber}</strong></li>
                <li>Show QR code again at exit for checkout</li>
              </ol>
            </div>

            <p>Need help? Reply to this email or contact support.</p>
            <p>Happy Parking! 🚗</p>
          </div>
          <div class="footer">
            <p>Smart Parking System | Your trusted parking solution</p>
            <p>This is an automated email. Please do not reply directly to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  reminderEmail: (booking, user) => ({
    subject: '⏰ Parking Reminder - 15 Minutes to Go!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .label { color: #666; font-weight: 500; }
          .value { color: #333; font-weight: 600; }
          .button { display: inline-block; background: #ffc107; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: 600; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
          .urgent { background: #fff3cd; padding: 15px; border-radius: 6px; border-left: 4px solid #ffc107; margin: 15px 0; font-size: 18px; font-weight: 600; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Don't Forget Your Parking!</h1>
            <p>Your reservation starts in 15 minutes</p>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            
            <div class="urgent">
              🚗 Your parking time is approaching!
            </div>

            <div class="card">
              <h3>📋 Quick Reminder</h3>
              <div class="detail-row">
                <span class="label">Parking Spot:</span>
                <span class="value">${booking.parkingSpot.spotNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Floor ${booking.parkingSpot.floor} - Zone ${booking.parkingSpot.zone}</span>
                <span class="value">${booking.vehicleNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Arrival Time:</span>
                <span class="value">${new Date(booking.arrivalTime).toLocaleString()}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/booking/${booking._id}" class="button">View QR Code</a>
            </div>

            <p style="margin-top: 20px;"><strong>Pro Tip:</strong> Have your QR code ready on your phone for quick check-in!</p>
            
            <p>See you soon! 🎫</p>
          </div>
          <div class="footer">
            <p>Smart Parking System</p>
          </div>
        </div>
      </body>
      </html>
    `
  }),

  checkoutReceipt: (booking, user) => ({
    subject: '🧾 Parking Receipt - Thank You!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
          .label { color: #666; font-weight: 500; }
          .value { color: #333; font-weight: 600; }
          .total-row { background: #d4edda; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .total-amount { font-size: 32px; color: #28a745; font-weight: bold; text-align: center; }
          .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Checkout Complete!</h1>
            <p>Thank you for parking with us</p>
          </div>
          <div class="content">
            <p>Hi ${user.name},</p>
            <p>You have successfully checked out. Here's your parking receipt:</p>
            
            <div class="card">
              <h3>🧾 Receipt Details</h3>
              <div class="detail-row">
                <span class="label">Receipt No:</span>
                <span class="value">${booking._id.slice(-8).toUpperCase()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Parking Spot:</span>
                <span class="value">${booking.parkingSpot.spotNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Vehicle Number:</span>
                <span class="value">${booking.vehicleNumber}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-in Time:</span>
                <span class="value">${new Date(booking.checkInTime).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Check-out Time:</span>
                <span class="value">${new Date(booking.checkOutTime).toLocaleString()}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">${booking.totalHours} hour${booking.totalHours !== 1 ? 's' : ''}</span>
              </div>
              <div class="detail-row">
                <span class="label">Rate:</span>
                <span class="value">₹${booking.parkingSpot.pricePerHour}/hour</span>
              </div>
            </div>

            <div class="total-row">
              <p style="margin: 0; text-align: center; color: #666;">Total Amount</p>
              <div class="total-amount">₹${booking.totalAmount}</div>
              <p style="margin: 10px 0 0 0; text-align: center; font-size: 14px; color: #666;">
                Payment Status: <strong style="color: #ffc107;">${booking.paymentStatus.toUpperCase()}</strong>
              </p>
            </div>

            ${booking.paymentStatus === 'pending' ? `
              <div style="text-align: center;">
                <p><strong>Please complete your payment</strong></p>
                <a href="${process.env.FRONTEND_URL}/booking/${booking._id}" class="button">Pay Now</a>
              </div>
            ` : ''}

            <p>Thank you for choosing Smart Parking System! We hope to see you again soon. 🚗</p>
            
            <p style="color: #666; font-size: 14px;">Keep this receipt for your records.</p>
          </div>
          <div class="footer">
            <p>Smart Parking System | Receipt generated on ${new Date().toLocaleString()}</p>
            <p>For any queries, please contact support.</p>
          </div>
        </div>
      </body>
      </html>
    `
  })
};

// Send email function - creates transporter each time
const sendEmail = async (to, template) => {
  try {
    const transporter = getTransporter(); // Create fresh transporter each time
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Smart Parking <noreply@parking.com>',
      to: to,
      subject: template.subject,
      html: template.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

// Export functions
module.exports = {
  sendBookingConfirmation: async (booking, user, qrCodeDataURL) => {
    const template = emailTemplates.bookingConfirmation(booking, user, qrCodeDataURL);
    return await sendEmail(user.email, template);
  },

  sendReminderEmail: async (booking, user) => {
    const template = emailTemplates.reminderEmail(booking, user);
    return await sendEmail(user.email, template);
  },

  checkoutReceipt: (booking, user) => ({
  subject: '🧾 Parking Receipt - Thank You!',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
        .label { color: #666; font-weight: 500; }
        .value { color: #333; font-weight: 600; }
        .total-row { background: #d4edda; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .total-amount { font-size: 32px; color: #28a745; font-weight: bold; text-align: center; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Checkout Complete!</h1>
          <p>Thank you for parking with us</p>
        </div>
        <div class="content">
          <p>Hi ${user.name},</p>
          <p>You have successfully checked out. Here's your parking receipt:</p>
          
          <div class="card">
            <h3>🧾 Receipt Details</h3>
            <div class="detail-row">
              <span class="label">Receipt No:</span>
              <span class="value">${String(booking._id).slice(-8).toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Parking Spot:</span>
              <span class="value">${booking.parkingSpot?.spotNumber || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Vehicle Number:</span>
              <span class="value">${booking.vehicleNumber}</span>
            </div>
            <div class="detail-row">
              <span class="label">Check-in Time:</span>
              <span class="value">${booking.checkInTime ? new Date(booking.checkInTime).toLocaleString() : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Check-out Time:</span>
              <span class="value">${booking.checkOutTime ? new Date(booking.checkOutTime).toLocaleString() : 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">${booking.totalHours || 0} hour${booking.totalHours !== 1 ? 's' : ''}</span>
            </div>
            <div class="detail-row">
              <span class="label">Rate:</span>
              <span class="value">₹${booking.parkingSpot?.pricePerHour || 0}/hour</span>
            </div>
          </div>

          <div class="total-row">
            <p style="margin: 0; text-align: center; color: #666;">Total Amount</p>
            <div class="total-amount">₹${booking.totalAmount || 0}</div>
            <p style="margin: 10px 0 0 0; text-align: center; font-size: 14px; color: #666;">
              Payment Status: <strong style="color: #ffc107;">${(booking.paymentStatus || 'pending').toUpperCase()}</strong>
            </p>
          </div>

          ${booking.paymentStatus === 'pending' ? `
            <div style="text-align: center;">
              <p><strong>Please complete your payment</strong></p>
              <a href="${process.env.FRONTEND_URL}/booking/${booking._id}" class="button">Pay Now</a>
            </div>
          ` : ''}

          <p>Thank you for choosing Smart Parking System! We hope to see you again soon. 🚗</p>
          
          <p style="color: #666; font-size: 14px;">Keep this receipt for your records.</p>
        </div>
        <div class="footer">
          <p>Smart Parking System | Receipt generated on ${new Date().toLocaleString()}</p>
          <p>For any queries, please contact support.</p>
        </div>
      </div>
    </body>
    </html>
  `
})
};