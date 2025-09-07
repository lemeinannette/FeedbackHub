import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import Toggle from "./Toggle";
import EventDropdown from "./EventDropDown";

export default function FeedbackForm() {
  const navigate = useNavigate();

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
    recommend: "",
    comment: "",
  });

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

    // Save feedback to localStorage
    const existing = JSON.parse(localStorage.getItem("feedbacks")) || [];
    existing.push(finalData);
    localStorage.setItem("feedbacks", JSON.stringify(existing));

    console.log("Form submitted:", finalData);

    // ✅ Redirect to Thank You page
    navigate("/thank-you");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Feedback Form</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name: </label>
          <input
            type="text"
            value={formData.guestName}
            onChange={(e) =>
              setFormData({ ...formData, guestName: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label>Contact: </label>
          <input
            type="text"
            value={formData.contact}
            onChange={(e) =>
              setFormData({ ...formData, contact: e.target.value })
            }
          />
        </div>

        {/* Event Dropdown */}
        <EventDropdown
          value={formData.event}
          onChange={(event) => setFormData({ ...formData, ...event })}
        />

        {/* Ratings */}
        <StarRating
          label="Overall"
          value={formData.overall}
          onChange={(val) => setFormData({ ...formData, overall: val })}
        />
        <StarRating
          label="Food"
          value={formData.food}
          onChange={(val) => setFormData({ ...formData, food: val })}
        />
        <StarRating
          label="Service"
          value={formData.service}
          onChange={(val) => setFormData({ ...formData, service: val })}
        />
        <StarRating
          label="Ambience"
          value={formData.ambience}
          onChange={(val) => setFormData({ ...formData, ambience: val })}
        />
        <StarRating
          label="Entertainment"
          value={formData.entertainment}
          onChange={(val) => setFormData({ ...formData, entertainment: val })}
        />

        {/* Recommend Toggle */}
        <Toggle
          label="Would you recommend us?"
          value={formData.recommend}
          onChange={(val) => setFormData({ ...formData, recommend: val })}
        />

        {/* Comment */}
        <div>
          <label>Comments: </label>
          <textarea
            value={formData.comment}
            onChange={(e) =>
              setFormData({ ...formData, comment: e.target.value })
            }
          />
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
