import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import Toggle from "./Toggle";
import EventDropdown from "./EventDropDown";

export default function FeedbackForm() {
  const [formData, setFormData] = useState({
    guestName: "",
    contact: "",
    event: "",
    otherEvent: "",
    overall: 0,
    food: 0,
    service: 0,
    ambience: 0,
    entertainment: 0,
    comment: "",
    recommend: "",
  });

  const navigate = useNavigate();

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      event:
        formData.event === "Other"
          ? `Other: ${formData.otherEvent}`
          : formData.event,
      date: new Date().toLocaleString(),
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("feedbacks")) || [];
    existing.push(finalData);
    localStorage.setItem("feedbacks", JSON.stringify(existing));

    // Redirect to thank you page
    navigate("/thankyou");
  };

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h1>Event Feedback Form</h1>

      <label>Name</label>
      <input
        type="text"
        value={formData.guestName}
        onChange={(e) => handleChange("guestName", e.target.value)}
        required
      />

      <label>Contact</label>
      <input
        type="text"
        value={formData.contact}
        onChange={(e) => handleChange("contact", e.target.value)}
        required
      />

      <EventDropdown
        value={formData.event}
        otherEvent={formData.otherEvent}
        onChange={handleChange}
      />

      <StarRating
        label="Overall Experience"
        value={formData.overall}
        onChange={(v) => handleChange("overall", v)}
      />
      <StarRating
        label="Food Quality"
        value={formData.food}
        onChange={(v) => handleChange("food", v)}
      />
      <StarRating
        label="Service"
        value={formData.service}
        onChange={(v) => handleChange("service", v)}
      />
      <StarRating
        label="Ambience"
        value={formData.ambience}
        onChange={(v) => handleChange("ambience", v)}
      />
      <StarRating
        label="Entertainment"
        value={formData.entertainment}
        onChange={(v) => handleChange("entertainment", v)}
      />

      <Toggle
        label="Would you recommend us?"
        value={formData.recommend}
        onChange={(v) => handleChange("recommend", v)}
      />

      <label>Comments</label>
      <textarea
        value={formData.comment}
        onChange={(e) => handleChange("comment", e.target.value)}
        rows="4"
      />

      <button type="submit">Submit Feedback</button>
    </form>
  );
}
