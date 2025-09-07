import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import FeedbackForm from "./components/FeedbackForm";
import ThankYouScreen from "./components/ThankYouScreen";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";

export default function App() {
  const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  return (
    <Router>
      <nav style={{ padding: "10px", background: "#eee" }}>
        <Link to="/" style={{ marginRight: "10px" }}>Feedback</Link>
        <Link to="/thank-you" style={{ marginRight: "10px" }}>Thank You</Link>
        <Link to="/admin-login" style={{ marginRight: "10px" }}>Admin Login</Link>
        <Link to="/admin">Admin Panel</Link>
      </nav>

      <Routes>
        {/* Guest routes */}
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/thank-you" element={<ThankYouScreen />} />

        {/* Admin routes */}
        <Route
          path="/admin-login"
          element={isAdminLoggedIn ? <Navigate to="/admin" /> : <AdminLogin />}
        />
        <Route
          path="/admin"
          element={isAdminLoggedIn ? <AdminPanel /> : <Navigate to="/admin-login" />}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
