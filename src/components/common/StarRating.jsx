import React from "react";

export default function StarRating({ label, value, onChange }) {
  return (
    <div>
      <label>{label}: </label>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{ cursor: "pointer", color: star <= value ? "gold" : "gray" }}
        >
          ★
        </span>
      ))}
      <span> (Selected: {value})</span>
    </div>
  );
}
