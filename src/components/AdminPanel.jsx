import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminPanel() {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("feedbacks")) || [];
    setFeedbacks(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/admin-login"); // ✅ back to login page
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
        🚪 Logout
      </button>

      {/* rest of your summary + export */}
    </div>
  );
}
