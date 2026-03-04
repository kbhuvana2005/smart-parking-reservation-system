import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ParkingSpots from './pages/ParkingSpots';
import MyBookings from './pages/MyBookings';
import BookingDetails from './pages/BookingDetails';
import Navbar from './components/Navbar';
import NearMe from './pages/NearMe';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <div className="App">
        {token && <Navbar />}
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          {/* ✅ NEAR ME ROUTE - ADDED */}
          <Route
            path="/near-me"
            element={
              <ProtectedRoute>
                <NearMe />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/parking-spots"
            element={
              <ProtectedRoute>
                <ParkingSpots />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/booking/:id"
            element={
              <ProtectedRoute>
                <BookingDetails />
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;