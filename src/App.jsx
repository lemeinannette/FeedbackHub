import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import FeedbackForm from "./components/FeedbackForm";
import ThankYouScreen from "./components/ThankYouScreen";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("isAdminLoggedIn") === "true";
    setIsAdminLoggedIn(stored);
  }, []);

  return (
    <Router>
      <nav style={{ padding: "10px", background: "#eee" }}>
        <Link to="/" style={{ marginRight: "10px" }}>Feedback</Link>
        <Link to="/thank-you">Thank You</Link>
      </nav>

      <Routes>
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/thank-you" element={<ThankYouScreen />} />

        <Route
          path="/admin-login"
          element={
            isAdminLoggedIn ? (
              <Navigate to="/admin" />
            ) : (
              <AdminLogin setIsAdminLoggedIn={setIsAdminLoggedIn} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            isAdminLoggedIn ? (
              <AdminPanel setIsAdminLoggedIn={setIsAdminLoggedIn} />
            ) : (
              <Navigate to="/admin-login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}
