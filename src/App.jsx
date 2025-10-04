import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import FeedbackForm from "./components/FeedbackForm";
import ThankYouScreen from "./components/ThankYouScreen";
import Settings from "./components/Settings";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";
import "./App.css";

export default function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [previousRoute, setPreviousRoute] = useState("/");

  useEffect(() => {
    const stored = localStorage.getItem("isAdminLoggedIn") === "true";
    setIsAdminLoggedIn(stored);
    
    // Check for user preference first, then default theme
    const userPreference = localStorage.getItem("darkMode");
    const defaultTheme = localStorage.getItem("defaultTheme") || 'light';
    
    const shouldBeDark = userPreference 
      ? userPreference === "true" 
      : defaultTheme === 'dark';
    
    setDarkMode(shouldBeDark);
    
    // Apply both classes to ensure compatibility
    if (shouldBeDark) {
      document.body.classList.add('dark-mode', 'dark');
    } else {
      document.body.classList.remove('dark-mode', 'dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode);
    
    // Apply both classes to ensure compatibility
    if (newDarkMode) {
      document.body.classList.add('dark-mode', 'dark');
    } else {
      document.body.classList.remove('dark-mode', 'dark');
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
        <Route path="/" element={<FeedbackForm previousRoute={previousRoute} setPreviousRoute={setPreviousRoute} />} />
        <Route path="/thank-you" element={<ThankYouScreen previousRoute={previousRoute} setPreviousRoute={setPreviousRoute} />} />
        <Route path="/settings" element={<Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} />} />
        <Route
          path="/admin-login"
          element={
            isAdminLoggedIn ? (
              <Navigate to="/admin" />
            ) : (
              <AdminLogin setIsAdminLoggedIn={setIsAdminLoggedIn} previousRoute={previousRoute} setPreviousRoute={setPreviousRoute} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            isAdminLoggedIn ? (
              <AdminPanel setIsAdminLoggedIn={setIsAdminLoggedIn} previousRoute={previousRoute} setPreviousRoute={setPreviousRoute} />
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