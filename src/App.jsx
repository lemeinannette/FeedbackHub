import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
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
      <nav style={{ padding: "10px", background: "#f8f9fa", borderBottom: "1px solid #ddd" }}>
        <Link to="/" style={{ marginRight: "10px" }}>Feedback</Link>
        <Link to="/thank-you">Thank You</Link>
        {/* Only show Admin link if logged in */}
        {isAdminLoggedIn && (
          <Link to="/admin" style={{ marginLeft: "10px" }}>Admin</Link>
        )}
      </nav>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/thank-you" element={<ThankYouScreen />} />

        {/* Admin Routes */}
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

        {/* Catch-all → send back to Feedback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
