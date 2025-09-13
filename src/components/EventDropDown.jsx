import React from "react";

export default function EventDropdown({ value, otherEvent, onChange }) {
  const handleSelect = (e) => {
    onChange({ event: e.target.value, otherEvent: "" });
  };

  const handleOtherChange = (e) => {
    onChange({ event: "Other", otherEvent: e.target.value });
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <label style={{ display: "block", marginBottom: "5px" }}>
        Event:
      </label>

      <select value={value} onChange={handleSelect} required>
        <option value="">-- Select Event --</option>
        <option value="Wedding">Wedding</option>
        <option value="Conference">Conference</option>
        <option value="Gala">Gala</option>
        <option value="Other">Other</option>
      </select>

      {value === "Other" && (
        <div style={{ marginTop: "10px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Specify Other Event:
          </label>
          <textarea
            value={otherEvent}
            onChange={handleOtherChange}
            placeholder="Enter event details"
            required
            rows={3}
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  );
}
