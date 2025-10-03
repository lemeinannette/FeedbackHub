import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./AdminLogin.css";

export default function AdminLogin({ setIsAdminLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
    const expiresAt = parseInt(localStorage.getItem("adminExpires"), 10);
    
    if (isLoggedIn && expiresAt && Date.now() < expiresAt) {
      setIsAdminLoggedIn(true);
      navigate("/admin");
    }
  }, [navigate, setIsAdminLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Hardcoded credentials
    if (username === "admin" && password === "1234") {
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour session
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("adminExpires", expiresAt.toString());
      setIsAdminLoggedIn(true);
      navigate("/admin");
    } else {
      setError("Invalid username or password. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="login-header">
          <div className="login-icon">
            <i className="bx bx-lock-alt"></i>
          </div>
          <h2>Admin Login</h2>
          <p>Enter your credentials to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <i className="bx bx-error-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-container">
              <i className="bx bx-user input-icon"></i>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <i className="bx bx-lock input-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`bx ${showPassword ? "bx-hide" : "bx-show"}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="bx bx-loader-alt bx-spin"></i>
                Authenticating...
              </>
            ) : (
              <>
                <i className="bx bx-log-in-circle"></i>
                Login
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>For demo purposes, use: admin / 1234</p>
        </div>
      </div>
    </div>
  );
}