// src/App.jsx

import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { useLocalStorage } from "./hooks/useLocalStorage";
import FeedbackForm from "./components/feedback/FeedbackForm";
import ThankYouScreen from "./components/feedback/ThankYouScreen";
import AdminPanel from "./components/admin/AdminPanel";
import AdminLogin from "./components/auth/AdminLogin";
import Notification from "./components/common/Notification";
import "./App.css";

export default function App() {
  // Use custom hooks for authentication and theme management
  const { isAuthenticated, user, isLoading: authLoading, login, logout } = useAuth();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  
  // Use localStorage for tracking previous route
  const [previousRoute, setPreviousRoute] = useLocalStorage("previousRoute", "/");
  
  // Separate theme states for admin and client
  const [adminDarkMode, setAdminDarkMode] = useLocalStorage("adminTheme", false);
  const [clientDarkMode, setClientDarkMode] = useLocalStorage("clientTheme", false);
  
  // Theme toggle functions
  const toggleClientTheme = () => {
    setClientDarkMode(prevMode => !prevMode);
  };
  
  const toggleAdminTheme = () => {
    setAdminDarkMode(prevMode => !prevMode);
  };

  // Apply theme classes to body
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  // Loading state while checking authentication
  if (authLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        <p>Loading Feedback Hub...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className={`app-container ${isDarkMode ? 'dark-mode' : ''}`}>
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
              {isAuthenticated && (
                <Link to="/admin" className="nav-link admin-link">
                  <i className="bx bx-shield"></i>
                  <span>Admin</span>
                </Link>
              )}
            </div>
          </div>
        </nav>

        <main className="app-main">
          <Routes>
            <Route 
              path="/" 
              element={
                <FeedbackForm 
                  previousRoute={previousRoute} 
                  setPreviousRoute={setPreviousRoute}
                  clientDarkMode={clientDarkMode}
                  toggleClientTheme={toggleClientTheme}
                />
              } 
            />
            <Route 
              path="/thank-you" 
              element={
                <ThankYouScreen 
                  previousRoute={previousRoute} 
                  setPreviousRoute={setPreviousRoute}
                />
              } 
            />
            <Route
              path="/admin-login"
              element={
                isAuthenticated ? (
                  <Navigate to="/admin" />
                ) : (
                  <AdminLogin 
                    setIsAdminLoggedIn={login} 
                    previousRoute={previousRoute} 
                    setPreviousRoute={setPreviousRoute}
                  />
                )
              }
            />
            <Route
              path="/admin"
              element={
                isAuthenticated ? (
                  <AdminPanel 
                    setIsAdminLoggedIn={logout} 
                    previousRoute={previousRoute} 
                    setPreviousRoute={setPreviousRoute}
                    adminDarkMode={adminDarkMode}
                    toggleAdminTheme={toggleAdminTheme}
                  />
                ) : (
                  <Navigate to="/admin-login" />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}