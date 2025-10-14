import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium',
  color = 'primary',
  text = '',
  overlay = false,
  className = ''
}) => {
  const getSpinnerClass = () => {
    let classes = 'loading-spinner';
    classes += ` loading-spinner--${size}`;
    classes += ` loading-spinner--${color}`;
    if (overlay) classes += ' loading-spinner--overlay';
    if (className) classes += ` ${className}`;
    return classes;
  };

  return (
    <div className={getSpinnerClass()}>
      <div className="spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {text && (
        <div className="spinner-text">
          {text}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;