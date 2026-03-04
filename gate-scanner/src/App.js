import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import './App.css';

function App() {
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    if (scanning && !manualMode && !html5QrcodeScannerRef.current) {
      initializeScanner();
    }

    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(err => console.error(err));
      }
    };
  }, [scanning, manualMode]);

  const initializeScanner = () => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    html5QrcodeScannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      config,
      false
    );

    html5QrcodeScannerRef.current.render(onScanSuccess, onScanError);
  };

  const onScanSuccess = async (decodedText) => {
    // Stop scanner temporarily to prevent multiple scans
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear();
      html5QrcodeScannerRef.current = null;
    }

    setScanning(false);
    await processQRCode(decodedText);
  };

  const onScanError = (error) => {
  // Safely handle error - it might be a string or an object
  try {
    const errorMessage = typeof error === 'string' ? error : (error?.message || JSON.stringify(error));
    
    // Ignore common QR scanning errors that are expected during scanning
    const ignoredErrors = ['NotFoundException', 'NotFoundError', 'No MultiFormat Readers'];
    const shouldIgnore = ignoredErrors.some(ignored => errorMessage.includes(ignored));
    
    if (!shouldIgnore) {
      console.warn('QR Scan Error:', errorMessage);
    }
  } catch (e) {
    // If even error handling fails, just ignore silently
  }
};

  const processQRCode = async (qrData) => {
    try {
      const response = await axios.post('http://localhost:5000/api/bookings/scan-qr', {
        qrData: qrData
      });

      setLastResult(response.data);

      if (response.data.action === 'check-in') {
        toast.success('✅ Check-in Successful!', {
          position: 'top-center',
          autoClose: 3000,
          style: { fontSize: '18px' }
        });
        playSound('success');
      } else if (response.data.action === 'check-out') {
        toast.success('🚪 Check-out Successful!', {
          position: 'top-center',
          autoClose: 3000,
          style: { fontSize: '18px' }
        });
        playSound('success');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'QR Scan Failed!', {
        position: 'top-center',
        autoClose: 3000,
        style: { fontSize: '18px' }
      });
      playSound('error');
      setLastResult(null);
    }
  };

  const playSound = (type) => {
    // Create audio feedback
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'success') {
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } else {
      oscillator.frequency.value = 200;
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  };

  const handleStartScan = () => {
    setScanning(true);
    setManualMode(false);
    setLastResult(null);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      toast.error('Please enter QR data');
      return;
    }
    await processQRCode(manualInput);
    setManualInput('');
  };

  const handleReset = () => {
    setScanning(false);
    setManualMode(false);
    setLastResult(null);
    setManualInput('');
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(err => console.error(err));
      html5QrcodeScannerRef.current = null;
    }
  };

  return (
    <div className="App">
      <ToastContainer />
      
      <div className="header">
        <h1>🚗 Parking Gate Scanner</h1>
        <p className="subtitle">Scan QR codes for entry and exit</p>
      </div>

      {!scanning && !lastResult && (
        <div className="start-screen">
          <div className="gate-icon">🎫</div>
          <h2>Ready to Scan</h2>
          <p>Click below to start scanning QR codes</p>
          <button className="start-btn" onClick={handleStartScan}>
            📷 Start Camera Scanner
          </button>
          <button className="manual-btn" onClick={() => setManualMode(true)}>
            ⌨️ Manual Entry
          </button>
        </div>
      )}

      {scanning && !manualMode && (
        <div className="scanner-section">
          <div className="scanner-container">
            <div id="qr-reader" ref={scannerRef}></div>
          </div>
          <div className="scanner-instructions">
            <p>📱 Position the QR code within the frame</p>
            <p>✨ Scanner will automatically detect the code</p>
          </div>
          <button className="cancel-btn" onClick={handleReset}>
            Cancel
          </button>
        </div>
      )}

      {manualMode && (
        <div className="manual-section">
          <h3>Manual QR Data Entry</h3>
          <form onSubmit={handleManualSubmit}>
            <textarea
              placeholder='Paste QR data here...'
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              rows="6"
            />
            <div className="manual-actions">
              <button type="submit" className="submit-btn">
                Process QR
              </button>
              <button type="button" className="cancel-btn" onClick={handleReset}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {lastResult && (
        <div className="result-section">
          <div className={`result-card ${lastResult.success ? 'success' : 'error'}`}>
            <div className="result-header">
              {lastResult.action === 'check-in' ? (
                <>
                  <div className="result-icon success">✅</div>
                  <h2>Check-In Successful</h2>
                </>
              ) : (
                <>
                  <div className="result-icon success">🚪</div>
                  <h2>Check-Out Successful</h2>
                </>
              )}
            </div>

            <div className="result-details">
              <div className="detail-row">
                <span className="label">Parking Spot</span>
                <span className="value spot">{lastResult.data?.parkingSpot?.spotNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Vehicle Number</span>
                <span className="value">{lastResult.data?.vehicleNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status</span>
                <span className={`value status ${lastResult.data?.status}`}>
                  {lastResult.data?.status}
                </span>
              </div>
              {lastResult.action === 'check-in' && lastResult.data?.checkInTime && (
                <div className="detail-row">
                  <span className="label">Check-in Time</span>
                  <span className="value">
                    {new Date(lastResult.data.checkInTime).toLocaleString()}
                  </span>
                </div>
              )}
              {lastResult.action === 'check-out' && (
                <>
                  <div className="detail-row">
                    <span className="label">Duration</span>
                    <span className="value">{lastResult.data?.duration} hours</span>
                  </div>
                  <div className="detail-row highlight">
                    <span className="label">Amount to Collect</span>
                    <span className="value amount">₹{lastResult.data?.amount}</span>
                  </div>
                </>
              )}
            </div>

            <div className="result-actions">
              <button className="next-btn" onClick={handleReset}>
                ✨ Scan Next Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="footer">
        <p>Smart Parking System - Gate Scanner v1.0</p>
      </div>
    </div>
  );
}

export default App;