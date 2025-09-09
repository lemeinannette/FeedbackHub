import { useState } from "react";
import { useNavigate } from "react-router-dom";
import StarRating from "./StarRating";
import EventDropdown from "./EventDropDown";

export default function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState(""); // "individual" or "group"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    group: "",
    groupEmail: "",
    groupContact: "",
    comments: "",
    foodRating: 0,
    serviceRating: 0,
    ambienceRating: 0,
    overallRating: 0,
    event: "",
    otherEvent: "",
    recommend: "", // added
  });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!feedbackType) {
      alert("Please select whether you are an Individual or a Group.");
      return;
    }

    const finalData = {
      ...formData,
      event:
        formData.event === "Other"
          ? `Other: ${formData.otherEvent}`
          : formData.event,
      // Save either individual or group details
      name: feedbackType === "group" ? formData.group : formData.name,
      email: feedbackType === "group" ? formData.groupEmail : formData.email,
      contact:
        feedbackType === "group" ? formData.groupContact : formData.contact,
      type: feedbackType === "group" ? "Group" : "Individual",
      date: new Date().toLocaleString(),
    };

    // Save feedbacks in localStorage
    const existing = JSON.parse(localStorage.getItem("feedbacks")) || [];
    existing.push(finalData);
    localStorage.setItem("feedbacks", JSON.stringify(existing));

    console.log("Form submitted:", finalData);

    // Redirect to Thank You page
    navigate("/thank-you");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Feedback Form</h1>

      {/* Select feedback type */}
      <div style={{ marginBottom: "10px" }}>
        <label>
          <strong>Are you giving feedback as: </strong>
        </label>
        <select
          value={feedbackType}
          onChange={(e) => setFeedbackType(e.target.value)}
          required
        >
          <option value="">-- Select --</option>
          <option value="individual">Individual</option>
          <option value="group">Group / Organization / Association</option>
        </select>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Show fields based on selection */}
        {feedbackType === "individual" && (
          <>
            <div>
              <label>Name: </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Email: </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Contact: </label>
              <input
                type="tel"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                required
              />
            </div>
          </>
        )}

        {feedbackType === "group" && (
          <>
            <div>
              <label>Group / Organization Name: </label>
              <input
                type="text"
                value={formData.group}
                onChange={(e) =>
                  setFormData({ ...formData, group: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Group Email: </label>
              <input
                type="email"
                value={formData.groupEmail}
                onChange={(e) =>
                  setFormData({ ...formData, groupEmail: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label>Group Contact: </label>
              <input
                type="tel"
                value={formData.groupContact}
                onChange={(e) =>
                  setFormData({ ...formData, groupContact: e.target.value })
                }
                required
              />
            </div>
          </>
        )}

        {/* Event Dropdown */}
        <EventDropdown
          value={formData.event}
          otherEvent={formData.otherEvent}
          onChange={(data) => setFormData({ ...formData, ...data })}
        />

        {/* Ratings */}
        <StarRating
          label="Food"
          value={formData.foodRating}
          onChange={(val) => setFormData({ ...formData, foodRating: val })}
        />
        <StarRating
          label="Ambience"
          value={formData.ambienceRating}
          onChange={(val) =>
            setFormData({ ...formData, ambienceRating: val })
          }
        />
        <StarRating
          label="Service"
          value={formData.serviceRating}
          onChange={(val) => setFormData({ ...formData, serviceRating: val })}
        />
        <StarRating
          label="Overall Experience"
          value={formData.overallRating}
          onChange={(val) =>
            setFormData({ ...formData, overallRating: val })
          }
        />

        {/* Would you recommend us? */}
        <div style={{ marginTop: "10px" }}>
          <label>
            <strong>Would you recommend us?</strong>
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="recommend"
                value="Yes"
                checked={formData.recommend === "Yes"}
                onChange={(e) =>
                  setFormData({ ...formData, recommend: e.target.value })
                }
              />
              Yes
            </label>
            <label style={{ marginLeft: "15px" }}>
              <input
                type="radio"
                name="recommend"
                value="No"
                checked={formData.recommend === "No"}
                onChange={(e) =>
                  setFormData({ ...formData, recommend: e.target.value })
                }
              />
              No
            </label>
          </div>
        </div>

        {/* Comments */}
        <div>
          <label>Comments: </label>
          <textarea
            value={formData.comments}
            onChange={(e) =>
              setFormData({ ...formData, comments: e.target.value })
            }
          />
        </div>

        {/* Submit */}
        <button type="submit" style={{ marginTop: "10px" }}>
          Submit Feedback
        </button>
      </form>
    </div>
  );
}
