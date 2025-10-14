// src/components/common/StarRating.jsx
import React from 'react';

const StarRating = ({ rating, onRatingChange, size = "medium" }) => {
  const stars = [1, 2, 3, 4, 5];
  
  const getStarSize = () => {
    switch(size) {
      case "small": return "16px";
      case "large": return "32px";
      default: return "24px";
    }
  };
  
  return (
    <div className="star-rating">
      {stars.map(star => (
        <span
          key={star}
          className={`star ${star <= rating ? 'filled' : ''}`}
          style={{ fontSize: getStarSize() }}
          onClick={() => onRatingChange(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;