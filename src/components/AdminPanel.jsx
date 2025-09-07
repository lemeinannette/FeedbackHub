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
    navigate("/admin-login");
  };

  const calcAverage = (key) => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, fb) => sum + (Number(fb[key]) || 0), 0);
    return (total / feedbacks.length).toFixed(1);
  };

  const recommendCount = feedbacks.reduce(
    (acc, fb) => {
      if (fb.recommend === "yes") acc.yes++;
      if (fb.recommend === "no") acc.no++;
      return acc;
    },
    { yes: 0, no: 0 }
  );

  const exportToPDF = () => {
    if (feedbacks.length === 0) {
      alert("No feedback to export!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Feedback Report", 14, 20);

    doc.setFontSize(12);
    doc.text("Summary:", 14, 30);
    doc.text(`Average Overall: ${calcAverage("overall")}`, 14, 38);
    doc.text(`Recommendations → Yes: ${recommendCount.yes}, No: ${recommendCount.no}`, 14, 44);

    const tableData = feedbacks.map((fb) => [
      fb.guestName,
      fb.contact,
      fb.event,
      fb.overall,
      fb.comment,
      fb.date,
    ]);

    autoTable(doc, {
      head: [["Name", "Contact", "Event", "Overall", "Comment", "Date"]],
      body: tableData,
      startY: 60,
      styles: { fontSize: 8 },
    });

    doc.save("feedback_report.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <button onClick={handleLogout} style={{ marginBottom: "20px", padding: "8px", background: "red", color: "white", border: "none", borderRadius: "4px" }}>
        🚪 Logout
      </button>

      {feedbacks.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        <>
          <h2>Reports Summary</h2>
          <p>Average Overall: {calcAverage("overall")}</p>
          <p>Recommendations → Yes: {recommendCount.yes}, No: {recommendCount.no}</p>

          <button
            onClick={exportToPDF}
            style={{
              marginTop: "10px",
              padding: "10px 15px",
              backgroundColor: "blue",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            📄 Export to PDF
          </button>
        </>
      )}
    </div>
  );
}
