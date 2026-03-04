# 🅿️ Smart Parking Reservation System

A complete parking management system with QR code-based check-in/checkout, real-time availability tracking, and automated booking management.

## 🚀 Features

### User Features
- 🔐 User authentication (Register/Login)
- 🅿️ Real-time parking spot availability
- 📱 QR code generation for bookings
- 📧 Email notifications (Confirmation, Reminders, Receipts)
- ⏰ Auto-cancellation (20 min no-show)
- 💳 Payment integration ready
- 🗺️ Google Maps integration
- 📋 Booking history & management

### Admin Features
- 📊 Dashboard with analytics
- 🅿️ Parking spot management (CRUD)
- 📋 Booking management
- 👥 User management
- 💰 Revenue tracking & reports
- 📷 QR Scanner integration

### Gate Scanner Features
- 📱 Mobile-first QR scanner
- ✅ Check-in/Check-out processing
- ⚡ Real-time booking updates

##  Tech Stack

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Nodemailer (Email)
- QR Code Generation
- Node-cron (Schedulers)

### Frontend
- React 19
- React Router v6
- Axios
- React Toastify
- HTML5 QR Code Scanner
- Leaflet Maps

##  Project Structure
```
smart-parking-reservation-system/
├── backend/                 # Node.js API
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   └── server.js           # Entry point
├── frontend-user/          # User web app (Port 3000)
├── frontend-admin/         # Admin panel (Port 3001)
├── frontend-gate/          # Gate scanner (Port 3002)
└── README.md
```

##  Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/smart-parking-reservation-system.git
cd smart-parking-reservation-system
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file in backend:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

Start backend:
```bash
npm start
```

3. **User Frontend Setup**
```bash
cd frontend-user
npm install
npm start
```

4. **Admin Panel Setup**
```bash
cd frontend-admin
npm install
npm start
```

5. **Gate Scanner Setup**
```bash
cd frontend-gate
npm install
npm start
```

## 🌐 Access the Applications

- **User App:** http://localhost:3000
- **Admin Panel:** http://localhost:3001
- **Gate Scanner:** http://localhost:3002
- **API:** http://localhost:5000

##  Email Configuration

Uses Gmail SMTP. Generate an App Password:
1. Enable 2FA on Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Add to backend `.env`

## Maps Integration

Uses Leaflet/OpenStreetMap (free, no API key needed)

##  Auto-Release System

- Bookings auto-cancelled if user doesn't arrive within 20 minutes
- Runs every 5 minutes via cron job

## QR Code System

- Generated on booking confirmation
- Sent via email
- Scanned at entry/exit gates
- Updates booking status in real-time

##  Default Admin Credentials
```
Email: admin@parking.com
Password: admin123
```
