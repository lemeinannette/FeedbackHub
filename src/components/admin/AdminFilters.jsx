import React, { useState, useRef, useEffect } from 'react';
import './AdminFilters.css';

const AdminFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  timeFilter, 
  setTimeFilter, 
  customStartDate, 
  setCustomStartDate, 
  customEndDate, 
  setCustomEndDate,
  filteredFeedbacks 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTimeFilterLabel = () => {
    switch(timeFilter) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'custom': return customStartDate && customEndDate 
        ? `${customStartDate} to ${customEndDate}` 
        : 'Custom Range';
      default: return 'All Time';
    }
  };

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    if (filter !== 'custom') {
      setShowDatePicker(false);
    }
  };

  return (
    <section className="filters-section">
      <div className="filters-container">
        <div className="search-container">
          <div className="search-input-wrapper">
            <i className="bx bx-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search feedback by name, email, event, or comments..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                <i className="bx bx-x"></i>
              </button>
            )}
          </div>
        </div>
        
        <div className="time-filter-container" ref={dropdownRef}>
          <button 
            className="time-filter-button"
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <i className="bx bx-calendar-alt"></i>
            <span>{getTimeFilterLabel()}</span>
            <i className={`bx bx-chevron-${showDatePicker ? 'up' : 'down'}`}></i>
          </button>
          {showDatePicker && (
            <div className="date-picker-dropdown">
              <button 
                className={timeFilter === 'all' ? 'active' : ''} 
                onClick={() => handleTimeFilterChange('all')}
              >
                <i className="bx bx-time-five"></i>
                All Time
              </button>
              <button 
                className={timeFilter === '7days' ? 'active' : ''} 
                onClick={() => handleTimeFilterChange('7days')}
              >
                <i className="bx bx-calendar-week"></i>
                Last 7 Days
              </button>
              <button 
                className={timeFilter === '30days' ? 'active' : ''} 
                onClick={() => handleTimeFilterChange('30days')}
              >
                <i className="bx bx-calendar-month"></i>
                Last 30 Days
              </button>
              <button 
                className={timeFilter === 'custom' ? 'active' : ''} 
                onClick={() => handleTimeFilterChange('custom')}
              >
                <i className="bx bx-calendar-edit"></i>
                Custom Range
              </button>
              {timeFilter === 'custom' && (
                <div className="custom-date-inputs">
                  <input 
                    type="date" 
                    value={customStartDate} 
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    max={customEndDate || new Date().toISOString().split('T')[0]}
                  />
                  <span>to</span>
                  <input 
                    type="date" 
                    value={customEndDate} 
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    min={customStartDate}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {searchTerm && (
        <div className="search-results-info">
          <i className="bx bx-search-alt"></i>
          Found {filteredFeedbacks.length} result{filteredFeedbacks.length !== 1 ? 's' : ''} for "{searchTerm}"
        </div>
      )}
    </section>
  );
};

export default AdminFilters;