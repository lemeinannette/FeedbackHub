import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import FeedbackForm from "./components/FeedbackForm";
import ThankYouScreen from "./components/ThankYouScreen";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";
import "./App.css";

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("isAdminLoggedIn") === "true";
    setIsAdminLoggedIn(stored);
  }, []);

  return (
    <Router>
      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <i className="bx bx-comment-detail"></i>
            <span>Feedback Hub</span>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <i className="bx bx-message-square-edit"></i>
              <span>Feedback</span>
            </Link>
            <Link to="/thank-you" className="nav-link">
              <i className="bx bx-heart"></i>
              <span>Thank You</span>
            </Link>
            {/* Only show Admin link if logged in */}
            {isAdminLoggedIn && (
              <Link to="/admin" className="nav-link admin-link">
                <i className="bx bx-shield"></i>
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>
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