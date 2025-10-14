import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ notification, setNotification }) => {
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, setNotification]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return 'bx-check-circle';
      case 'error':
        return 'bx-error-circle';
      case 'warning':
        return 'bx-error';
      default:
        return 'bx-info-circle';
    }
  };

  return (
    <div className={`notification notification-${notification.type}`}>
      <div className="notification-content">
        <i className={`bx ${getIcon()} notification-icon`}></i>
        <span className="notification-message">{notification.message}</span>
        <button 
          className="notification-close" 
          onClick={() => setNotification(null)}
          aria-label="Close notification"
        >
          <i className="bx bx-x"></i>
        </button>
      </div>
      <div className="notification-progress"></div>
    </div>
  );
};

export default Notification;