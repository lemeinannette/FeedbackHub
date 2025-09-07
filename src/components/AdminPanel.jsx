import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function AdminPanel() {
  const [feedbacks, setFeedbacks] = useState([]);

  // Load feedbacks from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("feedbacks")) || [];
    console.log("Loaded feedbacks:", stored); // debug
    setFeedbacks(stored);
  }, []);

  // Function to calculate average rating
  const calcAverage = (key) => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, fb) => sum + (Number(fb[key]) || 0), 0);
    return (total / feedbacks.length).toFixed(1);
  };

  // Count recommendations
  const recommendCount = feedbacks.reduce(
    (acc, fb) => {
      if (fb.recommend === "yes") acc.yes++;
      if (fb.recommend === "no") acc.no++;
      return acc;
    },
    { yes: 0, no: 0 }
  );

  // ✅ Export to PDF
  const exportToPDF = () => {
    console.log("Exporting PDF...");

    if (feedbacks.length === 0) {
      alert("No feedback to export!");
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("Feedback Report", 14, 20);

    // Summary
    doc.setFontSize(12);
    doc.text("Summary:", 14, 30);
    doc.text(`Average Overall: ${calcAverage("overall")}`, 14, 38);
    doc.text(`Average Food: ${calcAverage("food")}`, 14, 44);
    doc.text(`Average Service: ${calcAverage("service")}`, 14, 50);
    doc.text(`Average Ambience: ${calcAverage("ambience")}`, 14, 56);
    doc.text(`Average Entertainment: ${calcAverage("entertainment")}`, 14, 62);
    doc.text(
      `Recommendations → Yes: ${recommendCount.yes}, No: ${recommendCount.no}`,
      14,
      70
    );

    // Table with feedbacks
    const tableData = feedbacks.map((fb) => [
      fb.guestName,
      fb.contact,
      fb.event,
      fb.overall,
      fb.food,
      fb.service,
      fb.ambience,
      fb.entertainment,
      fb.recommend,
      fb.comment,
      fb.date,
    ]);

    autoTable(doc, {
      head: [
        [
          "Name",
          "Contact",
          "Event",
          "Overall",
          "Food",
          "Service",
          "Ambience",
          "Entertainment",
          "Recommend",
          "Comment",
          "Date",
        ],
      ],
      body: tableData,
      startY: 80,
      styles: { fontSize: 8 },
    });

    // Save PDF
    doc.save("feedback_report.pdf");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <h2>Reports Summary</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        <div>
          <p>Average Overall: {calcAverage("overall")}</p>
          <p>Average Food: {calcAverage("food")}</p>
          <p>Average Service: {calcAverage("service")}</p>
          <p>Average Ambience: {calcAverage("ambience")}</p>
          <p>Average Entertainment: {calcAverage("entertainment")}</p>
          <p>
            Recommendations → Yes: {recommendCount.yes}, No: {recommendCount.no}
          </p>

          {/* ✅ Export button */}
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
        </div>
      )}
    </div>
  );
}
