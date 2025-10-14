import React from 'react';
import './Badge.css';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'medium',
  rounded = false,
  className = '',
  ...props 
}) => {
  const getBadgeClass = () => {
    let classes = 'badge';
    classes += ` badge--${variant}`;
    classes += ` badge--${size}`;
    if (rounded) classes += ' badge--rounded';
    if (className) classes += ` ${className}`;
    return classes;
  };

  return (
    <span className={getBadgeClass()} {...props}>
      {children}
    </span>
  );
};

export default Badge;