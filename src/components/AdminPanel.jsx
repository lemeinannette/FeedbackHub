import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("feedbacks")) || [];
    setFeedbacks(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn"); // remove access
    navigate("/admin-login"); // kick out to login page
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>
      <button
        onClick={handleLogout}
        style={{
          marginBottom: "20px",
          padding: "8px",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
         Logout
      </button>

      {feedbacks.length === 0 ? (
        <p>No feedback yet.</p>
      ) : (
        <p>{feedbacks.length} feedback entries loaded </p>
      )}
    </div>
  );
}
