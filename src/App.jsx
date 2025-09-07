import { Routes, Route, Link } from "react-router-dom";
import FeedbackForm from "./components/FeedbackForm";
import ThankYouScreen from "./components/ThankYouScreen";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Feedback</Link> |{" "}
        <Link to="/thankyou">Thank You</Link> |{" "}
        <Link to="/admin">Admin</Link>
      </nav>

      <Routes>
        <Route path="/" element={<FeedbackForm />} />
        <Route path="/thankyou" element={<ThankYouScreen />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}
