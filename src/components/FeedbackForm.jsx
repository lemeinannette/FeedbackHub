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
    recommend: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      event:
        formData.event === "Other"
          ? `Other: ${formData.otherEvent}`
          : formData.event,
      name: feedbackType === "group" ? formData.group : formData.name,
      email: feedbackType === "group" ? formData.groupEmail : formData.email,
      contact:
        feedbackType === "group" ? formData.groupContact : formData.contact,
      type: feedbackType === "group" ? "Group" : "Individual",
      date: new Date().toLocaleString(),
    };

    const existing = JSON.parse(localStorage.getItem("feedbacks")) || [];
    existing.push(finalData);
    localStorage.setItem("feedbacks", JSON.stringify(existing));

    console.log("Form submitted:", finalData);

    setSubmitted(true);
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
    });
    setFeedbackType("");
  };

  if (submitted) {
    return (
      <div className="thank-you-message">
        Thank you! Your feedback has been submitted.
      </div>
    );
  }

  return (
    <div className="feedback-form-container">
      <form className="feedback-form" onSubmit={handleSubmit}>
        <h1>Feedback Form</h1>

        {/* Feedback Type */}
        <div className="form-group">
          <label>
            <strong>Are you giving feedback as:</strong>
          </label>
          <select
            value={feedbackType}
            onChange={(e) => setFeedbackType(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            <option value="individual">Individual</option>
            <option value="group">Group / Organization / Association</option>
          </select>
        </div>

        {/* Individual */}
        {feedbackType === "individual" && (
          <>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Contact:</label>
              <input
                type="tel"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                required
              />
            </div>
          </>
        )}

        {/* Group */}
        {feedbackType === "group" && (
          <>
            <div className="form-group">
              <label>Group / Organization Name:</label>
              <input
                type="text"
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Group Email:</label>
              <input
                type="email"
                value={formData.groupEmail}
                onChange={(e) =>
                  setFormData({ ...formData, groupEmail: e.target.value })
                }
                required
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
                required
              />
            </div>
          </>
        )}

        {/* Event Dropdown */}
        <EventDropdown
          value={formData.event}
          otherEvent={formData.otherEvent}
          onChange={(data) => setFormData({ ...formData, ...data })}
        />

        {/* Ratings */}
        <StarRating
          label="Food"
          value={formData.foodRating}
          onChange={(val) => setFormData({ ...formData, foodRating: val })}
        />
        <StarRating
          label="Ambience"
          value={formData.ambienceRating}
          onChange={(val) =>
            setFormData({ ...formData, ambienceRating: val })
          }
        />
        <StarRating
          label="Service"
          value={formData.serviceRating}
          onChange={(val) => setFormData({ ...formData, serviceRating: val })}
        />
        <StarRating
          label="Overall Experience"
          value={formData.overallRating}
          onChange={(val) =>
            setFormData({ ...formData, overallRating: val })
          }
        />

        {/* Recommend */}
        <div className="form-group">
          <label>
            <strong>Would you recommend us?</strong>
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="recommend"
                value="Yes"
                checked={formData.recommend === "Yes"}
                onChange={(e) =>
                  setFormData({ ...formData, recommend: e.target.value })
                }
              />
              Yes
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="recommend"
                value="No"
                checked={formData.recommend === "No"}
                onChange={(e) =>
                  setFormData({ ...formData, recommend: e.target.value })
                }
              />
              No
            </label>
          </div>
        </div>

        {/* Comments */}
        <div className="form-group">
          <label>Comments:</label>
          <textarea
            value={formData.comments}
            onChange={(e) =>
              setFormData({ ...formData, comments: e.target.value })
            }
          />
        </div>

        {/* Submit */}
        <button type="submit">Submit Feedback</button>
      </form>
    </div>
  );
}
