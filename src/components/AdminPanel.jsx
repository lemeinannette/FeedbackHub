import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { LogOut, FileDown } from "lucide-react";
import "./AdminPanel.css"; // 👈 keep this

export default function AdminPanel({ setIsAdminLoggedIn }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("feedbacks")) || [];
    setFeedbacks(saved);
  }, []);

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    navigate("/");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Date", "Name/Group", "Email", "Contact", "Event", "Food", "Ambience", "Service", "Overall", "Recommend", "Comments"]],
      body: feedbacks.map(f => [
        f.date, f.name, f.email, f.contact, f.event,
        f.food, f.ambience, f.service, f.overall,
        f.recommend ? "Yes" : "No", f.comments
      ]),
    });
    doc.save("feedbacks.pdf");
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

      {/* Top Section */}
      <div className="top-section">
        <div className="card summary">
          <h2>Summary</h2>
          <p>Recommend: {feedbacks.filter(f => f.recommend).length}</p>
          <p>Not Recommend: {feedbacks.filter(f => !f.recommend).length}</p>
        </div>
        <div className="card search">
          <input type="text" placeholder="Search by name, email or event..." />
        </div>
      </div>

      {/* Feedback Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {["Date", "Name/Group", "Email", "Contact", "Event", "Food", "Ambience", "Service", "Overall", "Recommend", "Comments"].map((header) => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feedbacks.length === 0 ? (
              <tr>
                <td colSpan="11" className="empty">No feedback available</td>
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
                  <td>{f.recommend ? "Yes" : "No"}</td>
                  <td>{f.comments}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
// ...existing code...