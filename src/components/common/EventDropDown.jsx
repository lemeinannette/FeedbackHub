// src/components/common/EventDropDown.jsx
import React, { useState } from 'react';

const EventDropDown = ({ events, selectedEvent, onEventChange, placeholder, allowCustom = false }) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  const handleChange = (e) => {
    const value = e.target.value;
    onEventChange(value);
    
    if (value === 'Other') {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
    }
  };
  
  return (
    <div className="event-dropdown">
      <select 
        value={selectedEvent} 
        onChange={handleChange}
        className="event-select"
      >
        <option value="" disabled>{placeholder}</option>
        {events.map(event => (
          <option key={event} value={event}>{event}</option>
        ))}
      </select>
    </div>
  );
};

export default EventDropDown;