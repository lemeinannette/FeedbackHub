import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("feedbacks")) || [];
    setFeedbacks(data);

    if (data.length > 0) {
      const avg = (arr) =>
        (arr.reduce((a, b) => a + (Number(b) || 0), 0) / arr.length).toFixed(1);

      setSummary({
        food: avg(data.map((f) => f.foodRating)),
        service: avg(data.map((f) => f.serviceRating)),
        ambience: avg(data.map((f) => f.ambienceRating)),
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    window.location.href = "/admin-login";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      {/* Summary */}
      <h2>Summary</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback available yet.</p>
      ) : (
        <ul>
          <li>Average Food Rating: {summary.food}</li>
          <li>Average Service Rating: {summary.service}</li>
          <li>Average Ambience Rating: {summary.ambience}</li>
        </ul>
      )}

      {/* Detailed feedbacks */}
      <h2>All Feedbacks</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback available yet.</p>
      ) : (
        <ul>
          {feedbacks.map((fb, index) => (
            <li key={index}>
              <strong>{fb.name}</strong> ({fb.event})  
              <br />
              {fb.comments}  
              <br />
              {fb.email && <span>Email: {fb.email} | </span>}
              <span>Date: {fb.date}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
