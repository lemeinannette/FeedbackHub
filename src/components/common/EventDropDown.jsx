import React, { useState } from "react";
import "./EventDropDown.css"; // optional, but we'll tone it down

export default function EventDropdown({ value, otherEvent, onChange }) {
  const [step, setStep] = useState("select"); // "select" or "other"

  const handleSelect = (e) => {
    if (e.target.value === "Other") {
      setStep("other");
      onChange({ event: "Other", otherEvent: "" });
    } else {
      setStep("select");
      onChange({ event: e.target.value, otherEvent: "" });
    }
  };

  const handleOtherChange = (e) => {
    onChange({ event: "Other", otherEvent: e.target.value });
  };

  return (
    <div>
      {step === "select" && (
        <div className="form-group">
          <label>Select Event:</label>
          <select value={value} onChange={handleSelect} required>
            <option value="">-- Select Event --</option>
            <option value="Wedding">Wedding</option>
            <option value="Conference">Conference</option>
            <option value="Gala">Gala</option>
            <option value="Other">Other</option>
          </select>
        </div>
      )}

      {step === "other" && (
        <>
          <div className="form-group">
            <label>Specify Other Event:</label>
            <textarea
              value={otherEvent}
              onChange={handleOtherChange}
              placeholder="Enter event details..."
              required
            />
          </div>
          <button
            type="button"
            className="back-btn"
            onClick={() => setStep("select")}
          >
            ← Back
          </button>
        </>
      )}
    </div>
  );
}
