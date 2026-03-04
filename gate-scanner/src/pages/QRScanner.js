import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from '../api/axios';
import './QRScanner.css';

function QRScanner() {
  const [qrResult, setQrResult] = useState(null);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'manual'
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    if (scanMode === 'camera' && scanning && !html5QrcodeScannerRef.current) {
      initializeScanner();
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(err => console.error(err));
      }
    };
  }, [scanMode, scanning]);

  const initializeScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    };

    html5QrcodeScannerRef.current = new Html5QrcodeScanner(
      "admin-qr-reader",
      config,
      false
    );

    html5QrcodeScannerRef.current.render(onScanSuccess, onScanError);
  };

  const onScanSuccess = async (decodedText) => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
      html5QrcodeScannerRef.current = null;
    }
    setScanning(false);
    await processQR(decodedText);
  };

  const onScanError = (error) => {
    // Ignore common errors
  };

  const processQR = async (qrData) => {
    try {
      const response = await axios.post('/bookings/scan-qr', { qrData });
      setQrResult(response.data);
      
      if (response.data.action === 'check-in') {
        toast.success('✅ Check-in successful!');
      } else {
        toast.success('✅ Check-out successful!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'QR scan failed');
      setQrResult(null);
    }
  };

  const handleManualScan = async () => {
    if (!manualInput.trim()) {
      toast.error('Please enter QR data');
      return;
    }
    await processQR(manualInput);
    setManualInput('');
  };

  const handleStartCamera = () => {
    setScanMode('camera');
    setScanning(true);
    setQrResult(null);
  };

  const handleStopCamera = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
      html5QrcodeScannerRef.current = null;
    }
    setScanning(false);
  };

  const handleReset = () => {
    setQrResult(null);
    setManualInput('');
    handleStopCamera();
  };

  return (
    <div className="qr-scanner-page">
      <div className="page-header">
        <h1>QR Code Scanner</h1>
        <p>Scan QR codes for check-in and check-out</p>
      </div>

      <div className="scan-mode-toggle">
        <button
          className={scanMode === 'camera' ? 'active' : ''}
          onClick={() => { handleStopCamera(); setScanMode('camera'); }}
        >
          📷 Camera Scanner
        </button>
        <button
          className={scanMode === 'manual' ? 'active' : ''}
          onClick={() => { handleStopCamera(); setScanMode('manual'); }}
        >
          ⌨️ Manual Entry
        </button>
      </div>

      <div className="scanner-container">
        {scanMode === 'camera' ? (
          <div className="camera-section">
            {!scanning && !qrResult && (
              <div className="camera-start">
                <div className="camera-icon">📱</div>
                <h3>Camera QR Scanner</h3>
                <p>Use your webcam to scan QR codes</p>
                <button className="start-camera-btn" onClick={handleStartCamera}>
                  Start Camera
                </button>
              </div>
            )}

            {scanning && (
              <div className="camera-active">
                <div id="admin-qr-reader"></div>
                <button className="stop-camera-btn" onClick={handleStopCamera}>
                  Stop Camera
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="manual-section">
            <h3>Manual QR Data Entry</h3>
            <p className="info-text">
              💡 Copy QR data from user's booking and paste below
            </p>
            <textarea
              placeholder='Paste QR data here (JSON format)...'
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              rows="6"
              className="qr-input"
            />
            <button className="scan-btn" onClick={handleManualScan}>
              🔍 Process QR Code
            </button>
          </div>
        )}

        {qrResult && (
          <div className="result-section">
            <div className={`result-card ${qrResult.success ? 'success' : 'error'}`}>
              <h2>
                {qrResult.action === 'check-in' ? '✅ Check-In Successful' : '🚪 Check-Out Successful'}
              </h2>
              <div className="result-details">
                <div className="result-row">
                  <span className="label">Message:</span>
                  <span className="value">{qrResult.message}</span>
                </div>
                {qrResult.data && (
                  <>
                    <div className="result-row">
                      <span className="label">Spot:</span>
                      <span className="value">{qrResult.data.parkingSpot?.spotNumber}</span>
                    </div>
                    <div className="result-row">
                      <span className="label">Vehicle:</span>
                      <span className="value">{qrResult.data.vehicleNumber}</span>
                    </div>
                    <div className="result-row">
                      <span className="label">Status:</span>
                      <span className={`value status-badge ${qrResult.data.status}`}>
                        {qrResult.data.status}
                      </span>
                    </div>
                    {qrResult.action === 'check-in' && qrResult.data.checkInTime && (
                      <div className="result-row">
                        <span className="label">Check-in Time:</span>
                        <span className="value">
                          {new Date(qrResult.data.checkInTime).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {qrResult.action === 'check-out' && (
                      <>
                        <div className="result-row">
                          <span className="label">Duration:</span>
                          <span className="value">{qrResult.data.duration} hours</span>
                        </div>
                        <div className="result-row highlight">
                          <span className="label">Total Amount:</span>
                          <span className="value amount">₹{qrResult.data.amount}</span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
              <button className="reset-btn" onClick={handleReset}>
                Scan Next
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="instructions-card">
        <h3>📋 How to Use QR Scanner</h3>
        <ol>
          <li><strong>Check-In:</strong> Scan user's QR code to check them in. Marks parking as "active".</li>
          <li><strong>Check-Out:</strong> Scan same QR code to check out. Calculates duration and amount.</li>
          <li><strong>Camera Mode:</strong> Use webcam to scan QR codes directly.</li>
          <li><strong>Manual Mode:</strong> Copy/paste QR data for testing.</li>
        </ol>
      </div>
    </div>
  );
}

export default QRScanner;