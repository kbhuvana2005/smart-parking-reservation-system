import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import './NearMe.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#667eea" stroke="white" stroke-width="3"/>
      <circle cx="20" cy="20" r="8" fill="white"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

const parkingIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="#e94560" stroke="white" stroke-width="3"/>
      <text x="20" y="28" text-anchor="middle" fill="white" font-size="20" font-weight="bold">P</text>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

function NearMe() {
  const [facilities, setFacilities] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('map');
  const [selectedFacility, setSelectedFacility] = useState(null);

  // Default location (Coimbatore center)
  const defaultLocation = { lat: 11.0168, lng: 76.9558 };

  // 🎯 ALL TYPES OF PARKING - Malls, Hospitals, Stations, Government Buildings, etc.
  const allParkingFacilities = [
    // 🏬 SHOPPING MALLS
    {
      id: 1,
      name: 'Prozone Mall Parking',
      type: '🏬 Shopping Mall',
      address: 'SF 201, Sivanandapuram, Sathy Rd, Coimbatore',
      coordinates: { lat: 11.055124006359893, lng: 76.99430307798501 },
      rating: 4.5,
      amenities: ['CCTV', '24/7 Security', 'EV Charging', 'Covered'],
      priceRange: '₹10-15/hr',
      openTime: '24 Hours',
      capacity: '60 spots'
    },
    {
      id: 2,
      name: 'Brookefields Mall Parking',
      type: '🏬 Shopping Mall',
      address: 'Brookefields, Coimbatore',
      coordinates: { lat: 11.0168, lng: 77.0089 },
      rating: 4.3,
      amenities: ['CCTV', 'Valet Service', 'Covered'],
      priceRange: '₹15-20/hr',
      openTime: '24 Hours',
      capacity: '80 spots'
    },
    {
      id: 3,
      name: 'Fun Mall Parking',
      type: '🏬 Shopping Mall',
      address: 'Avinashi Road, Coimbatore',
      coordinates: { lat: 11.0301, lng: 77.0245 },
      rating: 4.0,
      amenities: ['CCTV', '24/7 Security'],
      priceRange: '₹10/hr',
      openTime: '24 Hours',
      capacity: '50 spots'
    },

    // 🏥 HOSPITALS
    {
      id: 4,
      name: 'Coimbatore Medical College Parking',
      type: '🏥 Hospital',
      address: 'Coimbatore Medical College, Avinashi Road',
      coordinates: { lat: 11.0096, lng: 76.9558 },
      rating: 4.2,
      amenities: ['CCTV', 'Security', 'Open Parking'],
      priceRange: '₹10/hr',
      openTime: '24 Hours',
      capacity: '100 spots'
    },
    {
      id: 5,
      name: 'KMCH Hospital Parking',
      type: '🏥 Hospital',
      address: 'Avanashi Road, Coimbatore',
      coordinates: { lat: 11.0183, lng: 76.9720 },
      rating: 4.3,
      amenities: ['CCTV', '24/7 Security', 'Covered'],
      priceRange: '₹10/hr',
      openTime: '24 Hours',
      capacity: '120 spots'
    },
    {
      id: 6,
      name: 'PSG Hospital Parking',
      type: '🏥 Hospital',
      address: 'Peelamedu, Coimbatore',
      coordinates: { lat: 11.0250, lng: 77.0070 },
      rating: 4.1,
      amenities: ['CCTV', 'Security'],
      priceRange: '₹10/hr',
      openTime: '24 Hours',
      capacity: '90 spots'
    },

    // 🚉 RAILWAY STATIONS
    {
      id: 7,
      name: 'Coimbatore Junction Parking',
      type: '🚉 Railway Station',
      address: 'Dr. Nanjappa Road, Coimbatore Junction',
      coordinates: { lat: 11.0074, lng: 76.9628 },
      rating: 4.0,
      amenities: ['CCTV', '24/7 Security', 'Prepaid'],
      priceRange: '₹20/day',
      openTime: '24 Hours',
      capacity: '200 spots'
    },

    // 🚌 BUS STANDS
    {
      id: 8,
      name: 'Gandhipuram Bus Stand Parking',
      type: '🚌 Bus Terminal',
      address: 'Gandhipuram, Coimbatore',
      coordinates: { lat: 11.0168, lng: 76.9674 },
      rating: 3.9,
      amenities: ['CCTV', 'Security', 'Open Parking'],
      priceRange: '₹15/day',
      openTime: '24 Hours',
      capacity: '150 spots'
    },
    {
      id: 9,
      name: 'Ukkadam Bus Stand Parking',
      type: '🚌 Bus Terminal',
      address: 'Ukkadam, Coimbatore',
      coordinates: { lat: 10.9935, lng: 76.9558 },
      rating: 3.8,
      amenities: ['CCTV', 'Open Parking'],
      priceRange: '₹10/day',
      openTime: '24 Hours',
      capacity: '80 spots'
    },

    // ✈️ AIRPORT
    {
      id: 10,
      name: 'Coimbatore Airport Parking',
      type: '✈️ Airport',
      address: 'Coimbatore International Airport, Peelamedu',
      coordinates: { lat: 11.0300, lng: 77.0434 },
      rating: 4.4,
      amenities: ['CCTV', '24/7 Security', 'Covered', 'Prepaid'],
      priceRange: '₹50/day',
      openTime: '24 Hours',
      capacity: '300 spots'
    },

    // 🏛️ GOVERNMENT BUILDINGS
    {
      id: 11,
      name: 'Corporation Office Parking',
      type: '🏛️ Government',
      address: 'Town Hall, Coimbatore',
      coordinates: { lat: 11.0026, lng: 76.9628 },
      rating: 3.9,
      amenities: ['CCTV', 'Security'],
      priceRange: '₹10/hr',
      openTime: '9 AM - 6 PM',
      capacity: '40 spots'
    },
    {
      id: 12,
      name: 'Collectorate Parking',
      type: '🏛️ Government',
      address: 'Race Course Road, Coimbatore',
      coordinates: { lat: 11.0091, lng: 76.9628 },
      rating: 4.0,
      amenities: ['CCTV', 'Security', 'Covered'],
      priceRange: '₹10/hr',
      openTime: '9 AM - 5 PM',
      capacity: '50 spots'
    },

    // 🎓 EDUCATIONAL
    {
      id: 13,
      name: 'PSG College Parking',
      type: '🎓 Educational',
      address: 'Peelamedu, Coimbatore',
      coordinates: { lat: 11.0218, lng: 77.0027 },
      rating: 4.1,
      amenities: ['CCTV', 'Security', 'Open Parking'],
      priceRange: 'Free for visitors',
      openTime: '8 AM - 8 PM',
      capacity: '200 spots'
    },

    // 🏨 COMMERCIAL COMPLEX
    {
      id: 14,
      name: 'RS Puram Commercial Complex',
      type: '🏢 Commercial',
      address: 'RS Puram, Coimbatore',
      coordinates: { lat: 11.0026, lng: 76.9558 },
      rating: 4.2,
      amenities: ['CCTV', 'Open Parking'],
      priceRange: '₹10/hr',
      openTime: '24 Hours',
      capacity: '40 spots'
    },

    // 🎪 TOURIST SPOT
    {
      id: 15,
      name: 'VOC Park Parking',
      type: '🎪 Tourist Spot',
      address: 'VOC Park & Zoo, Coimbatore',
      coordinates: { lat: 11.0059, lng: 76.9547 },
      rating: 4.0,
      amenities: ['CCTV', 'Open Parking'],
      priceRange: '₹20/day',
      openTime: '9 AM - 6 PM',
      capacity: '100 spots'
    }
  ];

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          toast.success('📍 Location detected!');
          calculateDistances(location);
        },
        (error) => {
          console.error('Location error:', error);
          toast.info('Using Coimbatore as default location');
          setUserLocation(defaultLocation);
          calculateDistances(defaultLocation);
        }
      );
    } else {
      toast.error('Geolocation not supported by your browser');
      setUserLocation(defaultLocation);
      calculateDistances(defaultLocation);
    }
  };

  const calculateDistances = (userLoc) => {
    const facilitiesWithDistance = allParkingFacilities.map(facility => ({
      ...facility,
      distance: calculateDistance(
        userLoc.lat,
        userLoc.lng,
        facility.coordinates.lat,
        facility.coordinates.lng
      )
    }));

    // Sort by distance (nearest first)
    facilitiesWithDistance.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    
    setFacilities(facilitiesWithDistance);
    setLoading(false);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const handleGetDirections = (facility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.lat},${facility.coordinates.lng}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Finding parking near you...</p>
      </div>
    );
  }

  const mapCenter = userLocation || defaultLocation;

  return (
    <div className="near-me-container">

      {/* Header */}
      <div className="near-me-header">
        <h1>🗺️ Find Parking Near You</h1>
        <p>Discover parking at malls, hospitals, stations & more</p>
        {userLocation && (
          <div className="location-info">
            📍 Showing {facilities.length} parking areas near you
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
          onClick={() => setViewMode('map')}
        >
          🗺️ Map View
        </button>
        <button
          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          📋 List View
        </button>
        <button className="location-btn" onClick={getUserLocation}>
          📍 Refresh Location
        </button>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <div className="map-view">
          <MapContainer
            center={[mapCenter.lat, mapCenter.lng]}
            zoom={13}
            style={{ width: '100%', height: '500px', borderRadius: '12px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            <RecenterMap center={[mapCenter.lat, mapCenter.lng]} />

            {/* User Location Marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>
                  <div className="map-popup">
                    <strong>📍 You are here</strong>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Parking Facility Markers */}
            {facilities.map((facility) => (
              <Marker
                key={facility.id}
                position={[facility.coordinates.lat, facility.coordinates.lng]}
                icon={parkingIcon}
                eventHandlers={{
                  click: () => setSelectedFacility(facility)
                }}
              >
                <Popup>
                  <div className="map-popup">
                    <h3>{facility.name}</h3>
                    <p className="popup-type">{facility.type}</p>
                    <p className="popup-address">{facility.address}</p>
                    <p className="popup-distance">📍 {facility.distance} km away</p>
                    <p className="popup-rating">⭐ {facility.rating}/5</p>
                    <p className="popup-price">{facility.priceRange}</p>
                    <p className="popup-capacity">🅿️ {facility.capacity}</p>
                    <button
                      className="popup-btn"
                      onClick={() => handleGetDirections(facility)}
                    >
                      🧭 Get Directions
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="list-view">
          {facilities.map((facility) => (
            <div key={facility.id} className="facility-card">
              <div className="facility-header">
                <div className="facility-icon">{facility.type.split(' ')[0]}</div>
                <div className="facility-title">
                  <h3>{facility.name}</h3>
                  <p className="facility-type">{facility.type}</p>
                  <p className="facility-address">{facility.address}</p>
                </div>
                <div className="facility-distance">
                  <span className="distance-badge">{facility.distance} km</span>
                </div>
              </div>

              <div className="facility-info">
                <div className="info-row">
                  <span className="info-label">Rating</span>
                  <span className="info-value rating">⭐ {facility.rating}/5</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Price</span>
                  <span className="info-value">{facility.priceRange}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Capacity</span>
                  <span className="info-value">🅿️ {facility.capacity}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Open</span>
                  <span className="info-value">🕐 {facility.openTime}</span>
                </div>
              </div>

              {facility.amenities && facility.amenities.length > 0 && (
                <div className="facility-amenities">
                  {facility.amenities.map((amenity, index) => (
                    <span key={index} className="amenity-badge">{amenity}</span>
                  ))}
                </div>
              )}

              <div className="facility-actions">
                <button
                  className="facility-btn directions-btn"
                  onClick={() => handleGetDirections(facility)}
                >
                  🧭 Get Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Facility Detail */}
      {selectedFacility && viewMode === 'map' && (
        <div className="selected-facility">
          <button className="close-detail" onClick={() => setSelectedFacility(null)}>×</button>
          <h3>{selectedFacility.name}</h3>
          <p className="detail-type">{selectedFacility.type}</p>
          <p className="detail-address">{selectedFacility.address}</p>
          
          <div className="detail-stats">
            <div className="detail-stat">
              <span className="stat-label">Distance</span>
              <span className="stat-value">{selectedFacility.distance} km</span>
            </div>
            <div className="detail-stat">
              <span className="stat-label">Rating</span>
              <span className="stat-value">⭐ {selectedFacility.rating}/5</span>
            </div>
            <div className="detail-stat">
              <span className="stat-label">Capacity</span>
              <span className="stat-value">{selectedFacility.capacity}</span>
            </div>
          </div>
          
          {selectedFacility.amenities && (
            <div className="detail-amenities">
              <h4>Amenities:</h4>
              <div className="amenity-list">
                {selectedFacility.amenities.map((amenity, index) => (
                  <span key={index} className="amenity-tag">✓ {amenity}</span>
                ))}
              </div>
            </div>
          )}

          <button
            className="detail-btn primary"
            onClick={() => handleGetDirections(selectedFacility)}
          >
            🧭 Get Directions
          </button>
        </div>
      )}
    </div>
  );
}

export default NearMe;
