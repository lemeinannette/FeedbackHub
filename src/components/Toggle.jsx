export default function Toggle({ label, value, onChange }) {
  return (
    <div>
      <label>{label}: </label>
      <label>
        <input
          type="radio"
          name={label}
          value="yes"
          checked={value === "yes"}
          onChange={() => onChange("yes")}
        />
        Yes
      </label>
      <label style={{ marginLeft: "10px" }}>
        <input
          type="radio"
          name={label}
          value="no"
          checked={value === "no"}
          onChange={() => onChange("no")}
        />
        No
      </label>
    </div>
  );
}
