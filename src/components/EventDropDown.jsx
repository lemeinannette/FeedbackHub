export default function EventDropdown({ value, otherEvent, onChange }) {
  return (
    <div>
      <label>Event: </label>
      <select
        value={value}
        onChange={(e) => onChange("event", e.target.value)}
        required
      >
        <option value="">Select an event</option>
        <option value="Wedding">Wedding</option>
        <option value="Conference">Conference</option>
        <option value="Gala">Gala</option>
        <option value="Other">Other</option>
      </select>

      {/* If "Other" → show text input */}
      {value === "Other" && (
        <div>
          <label>Specify Event: </label>
          <input
            type="text"
            value={otherEvent}
            onChange={(e) => onChange("otherEvent", e.target.value)}
            placeholder="Enter event name"
            required
          />
        </div>
      )}
    </div>
  );
}
