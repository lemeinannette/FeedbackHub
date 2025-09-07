import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    console.log("👉 Entered username:", username);
    console.log("👉 Entered password:", password);

    if (username.trim() === "admin" && password.trim() === "1234") {
      localStorage.setItem("isAdminLoggedIn", "true");
      console.log("✅ Login successful, redirecting to /admin...");
      navigate("/admin");
    } else {
      console.log("❌ Login failed. Expected admin / 1234");
      setError("Invalid username or password");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter admin"
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter 1234"
            required
          />
        </div>
        <button type="submit" style={{ marginTop: "10px" }}>
          Login
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
}
