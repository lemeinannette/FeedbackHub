import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminPanel({ setIsAdminLoggedIn }) {
  const [feedbacks, setFeedbacks] = useState([]);
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

  // Calculate summary
  const yesCount = feedbacks.filter((f) => f.recommend === "Yes").length;
  const noCount = feedbacks.filter((f) => f.recommend === "No").length;

  const avg = (arr) =>
    arr.length ? (arr.reduce((a, b) => a + Number(b || 0), 0) / arr.length).toFixed(1) : "N/A";

  const avgFood = avg(feedbacks.map((f) => f.foodRating));
  const avgAmbience = avg(feedbacks.map((f) => f.ambienceRating));
  const avgService = avg(feedbacks.map((f) => f.serviceRating));
  const avgOverall = avg(feedbacks.map((f) => f.overallRating));

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Feedback Report", 14, 16);

    // Summary
    doc.text(`Summary:`, 14, 26);
    doc.text(`Recommend: ${yesCount}`, 14, 34);
    doc.text(` Not Recommend: ${noCount}`, 14, 42);
    doc.text(`⭐ Avg Food: ${avgFood}`, 80, 34);
    doc.text(`⭐ Avg Ambience: ${avgAmbience}`, 80, 42);
    doc.text(`⭐ Avg Service: ${avgService}`, 140, 34);
    doc.text(`⭐ Avg Overall: ${avgOverall}`, 140, 42);

    const tableColumn = [
      "Date",
      "Name/Group",
      "Email",
      "Contact",
      "Event",
      "Food",
      "Ambience",
      "Service",
      "Overall",
      "Recommend",
      "Comments",
    ];

    const tableRows = feedbacks.map((f) => [
      f.date,
      f.guestType === "group" ? f.groupName : f.name,
      f.guestType === "group" ? f.groupEmail : f.email,
      f.guestType === "group" ? f.groupContact : f.contact,
      f.event,
      f.foodRating,
      f.ambienceRating,
      f.serviceRating,
      f.overallRating,
      f.recommend,
      f.comments,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
    });

    doc.save("feedback_report.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>
      <button onClick={handleLogout}> Logout</button>
      <button onClick={exportToPDF} style={{ marginLeft: "10px" }}>
        Export to PDF
      </button>

      {/* Summary */}
      {feedbacks.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Summary</h3>
          <p>Recommend: {yesCount} |  Not Recommend: {noCount}</p>
          <p>
            ⭐ Food: {avgFood} | ⭐ Ambience: {avgAmbience} | ⭐ Service: {avgService} | ⭐ Overall: {avgOverall}
          </p>
        </div>
      )}

      {/* Table */}
      {feedbacks.length === 0 ? (
        <p>No feedback available yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: "20px", width: "100%" }}>
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
            {feedbacks.map((f, idx) => (
              <tr key={idx}>
                <td>{f.date}</td>
                <td>{f.guestType === "group" ? f.groupName : f.name}</td>
                <td>{f.guestType === "group" ? f.groupEmail : f.email}</td>
                <td>{f.guestType === "group" ? f.groupContact : f.contact}</td>
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
