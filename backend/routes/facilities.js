const express = require('express');
const router = express.Router();
const ParkingFacility = require('../models/ParkingFacility');
const ParkingSpot = require('../models/ParkingSpot');

// Get all facilities
router.get('/', async (req, res) => {
  try {
    const facilities = await ParkingFacility.find({ isActive: true });
    res.json({ success: true, data: facilities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get facilities near location
router.get('/nearby', async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Longitude and latitude are required'
      });
    }

    const facilities = await ParkingFacility.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      },
      isActive: true
    });

    // Add available spots count for each facility
    const facilitiesWithAvailability = await Promise.all(
      facilities.map(async (facility) => {
        const availableSpots = await ParkingSpot.countDocuments({
          isAvailable: true
        });
        
        return {
          ...facility.toObject(),
          availableSpots,
          distance: calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            facility.location.coordinates[1],
            facility.location.coordinates[0]
          )
        };
      })
    );

    res.json({ success: true, data: facilitiesWithAvailability });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

module.exports = router;