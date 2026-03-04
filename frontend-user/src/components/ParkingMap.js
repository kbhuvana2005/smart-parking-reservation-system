import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './ParkingMap.css';

// Fix default marker icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom purple parking marker
const parkingIcon = new L.DivIcon({
  html: `
    <div style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white;
        font-weight: bold;
        font-size: 16px;
        margin-left: 1px;
        margin-bottom: 2px;
      ">P</span>
    </div>
  `,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -45]
});

// Parking Details
const PARKING_LOCATION = [11.055124006359893, 76.99430307798501];
const PARKING_NAME = "Smart Parking - Prozone Mall";
const PARKING_ADDRESS = "SF 201, Sivanandapuram, Sathy Rd, Coimbatore, Tamil Nadu 641035";

function ParkingMap() {

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${PARKING_LOCATION[0]},${PARKING_LOCATION[1]}`;
    window.open(url, '_blank');
  };

  const handleViewOnMap = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${PARKING_LOCATION[0]},${PARKING_LOCATION[1]}`;
    window.open(url, '_blank');
  };

  return (
    <div className="parking-map-container">

      {/* Map Header */}
      <div className="map-header">
        <h2>🗺️ Find Our Parking</h2>
        <p>Prozone Mall, Coimbatore</p>
      </div>

      {/* Leaflet Map */}
      <div className="map-wrapper">
        <MapContainer
          center={PARKING_LOCATION}
          zoom={16}
          style={{ width: '100%', height: '450px', borderRadius: '12px' }}
          scrollWheelZoom={true}
        >
          {/* Map Tiles - OpenStreetMap (Free!) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Parking Location Marker */}
          <Marker position={PARKING_LOCATION} icon={parkingIcon}>
            <Popup>
              <div className="popup-content">
                <h3>🅿️ {PARKING_NAME}</h3>
                <p>📍 {PARKING_ADDRESS}</p>
                <p>🕐 Open 24/7</p>
                <p>🚗 60 Parking Slots</p>
                <p>💰 Starting ₹10/hour</p>
                <button
                  className="popup-directions-btn"
                  onClick={handleGetDirections}
                >
                  🧭 Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {/* Location Info Card */}
      <div className="map-info-section">

        {/* Address Card */}
        <div className="location-card">
          <div className="location-icon">📍</div>
          <div className="location-details">
            <h3>{PARKING_NAME}</h3>
            <p>{PARKING_ADDRESS}</p>
            <p className="hours">🕐 Open 24 Hours, 7 Days a Week</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="map-actions">
          <button className="directions-btn" onClick={handleGetDirections}>
            🧭 Get Directions
          </button>
          <button className="view-map-btn" onClick={handleViewOnMap}>
            🗺️ View on Google Maps
          </button>
        </div>

        {/* Facility Info */}
        <div className="facility-info">
          <div className="facility-item">
            <span className="facility-icon">🚗</span>
            <span>60 Parking Slots</span>
          </div>
          <div className="facility-item">
            <span className="facility-icon">🏢</span>
            <span>3 Floors</span>
          </div>
          <div className="facility-item">
            <span className="facility-icon">📹</span>
            <span>CCTV Monitored</span>
          </div>
          <div className="facility-item">
            <span className="facility-icon">⚡</span>
            <span>EV Charging</span>
          </div>
          <div className="facility-item">
            <span className="facility-icon">🔒</span>
            <span>24/7 Security</span>
          </div>
          <div className="facility-item">
            <span className="facility-icon">♿</span>
            <span>Accessible</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParkingMap;