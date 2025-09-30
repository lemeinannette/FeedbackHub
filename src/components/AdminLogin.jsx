import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin({ setIsAdminLoggedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Hardcoded credentials
    if (username === "admin" && password === "1234") {
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour session
      localStorage.setItem("isAdminLoggedIn", "true");
      localStorage.setItem("adminExpires", expiresAt.toString());
      setIsAdminLoggedIn(true);
      navigate("/admin");
    } else {
      alert("Invalid login details");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "400px",
        margin: "80px auto",
        border: "1px solid #ddd",
        borderRadius: "12px",
        background: "#f9f9f9",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Admin Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "12px",
            width: "100%",
            background: "#3cd8c9",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}
