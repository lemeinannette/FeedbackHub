// src/components/feedback/FeedbackForm.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "../common/StarRating";  // Updated path
import EventDropDown from "../common/EventDropDown";  // Updated path
import Toggle from "../common/Toggle";  // Updated path
import './FeedbackForm.css';

const FeedbackForm = ({ 
  previousRoute, 
  setPreviousRoute,
  clientDarkMode,
  toggleClientTheme
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    event: '',
    food: 5,
    ambience: 5,
    service: 5,
    overall: 5,
    recommend: 'Yes',
    comments: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get existing feedbacks
      const existingFeedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
      
      // Add new feedback
      const updatedFeedbacks = [...existingFeedbacks, formData];
      
      // Save to localStorage
      localStorage.setItem("feedbacks", JSON.stringify(updatedFeedbacks));
      
      // Dispatch custom event to trigger real-time update
      window.dispatchEvent(new Event('feedbackUpdated'));
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        event: '',
        food: 5,
        ambience: 5,
        service: 5,
        overall: 5,
        recommend: 'Yes',
        comments: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      setSubmitMessage('Thank you for your feedback!');
      setTimeout(() => setSubmitMessage(''), 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setSubmitMessage('Error submitting feedback. Please try again.');
      setTimeout(() => setSubmitMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-form-container">
      <h2>Share Your Feedback</h2>
      {submitMessage && (
        <div className="submit-message">
          {submitMessage}
        </div>
      )}
      <form onSubmit={handleSubmit} className="feedback-form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="event">Event</label>
          <EventDropDown
            events={['Birthday Party', 'Corporate Event', 'Wedding', 'Conference', 'Other']}
            selectedEvent={formData.event}
            onEventChange={(event) => setFormData(prev => ({ ...prev, event }))}
            placeholder="Select an event"
            allowCustom={true}
          />
        </div>
        
        <div className="ratings-container">
          <div className="rating-group">
            <label>Food Quality</label>
            <StarRating 
              rating={formData.food}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, food: rating }))}
              size="large"
            />
          </div>
          
          <div className="rating-group">
            <label>Ambience</label>
            <StarRating 
              rating={formData.ambience}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, ambience: rating }))}
              size="large"
            />
          </div>
          
          <div className="rating-group">
            <label>Service</label>
            <StarRating 
              rating={formData.service}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, service: rating }))}
              size="large"
            />
          </div>
          
          <div className="rating-group">
            <label>Overall Experience</label>
            <StarRating 
              rating={formData.overall}
              onRatingChange={(rating) => setFormData(prev => ({ ...prev, overall: rating }))}
              size="large"
            />
          </div>
        </div>
        
        <div className="form-group">
          <label>Would you recommend us?</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="recommend"
                value="Yes"
                checked={formData.recommend === 'Yes'}
                onChange={handleChange}
              />
              <span>Yes</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="recommend"
                value="No"
                checked={formData.recommend === 'No'}
                onChange={handleChange}
              />
              <span>No</span>
            </label>
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
        
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
          
          <div className="theme-toggle-container">
            <Toggle
              isOn={clientDarkMode}
              onToggle={toggleClientTheme}
              size="small"
              label="Dark Mode"
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;