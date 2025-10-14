// src/components/feedback/FeedbackForm.jsx

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import StarRating from "../common/StarRating";
import EventDropDown from "../common/EventDropDown";
import './FeedbackForm.css';

const FeedbackForm = ({ 
  previousRoute, 
  setPreviousRoute,
  clientDarkMode,
  toggleClientTheme
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    isAnonymous: false,
    submissionType: 'GROUP / ORGANIZATION / ASSOCIATION',
    groupName: '',
    groupEmail: '',
    groupContact: '',
    individualName: '',
    individualEmail: '',
    individualContact: '',
    event: '',
    otherEventText: '',
    food: 0,
    ambience: 0,
    service: 0,
    overall: 0,
    recommend: '',
    comments: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let dataToSubmit = { ...formData };

    if (dataToSubmit.event === 'Other') {
      dataToSubmit.event = dataToSubmit.otherEventText;
    }
    
    delete dataToSubmit.otherEventText;

    try {
      const existingFeedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
      const updatedFeedbacks = [...existingFeedbacks, dataToSubmit];
      localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks));
      window.dispatchEvent(new Event('feedbackUpdated'));
      
      navigate('/thank-you', { state: { from: location.pathname } });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`feedback-form-container ${clientDarkMode ? 'dark-mode' : ''}`}>
      <div className="feedback-form-card">
        <header className="feedback-header">
          <h1 className="form-title">Feedback Form</h1>
          <div className="header-toggle">
            <label className="theme-toggle">
              <input
                type="checkbox"
                checked={clientDarkMode}
                onChange={toggleClientTheme}
              />
              <span className="toggle-slider">
                <span className="toggle-icons">
                  <span className="moon-icon">🌙</span>
                  <span className="sun-icon">☀️</span>
                </span>
                <span className="toggle-dot"></span>
              </span>
            </label>
          </div>
        </header>
        
        <div className="feedback-form-content">
          <p className="form-subtitle">We value your feedback! Please share your experience with us.</p>
          
          <form onSubmit={handleSubmit} className="feedback-form">
            <div className="anonymous-option">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleChange}
                />
                <span className="checkmark"></span>
                <span className="checkbox-label">SUBMIT AS ANONYMOUS</span>
              </label>
            </div>
            
            <div className="form-group">
              <label className="section-label">ARE YOU GIVING FEEDBACK AS:</label>
              <div className="radio-pills">
                <label className={`radio-pill ${formData.submissionType === 'INDIVIDUAL' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="submissionType"
                    value="INDIVIDUAL"
                    checked={formData.submissionType === 'INDIVIDUAL'}
                    onChange={handleChange}
                    disabled={formData.isAnonymous}
                  />
                  <span>INDIVIDUAL</span>
                </label>
                <label className={`radio-pill ${formData.submissionType === 'GROUP / ORGANIZATION / ASSOCIATION' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="submissionType"
                    value="GROUP / ORGANIZATION / ASSOCIATION"
                    checked={formData.submissionType === 'GROUP / ORGANIZATION / ASSOCIATION'}
                    onChange={handleChange}
                    disabled={formData.isAnonymous}
                  />
                  <span>GROUP / ORGANIZATION / ASSOCIATION</span>
                </label>
              </div>
            </div>
            
            {/* Individual Information Section */}
            {formData.submissionType === 'INDIVIDUAL' && !formData.isAnonymous && (
              <div className="info-section">
                <h3 className="section-title">Individual Information</h3>
                
                <div className="form-group">
                  <label htmlFor="individualName">NAME:</label>
                  <input
                    type="text"
                    id="individualName"
                    name="individualName"
                    value={formData.individualName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="individualEmail">EMAIL:</label>
                  <input
                    type="email"
                    id="individualEmail"
                    name="individualEmail"
                    value={formData.individualEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="individualContact">CONTACT:</label>
                  <input
                    type="text"
                    id="individualContact"
                    name="individualContact"
                    value={formData.individualContact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Group Information Section */}
            {formData.submissionType === 'GROUP / ORGANIZATION / ASSOCIATION' && !formData.isAnonymous && (
              <div className="info-section">
                <h3 className="section-title">Group / Organization Information</h3>
                
                <div className="form-group">
                  <label htmlFor="groupName">GROUP / ORGANIZATION NAME:</label>
                  <input
                    type="text"
                    id="groupName"
                    name="groupName"
                    value={formData.groupName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="groupEmail">GROUP EMAIL:</label>
                  <input
                    type="email"
                    id="groupEmail"
                    name="groupEmail"
                    value={formData.groupEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="groupContact">GROUP CONTACT:</label>
                  <input
                    type="text"
                    id="groupContact"
                    name="groupContact"
                    value={formData.groupContact}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="event">Event Information</label>
              <EventDropDown
                events={['Birthday Party', 'Corporate Event', 'Wedding', 'Conference', 'Other']}
                selectedEvent={formData.event}
                onEventChange={(event) => setFormData(prev => ({ ...prev, event }))}
                placeholder="Select an event"
                allowCustom={true}
              />
            </div>

            {formData.event === 'Other' && (
              <div className="form-group">
                <label htmlFor="otherEventText">Please specify the event</label>
                <textarea
                  id="otherEventText"
                  name="otherEventText"
                  value={formData.otherEventText}
                  onChange={handleChange}
                  rows="2"
                  placeholder="e.g., Annual Company Gala"
                  required={formData.event === 'Other'}
                ></textarea>
              </div>
            )}
            
            <div className="ratings-section">
              <h3 className="section-title">Your Ratings</h3>
              <div className="ratings-grid">
                <div className="rating-item">
                  <label>Food</label>
                  <StarRating 
                    rating={formData.food}
                    onRatingChange={(rating) => setFormData(prev => ({ ...prev, food: rating }))}
                    size="large"
                  />
                  <span className="rating-value">Selected: {formData.food}</span>
                </div>
                
                <div className="rating-item">
                  <label>Ambience</label>
                  <StarRating 
                    rating={formData.ambience}
                    onRatingChange={(rating) => setFormData(prev => ({ ...prev, ambience: rating }))}
                    size="large"
                  />
                  <span className="rating-value">Selected: {formData.ambience}</span>
                </div>
                
                <div className="rating-item">
                  <label>Service</label>
                  <StarRating 
                    rating={formData.service}
                    onRatingChange={(rating) => setFormData(prev => ({ ...prev, service: rating }))}
                    size="large"
                  />
                  <span className="rating-value">Selected: {formData.service}</span>
                </div>
                
                <div className="rating-item">
                  <label>Overall Experience</label>
                  <StarRating 
                    rating={formData.overall}
                    onRatingChange={(rating) => setFormData(prev => ({ ...prev, overall: rating }))}
                    size="large"
                  />
                  <span className="rating-value">Selected: {formData.overall}</span>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <label>Would you recommend us?</label>
              <div className="recommend-buttons">
                <button
                  type="button"
                  className={`recommend-btn yes ${formData.recommend === 'Yes' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, recommend: 'Yes' }))}
                >
                  <span className="recommend-icon">👍</span>
                  <span>YES</span>
                </button>
                <button
                  type="button"
                  className={`recommend-btn no ${formData.recommend === 'No' ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, recommend: 'No' }))}
                >
                  <span className="recommend-icon">👎</span>
                  <span>NO</span>
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="comments">Additional Comments</label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;