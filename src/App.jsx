import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import FeedbackForm from "./components/FeedbackForm";
import ThankYouScreen from "./components/ThankYouScreen";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";
import Settings from "./components/Settings"; // New import
import "./App.css";

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Check for saved dark mode preference
  useEffect(() => {
    const stored = localStorage.getItem("isAdminLoggedIn") === "true";
    setIsAdminLoggedIn(stored);
    
    const darkModePreference = localStorage.getItem("darkMode") === "true";
    setDarkMode(darkModePreference);
    
    // Apply dark mode class to body
    if (darkModePreference) {
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    
    // Apply or remove dark mode class
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  return (
    <Router>
      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <img 
              src="https://ui-avatars.com/api/?name=FH&background=2bb7a9&color=fff&size=56&font-size=0.9&bold=true&rounded=true" 
              alt="Feedback Hub" 
              className="nav-logo" 
            />
            <span>Feedback Hub</span>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              <i className="bx bx-message-square-edit"></i>
              <span>Feedback</span>
            </Link>
            <Link to="/settings" className="nav-link">
              <i className="bx bx-cog"></i>
              <span>Settings</span>
            </Link>
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
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/thank-you" element={<ThankYouScreen />} />
        <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}