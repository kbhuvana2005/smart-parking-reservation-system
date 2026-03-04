const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { startReminderScheduler } = require('./utils/reminderScheduler');
const { startAutoReleaseScheduler } = require('./utils/autoRelease');


// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Start schedulers
startReminderScheduler();
startAutoReleaseScheduler();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/parking-spots', require('./routes/parkingSpots'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/facilities', require('./routes/facilities'));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Parking System API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}`);
});