// src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import "../assets/databoard.css";

import { AdminContext } from "../App";
import { supabase } from "../supabaseClient";

const Dashboard = ({ isAdminProp }) => {
  const { isAdmin: contextIsAdmin } = useContext(AdminContext);
  const isAdmin = isAdminProp ?? contextIsAdmin; // prioritize prop if passed
  const navigate = useNavigate();

  const [sensorData, setSensorData] = useState({
    ph: "N/A",
    turbidity: "N/A",
    temp: "N/A",
    tds: "N/A",
  });

  const [intervalTime, setIntervalTime] = useState(1800000); // 30 min
  const [status, setStatus] = useState("Awaiting sensor data...");
  const [autoScanRunning, setAutoScanRunning] = useState(false);

  const fetchSensorData = async () => {
    try {
      const response = await fetch("http://192.168.0.100:5000/sensor-data");
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();

      setSensorData({
        ph: parseFloat(data.ph).toFixed(2),
        turbidity: `${parseFloat(data.turbidity).toFixed(1)} NTU`,
        temp: `${parseFloat(data.temp).toFixed(1)}°C`,
        tds: `${parseFloat(data.tds).toFixed(0)} ppm`,
      });

      setStatus("✅ Data fetched from sensor!");
    } catch (error) {
      console.error("❌ Error fetching sensor data:", error);
      setStatus("❌ Failed to fetch data. Check device connection.");
    }
  };

  // Auto scan for admins
  useEffect(() => {
    if (!isAdmin || !autoScanRunning) return;
    fetchSensorData();
    const interval = setInterval(fetchSensorData, intervalTime);
    return () => clearInterval(interval);
  }, [autoScanRunning, intervalTime, isAdmin]);

  // Auto-save to Supabase (admins only)
  useEffect(() => {
    if (!isAdmin) return;
    const dailySave = setInterval(async () => {
      const newEntry = { ...sensorData, timestamp: new Date().toISOString() };
      const { error } = await supabase.from("sensor_logs").insert([newEntry]);
      if (error) console.error("❌ Auto-save failed:", error);
    }, 86400000);
    return () => clearInterval(dailySave);
  }, [sensorData, isAdmin]);

  const handleSave = async () => {
    if (!isAdmin) return;
    const newEntry = { ...sensorData, timestamp: new Date().toISOString() };
    const { error } = await supabase.from("sensor_logs").insert([newEntry]);
    if (error) setStatus("❌ Failed to save data!");
    else setStatus("✅ Data saved successfully!");
  };

  const toggleAutoScan = () => setAutoScanRunning((prev) => !prev);

  const handleManualScanClick = () => {
    if (!autoScanRunning) navigate("/manual-scan", { state: { autoScanRunning } });
    else setStatus("⚠️ Stop Auto Scan before using Manual Scan.");
  };

  return (
    <div className="container">
      {isAdmin && <Sidebar />}
      <main className={`main-content ${!isAdmin ? "visitor-mode" : ""}`} style={{ marginLeft: isAdmin ? undefined : 0 }}>
        {/* Header */}
        {isAdmin ? <header className="topbar"><h1>Dashboard</h1></header> :
          <div className="wave-header">AquaCheck – Real-Time Water Quality</div>}

        {/* Sensor Section */}
        <section className="sensor-section" id="dashboard">
          {!isAdmin && <h2 className="visitor-subtitle">Live Sensor Readings</h2>}

          {isAdmin && (
            <div className="scan-controls">
              <div className="interval-setting">
                <label htmlFor="scanInterval">Set Auto Scan Interval:</label>
                <select
                  id="scanInterval"
                  value={intervalTime}
                  onChange={(e) => setIntervalTime(Number(e.target.value))}
                  disabled={autoScanRunning}
                >
                  <option value={1800000}>Every 30 Minutes</option>
                  <option value={3600000}>Every 1 Hour</option>
                  <option value={7200000}>Every 2 Hours</option>
                  <option value={10800000}>Every 3 Hours</option>
                  <option value={14400000}>Every 4 Hours</option>
                  <option value={86400000}>Every 24 Hours</option>
                </select>
              </div>
              <div className="button-group">
                <button className="manual-scan-btn" onClick={handleManualScanClick} disabled={autoScanRunning}>Manual Scan</button>
                <button className="manual-scan-btn save-btn" onClick={handleSave}>Save</button>
                <button className={`manual-scan-btn start-stop-btn ${autoScanRunning ? "stop" : "start"}`} onClick={toggleAutoScan}>
                  {autoScanRunning ? "Stop Auto Scan" : "Start Auto Scan"}
                </button>
              </div>
            </div>
          )}

          <div className="sensor-grid">
            <div className="sensor-card"><h3>pH Level</h3><p>{sensorData.ph}</p></div>
            <div className="sensor-card"><h3>Turbidity</h3><p>{sensorData.turbidity}</p></div>
            <div className="sensor-card"><h3>Temperature</h3><p>{sensorData.temp}</p></div>
            <div className="sensor-card"><h3>TDS</h3><p>{sensorData.tds}</p></div>
          </div>

          <div id="water-status" className="status-card">{status}</div>
        </section>

        {!isAdmin && <footer><p>© 2025 AquaCheck System. All rights reserved.</p></footer>}
      </main>
    </div>
  );
};

export default Dashboard;
