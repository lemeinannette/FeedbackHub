import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminPanel.css";

export default function AdminPanel({ setIsAdminLoggedIn }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("feedbacks")) || [];
    setFeedbacks(saved);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    setIsAdminLoggedIn(false);
    navigate("/admin-login");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Feedback Report", 14, 16);

    autoTable(doc, {
      head: [["Date", "Name", "Email", "Contact", "Event", "Food", "Ambience", "Service", "Overall", "Recommend", "Comments"]],
      body: feedbacks.map((f) => [
        f.date,
        f.type === "Group" ? f.group : f.name,
        f.type === "Group" ? f.groupEmail : f.email,
        f.type === "Group" ? f.groupContact : f.contact,
        f.event,
        f.foodRating,
        f.ambienceRating,
        f.serviceRating,
        f.overallRating,
        f.recommend,
        f.comments,
      ]),
      startY: 20,
    });

    doc.save("feedback_report.pdf");
  };

  const filteredFeedbacks = feedbacks.filter(
    (f) =>
      f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.group?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.groupEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.event?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <div>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
          <button className="btn-export" onClick={exportToPDF}>
            Export PDF
          </button>
        </div>
      </div>

      <input
        type="text"
        placeholder=" Search by name, email or event..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-box"
      />

      {filteredFeedbacks.length === 0 ? (
        <p className="no-data">No feedback found.</p>
      ) : (
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name/Group</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Event</th>
              <th>Food</th>
              <th>Ambience</th>
              <th>Service</th>
              <th>Overall</th>
              <th>Recommend</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {filteredFeedbacks.map((f, idx) => (
              <tr key={idx}>
                <td>{f.date}</td>
                <td>{f.type === "Group" ? f.group : f.name}</td>
                <td>{f.type === "Group" ? f.groupEmail : f.email}</td>
                <td>{f.type === "Group" ? f.groupContact : f.contact}</td>
                <td>{f.event}</td>
                <td>{f.foodRating}</td>
                <td>{f.ambienceRating}</td>
                <td>{f.serviceRating}</td>
                <td>{f.overallRating}</td>
                <td>{f.recommend}</td>
                <td>{f.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
