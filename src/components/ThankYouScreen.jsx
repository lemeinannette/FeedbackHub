import React from "react";
import { Link } from "react-router-dom";
import "./ThankYouScreen.css";

export default function ThankYouScreen() {
  return (
    <div className="thank-you">
      <div className="thank-you-content">
        <div className="success-icon">
          <i className="bx bx-check-circle"></i>
        </div>
        
        
        
        <h1>Thank You for Your Feedback!</h1>
        <p>Your response has been recorded successfully.</p>
        <Link to="/" className="back-button">
          Submit Another Feedback
        </Link>
      </div>
    </div>
  );
}