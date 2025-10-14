import React, { useState, useRef, useEffect } from 'react';
import './EventDropDown.css';

const EventDropDown = ({ 
  events = [], 
  selectedEvent, 
  onEventChange, 
  placeholder = 'Select an event',
  disabled = false,
  allowCustom = false,
  onCustomEventAdd,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customEvent, setCustomEvent] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
        setShowCustomInput(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredEvents = events.filter(event =>
    event.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setSearchTerm('');
    }
  };

  const handleEventSelect = (event) => {
    onEventChange(event);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCustomEventSubmit = () => {
    if (customEvent.trim() && onCustomEventAdd) {
      onCustomEventAdd(customEvent.trim());
      setCustomEvent('');
      setShowCustomInput(false);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      setShowCustomInput(false);
    } else if (e.key === 'Enter' && showCustomInput) {
      handleCustomEventSubmit();
    }
  };

  return (
    <div 
      className={`event-dropdown ${disabled ? 'event-dropdown--disabled' : ''} ${className}`}
      ref={dropdownRef}
      onKeyDown={handleKeyDown}
    >
      <button
        className="event-dropdown-trigger"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="event-dropdown-value">
          {selectedEvent || placeholder}
        </span>
        <i className={`bx bx-chevron-${isOpen ? 'up' : 'down'} event-dropdown-arrow`}></i>
      </button>

      {isOpen && (
        <div className="event-dropdown-menu">
          <div className="event-dropdown-search">
            <i className="bx bx-search search-icon"></i>
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="event-dropdown-list">
            {filteredEvents.length === 0 ? (
              <div className="event-dropdown-empty">
                <i className="bx bx-search-alt"></i>
                <span>No events found</span>
              </div>
            ) : (
              filteredEvents.map((event, index) => (
                <button
                  key={index}
                  className={`event-dropdown-item ${selectedEvent === event ? 'event-dropdown-item--selected' : ''}`}
                  onClick={() => handleEventSelect(event)}
                  role="option"
                  aria-selected={selectedEvent === event}
                >
                  <i className="bx bx-calendar-event"></i>
                  <span>{event}</span>
                  {selectedEvent === event && (
                    <i className="bx bx-check item-check"></i>
                  )}
                </button>
              ))
            )}
          </div>

          {allowCustom && (
            <div className="event-dropdown-footer">
              {!showCustomInput ? (
                <button
                  className="add-custom-btn"
                  onClick={() => setShowCustomInput(true)}
                >
                  <i className="bx bx-plus-circle"></i>
                  <span>Add Custom Event</span>
                </button>
              ) : (
                <div className="custom-event-input">
                  <input
                    type="text"
                    placeholder="Enter custom event name..."
                    value={customEvent}
                    onChange={(e) => setCustomEvent(e.target.value)}
                    className="custom-input"
                    autoFocus
                  />
                  <div className="custom-input-actions">
                    <button
                      className="custom-btn custom-btn--cancel"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomEvent('');
                      }}
                    >
                      <i className="bx bx-x"></i>
                    </button>
                    <button
                      className="custom-btn custom-btn--submit"
                      onClick={handleCustomEventSubmit}
                      disabled={!customEvent.trim()}
                    >
                      <i className="bx bx-check"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EventDropDown;