import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import EventDropdown from "./EventDropDown";
import Toggle from "./Toggle";
import "./FeedbackForm.css";

export default function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    group: "",
    groupEmail: "",
    groupContact: "",
    comments: "",
    foodRating: 0,
    serviceRating: 0,
    ambienceRating: 0,
    overallRating: 0,
    event: "",
    otherEvent: "",
    recommend: "", // stores "Yes" or "No"
    isAnonymous: false, // ✅ NEW
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.isAnonymous && !feedbackType) {
      errors.feedbackType = "Please select a feedback type";
    }
    
    if (!formData.isAnonymous && feedbackType === "individual" && !formData.name) {
      errors.name = "Name is required";
    }
    
    if (!formData.isAnonymous && feedbackType === "individual" && !formData.email) {
      errors.email = "Email is required";
    }
    
    if (!formData.isAnonymous && feedbackType === "group" && !formData.group) {
      errors.group = "Group name is required";
    }
    
    if (!formData.event) {
      errors.event = "Please select an event";
    }
    
    if (formData.event === "Other" && !formData.otherEvent) {
      errors.otherEvent = "Please specify the event";
    }
    
    if (formData.foodRating === 0) {
      errors.foodRating = "Please rate the food";
    }
    
    if (formData.serviceRating === 0) {
      errors.serviceRating = "Please rate the service";
    }
    
    if (formData.ambienceRating === 0) {
      errors.ambienceRating = "Please rate the ambience";
    }
    
    if (formData.overallRating === 0) {
      errors.overallRating = "Please rate the overall experience";
    }
    
    if (!formData.recommend) {
      errors.recommend = "Please indicate if you would recommend us";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const finalData = {
      ...formData,
      // ✅ Add short keys for easy access in AdminPanel
      food: formData.foodRating,
      service: formData.serviceRating,
      ambience: formData.ambienceRating,
      overall: formData.overallRating,

      // ✅ Event fallback if "Other" is chosen
      event:
        formData.event === "Other"
          ? `Other: ${formData.otherEvent}`
          : formData.event,

      // ✅ Correct name/email/contact depending on type or Anonymous
      name: formData.isAnonymous
        ? "Anonymous"
        : feedbackType === "group"
        ? formData.group
        : formData.name,
      email: formData.isAnonymous
        ? ""
        : feedbackType === "group"
        ? formData.groupEmail
        : formData.email,
      contact: formData.isAnonymous
        ? ""
        : feedbackType === "group"
        ? formData.groupContact
        : formData.contact,

      type: formData.isAnonymous
        ? "Anonymous"
        : feedbackType === "group"
        ? "Group"
        : "Individual",
      date: new Date().toLocaleString(),
      // recommend is already a string "Yes" or "No"
    };

    const existing = JSON.parse(localStorage.getItem("feedbacks")) || [];
    existing.push(finalData);
    localStorage.setItem("feedbacks", JSON.stringify(existing));

    console.log("Form submitted:", finalData);

    setIsSubmitting(false);
    setSubmitted(true);
    // reset form
    setFormData({
      name: "",
      email: "",
      contact: "",
      group: "",
      groupEmail: "",
      groupContact: "",
      comments: "",
      foodRating: 0,
      serviceRating: 0,
      ambienceRating: 0,
      overallRating: 0,
      event: "",
      otherEvent: "",
      recommend: "",
      isAnonymous: false,
    });
    setFeedbackType("");
  };

  if (submitted) {
    return (
      <div className="thank-you-container">
        <div className="thank-you-message">
          <div className="success-icon">
            <i className="bx bx-check-circle"></i>
          </div>
          <h2>Thank You!</h2>
          <p>Your feedback has been submitted successfully.</p>
          <button 
            className="submit-another-btn"
            onClick={() => setSubmitted(false)}
          >
            Submit Another Feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-form-container">
      <form className="feedback-form" onSubmit={handleSubmit}>
        <h1>Feedback Form</h1>
        <p className="form-description">
          We value your feedback! Please share your experience with us.
        </p>

        {/* Anonymous Option */}
        <div className="form-group anonymous-option">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) =>
                setFormData({ ...formData, isAnonymous: e.target.checked })
              }
            />
            <span className="checkmark"></span>
            Submit as Anonymous
          </label>
        </div>

        {/* Feedback Type */}
        {!formData.isAnonymous && (
          <div className="form-group">
            <label>
              <strong>Are you giving feedback as:</strong>
            </label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="feedbackType"
                  value="individual"
                  checked={feedbackType === "individual"}
                  onChange={(e) => setFeedbackType(e.target.value)}
                />
                <span className="radio-custom"></span>
                Individual
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="feedbackType"
                  value="group"
                  checked={feedbackType === "group"}
                  onChange={(e) => setFeedbackType(e.target.value)}
                />
                <span className="radio-custom"></span>
                Group / Organization / Association
              </label>
            </div>
            {formErrors.feedbackType && (
              <span className="error-message">{formErrors.feedbackType}</span>
            )}
          </div>
        )}

        {/* Individual */}
        {!formData.isAnonymous && feedbackType === "individual" && (
          <div className="form-section">
            <h3>Individual Information</h3>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={formErrors.name ? "error" : ""}
              />
              {formErrors.name && (
                <span className="error-message">{formErrors.name}</span>
              )}
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={formErrors.email ? "error" : ""}
              />
              {formErrors.email && (
                <span className="error-message">{formErrors.email}</span>
              )}
            </div>
            <div className="form-group">
              <label>Contact:</label>
              <input
                type="tel"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* Group */}
        {!formData.isAnonymous && feedbackType === "group" && (
          <div className="form-section">
            <h3>Group / Organization Information</h3>
            <div className="form-group">
              <label>Group / Organization Name:</label>
              <input
                type="text"
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                className={formErrors.group ? "error" : ""}
              />
              {formErrors.group && (
                <span className="error-message">{formErrors.group}</span>
              )}
            </div>
            <div className="form-group">
              <label>Group Email:</label>
              <input
                type="email"
                value={formData.groupEmail}
                onChange={(e) =>
                  setFormData({ ...formData, groupEmail: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Group Contact:</label>
              <input
                type="tel"
                value={formData.groupContact}
                onChange={(e) =>
                  setFormData({ ...formData, groupContact: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {/* Event Dropdown */}
        <div className="form-section">
          <h3>Event Information</h3>
          <EventDropdown
            value={formData.event}
            otherEvent={formData.otherEvent}
            onChange={(data) => setFormData({ ...formData, ...data })}
          />
          {formErrors.event && (
            <span className="error-message">{formErrors.event}</span>
          )}
          {formErrors.otherEvent && (
            <span className="error-message">{formErrors.otherEvent}</span>
          )}
        </div>

        {/* Ratings */}
        <div className="form-section">
          <h3>Your Ratings</h3>
          <div className="ratings-container">
            <StarRating
              label="Food"
              value={formData.foodRating}
              onChange={(val) => setFormData({ ...formData, foodRating: val })}
              error={formErrors.foodRating}
            />
            <StarRating
              label="Ambience"
              value={formData.ambienceRating}
              onChange={(val) =>
                setFormData({ ...formData, ambienceRating: val })
              }
              error={formErrors.ambienceRating}
            />
            <StarRating
              label="Service"
              value={formData.serviceRating}
              onChange={(val) => setFormData({ ...formData, serviceRating: val })}
              error={formErrors.serviceRating}
            />
            <StarRating
              label="Overall Experience"
              value={formData.overallRating}
              onChange={(val) =>
                setFormData({ ...formData, overallRating: val })
              }
              error={formErrors.overallRating}
            />
          </div>
        </div>

        {/* Recommend */}
        <div className="form-section">
          <h3>Recommendation</h3>
          <div className="form-group">
            <label>
              <strong>Would you recommend us?</strong>
            </label>
            <div className="recommendation-options">
              <label className="recommendation-label">
                <input
                  type="radio"
                  name="recommend"
                  value="Yes"
                  checked={formData.recommend === "Yes"}
                  onChange={(e) =>
                    setFormData({ ...formData, recommend: e.target.value })
                  }
                />
                <span className="recommendation-custom yes">
                  <i className="bx bx-smile"></i>
                  Yes
                </span>
              </label>
              <label className="recommendation-label">
                <input
                  type="radio"
                  name="recommend"
                  value="No"
                  checked={formData.recommend === "No"}
                  onChange={(e) =>
                    setFormData({ ...formData, recommend: e.target.value })
                  }
                />
                <span className="recommendation-custom no">
                  <i className="bx bx-sad"></i>
                  No
                </span>
              </label>
            </div>
            {formErrors.recommend && (
              <span className="error-message">{formErrors.recommend}</span>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="form-section">
          <h3>Additional Comments</h3>
          <div className="form-group">
            <label>Comments:</label>
            <textarea
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              placeholder="Please share any additional feedback or suggestions..."
            />
          </div>
        </div>

        {/* Submit */}
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <i className="bx bx-loader-alt bx-spin"></i>
                Submitting...
              </>
            ) : (
              <>
                <i className="bx bx-send"></i>
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}