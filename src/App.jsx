import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import FeedbackForm from "./components/FeedbackForm";
import ThankYouScreen from "./components/ThankYouScreen";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";

export default function App() {
  const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true";

  return (
    <Router>
      <Routes>
        {/* Guest feedback routes */}
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/thank-you" element={<ThankYouScreen />} />

        {/* Admin routes */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={isAdminLoggedIn ? <AdminPanel /> : <Navigate to="/admin-login" />}
        />

        {/* Fallback (if no route matches) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
