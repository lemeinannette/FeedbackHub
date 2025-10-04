// components/Settings.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Settings.css";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const darkModePreference = localStorage.getItem("darkMode") === "true";
    setDarkMode(darkModePreference);
    
    // Apply both classes to ensure compatibility
    if (darkModePreference) {
      document.body.classList.add('dark-mode', 'dark');
    } else {
      document.body.classList.remove('dark-mode', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    
    // Apply both classes to ensure compatibility
    if (newDarkMode) {
      document.body.classList.add('dark-mode', 'dark');
    } else {
      document.body.classList.remove('dark-mode', 'dark');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="settings-header">
          <h1>Settings</h1>
          <Link to="/" className="back-button">
            <i className="bx bx-arrow-back"></i>
            Back to Feedback
          </Link>
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
        
        <div className="settings-section">
          <h2>About</h2>
          <div className="setting-item">
            <div className="setting-info">
              <h3>Feedback Hub</h3>
              <p>Version 1.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}