import React, { useState } from 'react';
import './FeedbackTable.css';

const FeedbackTable = ({ 
  currentItems, 
  filteredFeedbacks, 
  searchTerm, 
  handleDelete, 
  handleArchive 
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRowExpansion = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRatingStars = (rating) => {
    if (!rating) return 'N/A';
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<i key={i} className="bx bxs-star filled"></i>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<i key={i} className="bx bxs-star-half filled"></i>);
      } else {
        stars.push(<i key={i} className="bx bx-star empty"></i>);
      }
    }
    return stars;
  };

  return (
    <section className="table-section">
      <div className="table-header">
        <h2 className="table-title">Recent Feedback</h2>
        <div className="table-info">
          <span className="info-count">
            Showing {Math.min(10, filteredFeedbacks.length)} of {filteredFeedbacks.length} entries
          </span>
          {searchTerm && (
            <span className="search-indicator">
              <i className="bx bx-search"></i>
              Filtered by: "{searchTerm}"
            </span>
          )}
        </div>
      </div>
      
      <div className="table-container">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>
                <div className="table-header-content">
                  <span>Date</span>
                  <i className="bx bx-calendar-alt"></i>
                </div>
              </th>
              <th>
                <div className="table-header-content">
                  <span>Name/Group</span>
                  <i className="bx bx-user"></i>
                </div>
              </th>
              <th>
                <div className="table-header-content">
                  <span>Event</span>
                  <i className="bx bx-event"></i>
                </div>
              </th>
              <th>
                <div className="table-header-content">
                  <span>Food</span>
                  <i className="bx bx-restaurant"></i>
                </div>
              </th>
              <th>
                <div className="table-header-content">
                  <span>Ambience</span>
                  <i className="bx bx-palette"></i>
                </div>
              </th>
              <th>
                <div className="table-header-content">
                  <span>Service</span>
                  <i className="bx bx-user-voice"></i>
                </div>
              </th>
              <th>
                <div className="table-header-content">
                  <span>Overall</span>
                  <i className="bx bx-star"></i>
                </div>
              </th>
              <th>
                <div className="table-header-content">
                  <span>Recommend</span>
                  <i className="bx bx-like"></i>
                </div>
              </th>
              <th>
                <div className="table-header-content">
                  <span>Comments</span>
                  <i className="bx bx-comment"></i>
                </div>
              </th>
              <th className="actions-column">
                <div className="table-header-content">
                  <span>Actions</span>
                  <i className="bx bx-cog"></i>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-state">
                  <div className="empty-state-content">
                    <i className="bx bx-inbox"></i>
                    <h3>No feedback found</h3>
                    <p>
                      {searchTerm.trim() 
                        ? "No feedback matches your search criteria. Try adjusting your filters." 
                        : "No feedback available yet. Check back later for customer responses."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentItems.map((f, index) => (
                <React.Fragment key={index}>
                  <tr className={index % 2 === 0 ? "even" : "odd"}>
                    <td className="date-cell">
                      <span className="date-value">{formatDate(f.date)}</span>
                    </td>
                    <td className="name-cell">
                      <div className="name-content">
                        <span className="name-text">{f.name || 'Anonymous'}</span>
                        {f.email && (
                          <span className="email-text">{f.email}</span>
                        )}
                      </div>
                    </td>
                    <td className="event-cell">
                      <span className="event-badge">{f.event || 'General'}</span>
                    </td>
                    <td className="rating-cell">
                      <div className="rating-container">
                        <span className="rating-value">{f.food || 'N/A'}</span>
                        <div className="rating-stars">
                          {getRatingStars(f.food)}
                        </div>
                      </div>
                    </td>
                    <td className="rating-cell">
                      <div className="rating-container">
                        <span className="rating-value">{f.ambience || 'N/A'}</span>
                        <div className="rating-stars">
                          {getRatingStars(f.ambience)}
                        </div>
                      </div>
                    </td>
                    <td className="rating-cell">
                      <div className="rating-container">
                        <span className="rating-value">{f.service || 'N/A'}</span>
                        <div className="rating-stars">
                          {getRatingStars(f.service)}
                        </div>
                      </div>
                    </td>
                    <td className="rating-cell">
                      <div className="rating-container overall-rating">
                        <span className="rating-value">{f.overall || 'N/A'}</span>
                        <div className="rating-stars">
                          {getRatingStars(f.overall)}
                        </div>
                      </div>
                    </td>
                    <td className="recommend-cell">
                      <span className={`recommend-badge ${f.recommend === 'Yes' ? 'yes' : 'no'}`}>
                        <i className={`bx ${f.recommend === 'Yes' ? 'bx-like' : 'bx-dislike'}`}></i>
                        {f.recommend || 'No'}
                      </span>
                    </td>
                    <td className="comments-cell">
                      <div className="comments-container">
                        {f.comments ? (
                          <>
                            <div 
                              className="comment-text" 
                              title={f.comments}
                              onClick={() => toggleRowExpansion(index)}
                            >
                              {f.comments.length > 50 
                                ? `${f.comments.substring(0, 50)}...` 
                                : f.comments}
                            </div>
                            {f.comments.length > 50 && (
                              <button 
                                className="expand-btn"
                                onClick={() => toggleRowExpansion(index)}
                              >
                                <i className={`bx bx-chevron-${expandedRow === index ? 'up' : 'down'}`}></i>
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="no-comments">No comments</span>
                        )}
                      </div>
                    </td>
                    <td className="actions-cell">
                      <div className="action-buttons">
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(f)}
                          title="Delete feedback"
                        >
                          <i className="bx bx-trash"></i>
                        </button>
                        <button
                          className={`action-btn archive-btn ${f.archived ? 'archived' : ''}`}
                          onClick={() => handleArchive(f)}
                          title={f.archived ? "Unarchive feedback" : "Archive feedback"}
                        >
                          <i className={`bx ${f.archived ? 'bx-archive-out' : 'bx-archive-in'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === index && f.comments && f.comments.length > 50 && (
                    <tr className="expanded-row">
                      <td colSpan="10">
                        <div className="expanded-content">
                          <h4>Full Comment</h4>
                          <p>{f.comments}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default FeedbackTable;