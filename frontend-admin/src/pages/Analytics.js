import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'react-toastify';
import axios from '../api/axios';
import './Analytics.css';

function Analytics() {
  const [revenueData, setRevenueData] = useState([]);
  const [bookingsByStatus, setBookingsByStatus] = useState([]);
  const [hourlyOccupancy, setHourlyOccupancy] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const bookingsRes = await axios.get('/bookings');
      const bookings = bookingsRes.data.data;

      // Revenue by day (last 7 days)
      const last7Days = generateLast7Days();
      const revenueByDay = last7Days.map(day => {
        const dayBookings = bookings.filter(b => 
          b.status === 'completed' && 
          new Date(b.createdAt).toDateString() === day.date.toDateString()
        );
        const revenue = dayBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        return { date: day.label, revenue };
      });
      setRevenueData(revenueByDay);

      // Bookings by status
      const statusData = [
        { name: 'Reserved', value: bookings.filter(b => b.status === 'reserved').length, color: '#ffc107' },
        { name: 'Active', value: bookings.filter(b => b.status === 'active').length, color: '#28a745' },
        { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: '#17a2b8' },
        { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: '#dc3545' }
      ];
      setBookingsByStatus(statusData);

      // Hourly occupancy pattern
      const hourlyData = Array.from({ length: 24 }, (_, hour) => {
        const hourBookings = bookings.filter(b => {
          const arrivalHour = new Date(b.arrivalTime).getHours();
          return arrivalHour === hour;
        });
        return { hour: `${hour}:00`, bookings: hourBookings.length };
      });
      setHourlyOccupancy(hourlyData);

      setLoading(false);
    } catch (error) {
      toast.error('Failed to load analytics data');
      setLoading(false);
    }
  };

  const generateLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push({
        date: date,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Visualize your parking system performance</p>
        <button className="refresh-btn" onClick={fetchAnalyticsData}>
          🔄 Refresh Data
        </button>
      </div>

      {/* Revenue Trend */}
      <div className="chart-section">
        <h2>💰 Revenue Trend (Last 7 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#28a745" strokeWidth={2} name="Revenue (₹)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bookings by Status */}
      <div className="chart-section">
        <h2>📋 Bookings Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={bookingsByStatus}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {bookingsByStatus.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Occupancy Pattern */}
      <div className="chart-section">
        <h2>⏰ Peak Hours Analysis</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={hourlyOccupancy}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#667eea" name="Bookings Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Analytics;