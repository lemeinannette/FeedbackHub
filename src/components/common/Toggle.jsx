import React from 'react';
import './Toggle.css';

const Toggle = ({ 
  isOn, 
  onToggle, 
  disabled = false,
  size = 'medium',
  label = '',
  labelPosition = 'right',
  id = '',
  className = '',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy
}) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;
  
  const handleToggle = () => {
    if (!disabled && onToggle) {
      onToggle(!isOn);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  return (
    <div 
      className={`toggle-container toggle-container--${size} toggle-container--${labelPosition} ${className}`}
    >
      {label && labelPosition === 'left' && (
        <label htmlFor={toggleId} className="toggle-label">
          {label}
        </label>
      )}
      
      <button
        id={toggleId}
        type="button"
        className={`toggle toggle--${size} ${isOn ? 'toggle--on' : 'toggle--off'} ${disabled ? 'toggle--disabled' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        role="switch"
        aria-checked={isOn}
        aria-label={ariaLabel || (label ? undefined : 'Toggle switch')}
        aria-labelledby={ariaLabelledBy || (label ? toggleId : undefined)}
      >
        <span className="toggle-slider">
          <span className="toggle-thumb"></span>
        </span>
        {isOn && (
          <span className="toggle-indicator toggle-indicator--on">
            <i className="bx bx-check"></i>
          </span>
        )}
        {!isOn && (
          <span className="toggle-indicator toggle-indicator--off">
            <i className="bx bx-x"></i>
          </span>
        )}
      </button>
      
      {label && labelPosition === 'right' && (
        <label htmlFor={toggleId} className="toggle-label">
          {label}
        </label>
      )}
    </div>
  );
};

export default Toggle;