import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ParkingSpots from './pages/ParkingSpots';
import Bookings from './pages/Bookings';
import Users from './pages/Users';
import QRScanner from './pages/QRScanner';
import Revenue from './pages/Revenue';
import Analytics from './pages/Analytics';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  
  if (!token || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const token = localStorage.getItem('adminToken');
  const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const isAdmin = token && user.role === 'admin';

  return (
    <Router>
      <div className="App">
        <ToastContainer position="top-right" autoClose={3000} />
        
        {isAdmin ? (
          <div className="admin-layout">
            <Sidebar />
            <div className="main-content">
              <Navbar />
              <div className="content-area">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                  <Route path="/parking-spots" element={<ProtectedRoute><ParkingSpots /></ProtectedRoute>} />
                  <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
                  <Route path="/qr-scanner" element={<ProtectedRoute><QRScanner /></ProtectedRoute>} />
                  <Route path="/revenue" element={<ProtectedRoute><Revenue /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;