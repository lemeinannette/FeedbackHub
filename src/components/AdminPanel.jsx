import { useState, useEffect } from "react";

export default function AdminPanel() {
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("feedbacks")) || [];
    setFeedbacks(stored);
  }, []);

  // Calculate report stats
  const calcAverage = (key) => {
    if (feedbacks.length === 0) return 0;
    const total = feedbacks.reduce((sum, fb) => sum + (fb[key] || 0), 0);
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

  // Export to CSV
  const exportToCSV = () => {
    if (feedbacks.length === 0) {
      alert("No feedback to export!");
      return;
    }

    const headers = Object.keys(feedbacks[0]).join(",");
    const rows = feedbacks.map((fb) =>
      Object.values(fb)
        .map((val) => `"${val}"`)
        .join(",")
    );
    const csvContent = [headers, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "feedback_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>

      {/* Report Section */}
      <h2>Reports Summary</h2>
      <p>Average Overall: {calcAverage("overall")}</p>
      <p>Average Food: {calcAverage("food")}</p>
      <p>Average Service: {calcAverage("service")}</p>
      <p>Average Ambience: {calcAverage("ambience")}</p>
      <p>Average Entertainment: {calcAverage("entertainment")}</p>
      <p>
        Recommendations → Yes: {recommendCount.yes}, No: {recommendCount.no}
      </p>

      <button onClick={exportToCSV}>📥 Export to CSV</button>

      <hr />

      {/* Feedback List */}
      <h2>All Feedbacks</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback submitted yet.</p>
      ) : (
        <ul>
          {feedbacks.map((fb, index) => (
            <li key={index}>
              <strong>{fb.guestName}</strong> ({fb.contact}) – {fb.event}
              <br />
              Overall: {fb.overall}, Food: {fb.food}, Service: {fb.service},
              Ambience: {fb.ambience}, Entertainment: {fb.entertainment}
              <br />
              Recommend: {fb.recommend}
              <br />
              Comment: {fb.comment}
              <br />
              Date: {fb.date}
              <hr />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
