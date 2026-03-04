import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from '../api/axios';
import './QRScanner.css';

function QRScanner() {
  const [qrResult, setQrResult] = useState(null);
  const [scanMode, setScanMode] = useState('manual'); // Start with manual by default
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
      aspectRatio: 1.0,
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
      html5QrcodeScannerRef.current.clear().catch(err => console.error(err));
      html5QrcodeScannerRef.current = null;
    }
    setScanning(false);
    await processQR(decodedText);
  };

  const onScanError = (error) => {
    // Safely handle error - it might be a string or an object
    try {
      const errorMessage = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
      
      // Ignore common QR scanning errors
      const ignoredErrors = ['NotFoundException', 'NotFoundError', 'No MultiFormat Readers'];
      const shouldIgnore = ignoredErrors.some(ignored => errorMessage.includes(ignored));
      
      if (!shouldIgnore) {
        console.warn('QR Scan Error:', errorMessage);
      }
    } catch (e) {
      // Silently ignore if error handling fails
    }
  };

  const processQR = async (qrData) => {
    try {
      const response = await axios.post('/bookings/scan-qr', { qrData });
      setQrResult(response.data);
      
      if (response.data.action === 'check-in') {
        toast.success('✅ Check-in successful!', {
          autoClose: 5000,
          style: { fontSize: '16px' }
        });
      } else {
        toast.success(`✅ Check-out successful! Amount: ₹${response.data.data?.amount}`, {
          autoClose: 7000,
          style: { fontSize: '16px' }
        });
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
    setQrResult(null);
    setScanning(true);
  };

  const handleStopCamera = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(err => console.error(err));
      html5QrcodeScannerRef.current = null;
    }
    setScanning(false);
  };

  const handleSwitchMode = (mode) => {
    handleStopCamera();
    setScanMode(mode);
    setQrResult(null);
    setManualInput('');
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
          onClick={() => handleSwitchMode('camera')}
        >
          📷 Camera Scanner
        </button>
        <button
          className={scanMode === 'manual' ? 'active' : ''}
          onClick={() => handleSwitchMode('manual')}
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
                  📷 Start Camera
                </button>
              </div>
            )}

            {scanning && !qrResult && (
              <div className="camera-active">
                <div id="admin-qr-reader"></div>
                <p className="scan-instruction">📱 Position QR code in the frame</p>
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
              💡 <strong>For Testing:</strong> Copy QR data from user's booking details and paste below
            </p>
            <textarea
              placeholder='Paste QR data here (JSON format)
Example:
{"bookingId":"123","spotNumber":"A-101","spotId":"abc123","vehicleNumber":"KA01AB1234"}'
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
              <div className="result-header">
                {qrResult.action === 'check-in' ? (
                  <>
                    <div className="result-icon">✅</div>
                    <h2>Check-In Successful</h2>
                  </>
                ) : (
                  <>
                    <div className="result-icon">🚪</div>
                    <h2>Check-Out Successful</h2>
                  </>
                )}
              </div>
              <div className="result-details">
                <div className="result-row">
                  <span className="label">Spot:</span>
                  <span className="value">{qrResult.data?.parkingSpot?.spotNumber}</span>
                </div>
                <div className="result-row">
                  <span className="label">Vehicle:</span>
                  <span className="value">{qrResult.data?.vehicleNumber}</span>
                </div>
                <div className="result-row">
                  <span className="label">Status:</span>
                  <span className={`value status-badge ${qrResult.data?.status}`}>
                    {qrResult.data?.status}
                  </span>
                </div>
                {qrResult.action === 'check-in' && qrResult.data?.checkInTime && (
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
                      <span className="label">Check-in:</span>
                      <span className="value">
                        {new Date(qrResult.data?.booking?.checkInTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="result-row">
                      <span className="label">Check-out:</span>
                      <span className="value">
                        {new Date(qrResult.data?.booking?.checkOutTime).toLocaleString()}
                      </span>
                    </div>
                    <div className="result-row">
                      <span className="label">Duration:</span>
                      <span className="value">{qrResult.data?.duration} hours</span>
                    </div>
                    <div className="result-row highlight">
                      <span className="label">💰 Total Amount:</span>
                      <span className="value amount">₹{qrResult.data?.amount}</span>
                    </div>
                  </>
                )}
              </div>
              <button className="reset-btn" onClick={handleReset}>
                ✨ Scan Next Vehicle
              </button>
            </div>
          </div>
        )}
      </div>

      
    </div>
  );
}

export default QRScanner;