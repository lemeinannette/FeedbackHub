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
      <button onClick={handleLogout} style={{ marginBottom: "20px" }}>
        Logout
      </button>

      {/* Summary Section */}
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

      {/* Feedback Table */}
      <h2>All Feedbacks</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback available yet.</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr style={{ background: "#f2f2f2" }}>
              <th>Type</th>
              <th>Name / Group</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Event</th>
              <th>Food Rating</th>
              <th>Service Rating</th>
              <th>Ambience Rating</th>
              <th>Comments</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {feedbacks.map((fb, index) => (
              <tr key={index}>
                <td>{fb.type || "Individual"}</td>
                <td>{fb.name}</td>
                <td>{fb.email || "-"}</td>
                <td>{fb.contact || "-"}</td>
                <td>{fb.event}</td>
                <td>{fb.foodRating}</td>
                <td>{fb.serviceRating}</td>
                <td>{fb.ambienceRating}</td>
                <td>{fb.comments}</td>
                <td>{fb.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
