const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ParkingSpot = require('./models/ParkingSpot');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await ParkingSpot.deleteMany();

    // Create admin user
    await User.create({
      name: 'Admin User',
      email: 'admin@parking.com',
      password: 'Admin@123',
      phone: '1234567890',
      role: 'admin'
    });

    // Create sample parking spots
    const spots = [];
    const zones = ['A', 'B', 'C', 'D'];
    const types = ['regular', 'compact', 'handicapped', 'electric'];
    
    for (let floor = 1; floor <= 3; floor++) {
      for (let i = 1; i <= 20; i++) {
        spots.push({
          spotNumber: `${zones[(i-1) % 4]}-${floor}${String(i).padStart(2, '0')}`,
          floor: floor,
          zone: zones[(i-1) % 4],
          type: types[i % 4],
          pricePerHour: types[i % 4] === 'electric' ? 15 : types[i % 4] === 'handicapped' ? 10 : 12,
          isAvailable: true
        });
      }
    }

    await ParkingSpot.insertMany(spots);

    console.log('✅ Seed data created successfully');
    console.log(`📊 Created ${spots.length} parking spots`);
    console.log('👤 Admin login: admin@parking.com / Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

seedData();