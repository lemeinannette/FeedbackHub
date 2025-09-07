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
        {/* Guests see only Feedback + Thank You */}
        <Link to="/" style={{ marginRight: "10px" }}>Feedback</Link>
        <Link to="/thank-you">Thank You</Link>
      </nav>

      <Routes>
        {/* Public routes */}
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
