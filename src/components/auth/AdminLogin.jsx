// src/components/auth/AdminLogin.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess, darkMode }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.username || !credentials.password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the login function passed from App.jsx
      const success = onLoginSuccess(credentials);
      
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`admin-login-container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-logo">
            <i className="bx bx-shield"></i>
          </div>
          <h1>Admin Login</h1>
          <p>Enter your credentials to access the admin panel</p>
        </div>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="error-message">
              <i className="bx bx-error-circle"></i>
              <span>{error}</span>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <div className="input-group">
              <i className="bx bx-user"></i>
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Enter your username"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <i className="bx bx-lock-alt"></i>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <i className="bx bx-log-in"></i>
                <span>Login</span>
              </>
            )}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p>
            <Link to="/" className="back-link">
              <i className="bx bx-arrow-back"></i>
              Back to Home
            </Link>
          </p>
          <p className="demo-hint">
            Demo: username: <strong>admin</strong>, password: <strong>password</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;