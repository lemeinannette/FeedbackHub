export default function EventDropdown({ value, otherEvent, onChange }) {
  const handleSelect = (e) => {
    onChange({ event: e.target.value, otherEvent: "" });
  };

  const handleOtherChange = (e) => {
    onChange({ event: "Other", otherEvent: e.target.value });
  };

  return (
    <div>
      <label>Event: </label>
      <select value={value} onChange={handleSelect} required>
        <option value="">-- Select Event --</option>
        <option value="Wedding">Wedding</option>
        <option value="Conference">Conference</option>
        <option value="Gala">Gala</option>
        <option value="Other">Other</option>
      </select>

      {value === "Other" && (
        <div style={{ marginTop: "5px" }}>
          <label>Specify Other Event: </label>
          <textarea
            value={otherEvent}
            onChange={handleOtherChange}
            placeholder="Enter event details"
            required
          />
        </div>
      )}
    </div>
  );
}
