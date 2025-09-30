import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LogOut, FileDown, Trash2 } from "lucide-react";
import "./AdminPanel.css";

export default function AdminPanel({ setIsAdminLoggedIn }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  // ✅ Check admin session expiry on mount
  useEffect(() => {
    const expiresAt = parseInt(localStorage.getItem("adminExpires"), 10);
    if (!expiresAt || Date.now() > expiresAt) {
      // session expired
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("adminExpires");
      setIsAdminLoggedIn(false);
      navigate("/admin-login");
    }
  }, [navigate, setIsAdminLoggedIn]);

  // ✅ Load feedbacks from storage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("feedbacks")) || [];
    setFeedbacks(saved);
  }, []);

  // --- Calculations ---
  const totalSubmissions = feedbacks.length;
  const recommendCount = feedbacks.filter((f) => f.recommend === "Yes").length;
  const recommendRate = totalSubmissions
    ? ((recommendCount / totalSubmissions) * 100).toFixed(1)
    : 0;

  const average = (key) =>
    totalSubmissions
      ? (
          feedbacks.reduce((sum, f) => sum + Number(f[key] || 0), 0) /
          totalSubmissions
        ).toFixed(1)
      : 0;

  const averages = {
    food: average("food"),
    ambience: average("ambience"),
    service: average("service"),
    overall: average("overall"),
  };

  // --- Actions ---
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminExpires");
    setIsAdminLoggedIn(false);
    navigate("/");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[
        "Date", "Name/Group", "Email", "Contact", "Event",
        "Food", "Ambience", "Service", "Overall",
        "Recommend", "Comments"
      ]],
      body: feedbacks.map(f => [
        f.date,
        f.name,
        f.email,
        f.contact,
        f.event,
        f.food,
        f.ambience,
        f.service,
        f.overall,
        f.recommend || "No", // ✅ Show stored value exactly
        f.comments
      ]),
    });
    doc.save("feedbacks.pdf");
  };

  const handleDelete = (index) => {
    const updated = feedbacks.filter((_, i) => i !== index);
    setFeedbacks(updated);
    localStorage.setItem("feedbacks", JSON.stringify(updated));
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="header">
        <h1>Admin Dashboard</h1>
        <div className="header-buttons">
          <button onClick={handleLogout} className="button logout-btn">
            <LogOut size={16} /> Logout
          </button>
          <button onClick={handleExportPDF} className="button export-btn">
            <FileDown size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="top-section">
        <div className="card summary">
          <h2>Summary</h2>
          <p><strong>Total Feedback:</strong> {totalSubmissions}</p>
          <p><strong>Recommend (Yes):</strong> {recommendCount}</p>
          <p><strong>Recommendation Rate:</strong> {recommendRate}%</p>
        </div>
        <div className="card averages">
          <h2>Average Ratings</h2>
          <p>Food: {averages.food}</p>
          <p>Ambience: {averages.ambience}</p>
          <p>Service: {averages.service}</p>
          <p>Overall: {averages.overall}</p>
        </div>
        <div className="card activity">
          <h2>Recent Activity</h2>
          {feedbacks.slice(-3).reverse().map((f, i) => (
            <p key={i}>
              <strong>{f.name}</strong> left a {f.overall}-star review
              ({new Date(f.date).toLocaleTimeString()})
            </p>
          ))}
        </div>
      </div>

      {/* Feedback Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {[
                "Date", "Name/Group", "Email", "Contact", "Event",
                "Food", "Ambience", "Service", "Overall",
                "Recommend", "Comments", "Actions"
              ].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan="12" className="empty">No feedback available</td>
              </tr>
            ) : (
              feedbacks.map((f, index) => (
                <tr key={index} className={index % 2 === 0 ? "even" : "odd"}>
                  <td>{f.date}</td>
                  <td>{f.name}</td>
                  <td>{f.email}</td>
                  <td>{f.contact}</td>
                  <td>{f.event}</td>
                  <td>{f.food}</td>
                  <td>{f.ambience}</td>
                  <td>{f.service}</td>
                  <td>{f.overall}</td>
                  <td>{f.recommend || "No"}</td>
                  <td>{f.comments}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(index)}
                      title="Delete feedback"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
