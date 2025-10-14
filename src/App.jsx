// src/App.jsx (UPDATED WITH MODERN TEAL DESIGN)

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";

// Import only the main App CSS. It will import global.css automatically.
import "./App.css"; 

// Import your page components
import FeedbackForm from "./components/feedback/FeedbackForm";
import ThankYouScreen from "./components/feedback/ThankYouScreen";
import AdminPanel from "./components/admin/AdminPanel";
import AdminLogin from "./components/auth/AdminLogin";
import Notification from "./components/common/Notification";

export default function App() {
  const location = useLocation();

  // --- State Management ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [notification, setNotification] = useState(null);

  // --- Theme State (Global for the whole app) ---
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("darkMode");
    return savedTheme ? JSON.parse(savedTheme) : false;
  });
  
  // --- Effects for localStorage and theme application ---
  useEffect(() => { 
    localStorage.setItem("darkMode", JSON.stringify(darkMode)); 
  }, [darkMode]);
  
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
  }, [darkMode]);

  // --- Authentication Effect ---
  useEffect(() => {
    checkAuthStatus();
    
    // Listen for feedback updates
    const handleFeedbackUpdate = () => {
      const storedFeedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
      setFeedbacks(storedFeedbacks);
    };
    
    window.addEventListener('feedbackUpdated', handleFeedbackUpdate);
    
    // Initial load of feedbacks
    handleFeedbackUpdate();
    
    return () => {
      window.removeEventListener('feedbackUpdated', handleFeedbackUpdate);
    };
  }, []);

  // --- Functions ---
  const updateFeedbacks = (newFeedbacks) => setFeedbacks(newFeedbacks);
  const toggleTheme = () => setDarkMode(prev => !prev);
  
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const checkAuthStatus = () => {
    try {
      const authData = JSON.parse(localStorage.getItem("auth"));
      if (authData && authData.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(authData.user);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = (credentials) => {
    // Simple authentication logic (in a real app, this would be an API call)
    if (credentials.username === "admin" && credentials.password === "password") {
      const authData = {
        isAuthenticated: true,
        user: { username: credentials.username, role: "admin" }
      };
      
      localStorage.setItem("auth", JSON.stringify(authData));
      setIsAuthenticated(true);
      setUser(authData.user);
      showNotification("Login successful!", "success");
      return true;
    } else {
      showNotification("Invalid credentials. Please try again.", "error");
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setIsAuthenticated(false);
    setUser(null);
    showNotification("You have been logged out.", "info");
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <nav className="app-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <div className="nav-logo-container">
              <div className="nav-logo">
                <span className="logo-text">FH</span>
              </div>
            </div>
            <span>Feedback Hub</span>
          </div>
          
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/feedback" className="nav-link">Feedback</Link>
            
            {isAuthenticated && (
              <Link to="/admin" className="nav-link">
                <i className="bx bx-shield"></i>
                <span>Admin</span>
              </Link>
            )}
            
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn" 
              aria-label="Toggle theme"
            >
              {darkMode ? <i className='bx bx-sun'></i> : <i className='bx bx-moon'></i>}
            </button>
          </div>
        </div>
      </nav>

      <main className="app-main">
        <Routes>
          <Route 
            path="/" 
            element={
              <div className="home-container">
                <div className="hero-section">
                  <div className="hero-content">
                    <h1 className="hero-title">Welcome to Feedback Hub</h1>
                    <p className="hero-subtitle">Your opinion matters! Share your experience with us and help us improve our services.</p>
                    <div className="hero-actions">
                      <Link to="/feedback" className="btn btn-primary">
                        <i className="bx bx-edit"></i>
                        Leave Feedback
                      </Link>
                      {isAuthenticated ? (
                        <Link to="/admin" className="btn btn-secondary">
                          <i className="bx bx-shield"></i>
                          Admin Panel
                        </Link>
                      ) : (
                        <Link to="/admin-login" className="btn btn-outline">
                          <i className="bx bx-lock"></i>
                          Admin Login
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="hero-image">
                    <div className="hero-image-placeholder">
                      <i className="bx bx-message-square-detail"></i>
                    </div>
                  </div>
                </div>
                
                <div className="features-section">
                  <h2>Why Your Feedback Matters</h2>
                  <div className="features-grid">
                    <div className="feature-card">
                      <div className="feature-icon">
                        <i className="bx bx-star"></i>
                      </div>
                      <h3>Improve Our Services</h3>
                      <p>Your feedback helps us understand what we're doing right and where we can improve.</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">
                        <i className="bx bx-heart"></i>
                      </div>
                      <h3>Customer Satisfaction</h3>
                      <p>We value your opinion and strive to provide the best experience possible.</p>
                    </div>
                    <div className="feature-card">
                      <div className="feature-icon">
                        <i className="bx bx-chat"></i>
                      </div>
                      <h3>Open Communication</h3>
                      <p>Feedback creates a dialogue between us and our valued customers.</p>
                    </div>
                  </div>
                </div>
                
                <div className="stats-section">
                  <div className="stat-item">
                    <div className="stat-number">{feedbacks.length}</div>
                    <div className="stat-label">Feedbacks Received</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">4.8</div>
                    <div className="stat-label">Average Rating</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">98%</div>
                    <div className="stat-label">Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/feedback" 
            element={
              <FeedbackForm 
                darkMode={darkMode}
                toggleTheme={toggleTheme}
              />
            } 
          />
          
          <Route 
            path="/thank-you" 
            element={<ThankYouScreen darkMode={darkMode} />} 
          />
          
          <Route 
            path="/admin-login" 
            element={
              isAuthenticated ? 
              <Navigate to="/admin" /> : 
              <AdminLogin 
                onLoginSuccess={handleLogin} 
                darkMode={darkMode}
              />
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              isAuthenticated ? 
              <AdminPanel 
                onLogout={handleLogout} 
                feedbacks={feedbacks} 
                updateFeedbacks={updateFeedbacks}
                darkMode={darkMode}
              /> : 
              <Navigate to="/admin-login" />
            } 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}