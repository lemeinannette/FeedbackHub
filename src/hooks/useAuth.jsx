import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(() => {
    try {
      setIsLoading(true);
      const adminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";
      const expiresAt = parseInt(localStorage.getItem("adminExpires"), 10);
      
      if (adminLoggedIn && expiresAt && Date.now() < expiresAt) {
        setIsAuthenticated(true);
        setUser({ role: 'admin' });
      } else {
        logout();
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setError(error.message);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((credentials, expiresIn = 3600000) => { // Default 1 hour
    try {
      setIsLoading(true);
      setError(null);
      
      // For demo, accept any non-empty credentials
      if (credentials.username && credentials.password) {
        const expiresAt = Date.now() + expiresIn;
        
        localStorage.setItem("isAdminLoggedIn", "true");
        localStorage.setItem("adminExpires", expiresAt.toString());
        
        setIsAuthenticated(true);
        setUser({ role: 'admin', username: credentials.username });
        
        return { success: true };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("adminExpires");
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      navigate('/admin-login');
    } catch (error) {
      console.error("Error during logout:", error);
      setError(error.message);
    }
  }, [navigate]);

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    login,
    logout,
    checkAuthStatus
  };
};