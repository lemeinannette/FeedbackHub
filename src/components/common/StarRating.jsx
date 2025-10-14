import React from 'react';
import './StarRating.css';

const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'medium',
  showValue = false,
  precision = 1
}) => {
  const stars = [1, 2, 3, 4, 5];
  const [hoveredStar, setHoveredStar] = React.useState(null);
  
  const handleClick = (star) => {
    if (!readonly && onRatingChange) {
      onRatingChange(star);
    }
  };

  const handleMouseEnter = (star) => {
    if (!readonly) {
      setHoveredStar(star);
    }
  };

  const handleMouseLeave = () => {
    setHoveredStar(null);
  };

  const getStarType = (star) => {
    const currentRating = hoveredStar || rating;
    
    if (currentRating >= star) {
      return 'filled';
    } else if (currentRating >= star - 0.5) {
      return 'half';
    }
    return 'empty';
  };

  const getStarIcon = (type) => {
    switch (type) {
      case 'filled':
        return 'bxs-star';
      case 'half':
        return 'bxs-star-half';
      default:
        return 'bx-star';
    }
  };

  return (
    <div className={`star-rating star-rating--${size} ${readonly ? 'star-rating--readonly' : ''}`}>
      <div className="star-rating__stars">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            className={`star star--${getStarType(star)}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            aria-label={`Rate ${star} stars`}
            aria-pressed={rating === star}
          >
            <i className={`bx ${getStarIcon(getStarType(star))}`}></i>
          </button>
        ))}
      </div>
      {showValue && (
        <div className="star-rating__value">
          {rating.toFixed(precision)}
        </div>
      )}
    </div>
  );
};

export default StarRating;