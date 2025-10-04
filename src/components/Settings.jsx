// components/Settings.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./Settings.css";

export default function Settings({ darkMode, toggleDarkMode }) {
  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Customize your experience</p>
        </div>
        
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Dark Mode</h3>
              <p>Toggle dark mode for better viewing in low light environments</p>
            </div>
            <div className="setting-control">
              <button 
                className={`toggle-button ${darkMode ? 'active' : ''}`}
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
              >
                <div className="toggle-slider"></div>
              </button>
            </div>
          </div>
        </div>
        
        
        
        <div className="settings-actions">
          <Link to="/" className="back-button">
            <i className="bx bx-arrow-back"></i>
            Back to Feedback
          </Link>
        </div>
      </div>
    </div>
  );
}