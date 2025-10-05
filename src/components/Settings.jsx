// src/components/Settings.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

export default function Settings({ 
  adminDarkMode, 
  clientDarkMode, 
  toggleAdminTheme, 
  toggleClientTheme, 
  previousRoute 
}) {
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const navigate = useNavigate();

  const isControllingAdmin = previousRoute === "/admin";
  const currentDarkMode = isControllingAdmin ? adminDarkMode : clientDarkMode;
  const handleToggle = isControllingAdmin ? toggleAdminTheme : toggleClientTheme;
  const themeName = isControllingAdmin ? "Admin Panel" : "Feedback Form";

  const handleToggleDarkMode = () => {
    handleToggle();
    const newMode = !currentDarkMode;
    setNotificationMessage(`${themeName} theme changed to ${newMode ? "dark" : "light"} mode`);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
    }, 2000);
    
    setTimeout(() => {
      navigate(previousRoute);
    }, 500);
  };

  const handleDone = () => {
    navigate(previousRoute);
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="settings-header">
          <h1>Settings</h1>
          {/* --- UPDATED BUTTON --- */}
          <button 
            className="done-button" // Changed from back-button
            onClick={handleDone}
            title={`Return to ${previousRoute === "/admin" ? "Admin Dashboard" : "Feedback Form"}`}
          >
            <i className="bx bx-check"></i> {/* Changed from bx-arrow-back */}
            Done
          </button>
        </div>
        
        {showNotification && (
          <div className="notification">
            <i className="bx bx-check-circle"></i>
            {notificationMessage}
          </div>
        )}
        
        <div className="settings-section">
          <h2>
            <i className="bx bx-palette"></i>
            Appearance
          </h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>{themeName} Theme</h3>
              <p>
                Toggle dark mode for the {themeName.toLowerCase()}
              </p>
            </div>
            <div className="setting-control">
              <button 
                className={`toggle-button ${currentDarkMode ? 'active' : ''}`}
                onClick={handleToggleDarkMode}
                aria-label="Toggle dark mode"
              >
                <span className="toggle-slider"></span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>
            <i className="bx bx-compass"></i>
            Quick Navigation
          </h2>
          <div className="nav-buttons">
            <button 
              className="nav-button feedback-button"
              onClick={() => navigate("/")}
            >
              <i className="bx bx-message-square-edit"></i>
              <span>Go to Feedback Form</span>
            </button>
            <button 
              className="nav-button admin-button"
              onClick={() => navigate("/admin")}
            >
              <i className="bx bx-shield"></i>
              <span>Go to Admin Dashboard</span>
            </button>
          </div>
        </div>
        
        <div className="settings-footer">
          <p>Feedback Hub Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}