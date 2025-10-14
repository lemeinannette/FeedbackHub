import React from 'react';
import './DarkModeToggle.css';

const DarkModeToggle = ({ 
  isDarkMode, 
  onToggle,
  size = 'medium',
  showLabel = false,
  label = 'Dark Mode'
}) => {
  return (
    <div className={`dark-mode-toggle dark-mode-toggle--${size}`}>
      <button
        className={`toggle-switch ${isDarkMode ? 'toggle-switch--active' : ''}`}
        onClick={onToggle}
        aria-label={`Toggle ${label}`}
        aria-pressed={isDarkMode}
      >
        <div className="toggle-slider">
          <div className="toggle-thumb">
            <i className={`bx ${isDarkMode ? 'bx-moon' : 'bx-sun'} toggle-icon`}></i>
          </div>
        </div>
      </button>
      {showLabel && (
        <span className="toggle-label">
          {label}
        </span>
      )}
    </div>
  );
};

export default DarkModeToggle;