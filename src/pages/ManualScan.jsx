import React, { useState } from "react";
import Sidebar from "../components/Sidebar"; 
import "../assets/manualscan.css"; 

const ManualScan = () => {
  const [status, setStatus] = useState("Select a sensor to scan manually.");

  const handleScan = (sensor) => {
    setStatus(`🔍 Scanning ${sensor}...`);

    // Simulate sensor scan delay
    setTimeout(() => {
      // Example "fake data" result
      const result = (Math.random() * 10 + 1).toFixed(2);
      setStatus(`✅ ${sensor} scan complete. Value: ${result}`);
    }, 1500);
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="manualscan-container">
        <div className="manualscan-header">
          <h1>Manual Scan</h1>
          <p>
            Choose which sensor to scan.{" "}
            <strong>Auto Scan must be stopped</strong> to enable manual scanning.
          </p>
        </div>

        <div className="manualscan-grid">
          <div className="scan-card ph" onClick={() => handleScan("pH Level")}>
            <h3>pH Level</h3>
            <span>💧</span>
          </div>
          <div className="scan-card turbidity" onClick={() => handleScan("Turbidity")}>
            <h3>Turbidity</h3>
            <span>🌫️</span>
          </div>
          <div className="scan-card temp" onClick={() => handleScan("Temperature")}>
            <h3>Temperature</h3>
            <span>🌡️</span>
          </div>
          <div className="scan-card tds" onClick={() => handleScan("TDS")}>
            <h3>TDS</h3>
            <span>💦</span>
          </div>
        </div>

        <button className="scan-all-btn" onClick={() => handleScan("All Sensors")}>
          🚀 Scan All
        </button>

        <div className="status-box">{status}</div>

        <button className="back-btn" onClick={() => window.history.back()}>
          ⬅ Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default ManualScan;
