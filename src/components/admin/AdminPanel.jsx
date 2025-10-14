// src/components/admin/AdminPanel.jsx (UPDATED WITH MODERN DESIGN)

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Notification from "../common/Notification";
import AdminHeader from "./AdminHeader";
import AdminFilters from "./AdminFilters";
import PerformanceInsights from "./PerformanceInsights";
import AdminCharts from "./AdminCharts";
import FeedbackTable from "./FeedbackTable";
import Pagination from "./Pagination";
import "./AdminPanel.css";

function AdminPanel({ 
  // --- Authentication & Theme Props ---
  onLogout,
  adminDarkMode,
  toggleAdminTheme,

  // --- Data & State Management Props (from App.jsx) ---
  feedbacks, // This prop might be undefined initially
  updateFeedbacks
}) {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  // --- Local State for UI Management ---
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  
  // --- State for Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  const handleDelete = (feedbackToDelete) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      const updatedFeedbacks = feedbacks.filter(fb => fb.id !== feedbackToDelete.id);
      updateFeedbacks(updatedFeedbacks);
      showNotification("Feedback deleted successfully", "success");
    }
  };

  const handleArchive = (feedbackToArchive) => {
    const updatedFeedbacks = feedbacks.map(fb => {
      if (fb.id === feedbackToArchive.id) {
        return { ...fb, archived: !fb.archived };
      }
      return fb;
    });
    updateFeedbacks(updatedFeedbacks);
    showNotification(
      `Feedback ${!feedbackToArchive.archived ? 'archived' : 'unarchived'} successfully`, 
      "success"
    );
  };

  // --- FIX: Add a guard clause to the filtering logic ---
  const filteredFeedbacks = useMemo(() => {
    // If feedbacks is not an array, return an empty array to prevent errors
    if (!Array.isArray(feedbacks)) {
      return [];
    }

    let result = feedbacks;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(fb => 
        fb.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by archived status
    if (!showArchived) {
      result = result.filter(fb => !fb.archived);
    }

    // TODO: Add logic for timeFilter and custom dates here if needed

    return result;
  }, [feedbacks, searchTerm, showArchived, timeFilter, customStartDate, customEndDate]);

  // --- Pagination Logic ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className={`admin-container ${adminDarkMode ? 'dark-mode' : ''}`}>
      {notification && (
        <Notification notification={notification} setNotification={setNotification} />
      )}
      
      <AdminHeader 
        adminDarkMode={adminDarkMode}
        toggleAdminTheme={toggleAdminTheme}
        handleLogout={() => {
          onLogout();
          navigate("/admin-login");
        }}
        handleExportPDF={() => {
          showNotification("PDF export feature coming soon!", "info");
        }}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
      />
      
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            <span className="title-icon">📊</span>
            Admin Dashboard
          </h1>
          <p className="dashboard-subtitle">
            Monitor and analyze customer feedback to improve your services
          </p>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <span>💬</span>
            </div>
            <div className="stat-content">
              <h3>{filteredFeedbacks.length}</h3>
              <p>Total Feedback</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <span>⭐</span>
            </div>
            <div className="stat-content">
              <h3>4.2</h3>
              <p>Average Rating</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <span>👍</span>
            </div>
            <div className="stat-content">
              <h3>85%</h3>
              <p>Recommend Rate</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <span>😊</span>
            </div>
            <div className="stat-content">
              <h3>75%</h3>
              <p>Positive Sentiment</p>
            </div>
          </div>
        </div>
        
        <AdminFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          customStartDate={customStartDate}
          setCustomStartDate={setCustomStartDate}
          customEndDate={customEndDate}
          setCustomEndDate={setCustomEndDate}
          filteredFeedbacks={filteredFeedbacks}
        />
        
        <div className="dashboard-content">
          <div className="content-left">
            <PerformanceInsights 
              filteredFeedbacks={filteredFeedbacks}
              averages={{
                food: "4.2",
                ambience: "4.5",
                service: "4.0",
                overall: "4.2"
              }}
              sentimentAnalysis={{
                positive: "75",
                negative: "15",
                neutral: "10",
                total: "100"
              }}
              recommendRate="85"
              recommendCount={85}
              keyThemes={[]}
              actionableInsights={[]}
              trendData={[]}
              topStrength={{ name: "Food", value: 4.5 }}
              improvementArea={{ name: "Service", value: 3.8 }}
            />
            
            <AdminCharts 
              ratingsData={[
                { name: 'Food', rating: 4.2, fill: '#14b8a6' },
                { name: 'Ambience', rating: 4.5, fill: '#14b8a6' },
                { name: 'Service', rating: 4.0, fill: '#14b8a6' },
                { name: 'Overall', rating: 4.2, fill: '#14b8a6' }
              ]}
              sentimentData={[
                { name: 'Positive', value: 75, color: '#10b981' },
                { name: 'Neutral', value: 10, color: '#6b7280' },
                { name: 'Negative', value: 15, color: '#ef4444' }
              ]}
              sentimentAnalysis={{ total: 100 }}
            />
          </div>
          
          <div className="content-right">
            <FeedbackTable 
              currentItems={currentItems}
              filteredFeedbacks={filteredFeedbacks}
              searchTerm={searchTerm}
              handleDelete={handleDelete}
              handleArchive={handleArchive}
            />
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              paginate={paginate}
              indexOfFirstItem={indexOfFirstItem}
              indexOfLastItem={indexOfLastItem}
              filteredFeedbacks={filteredFeedbacks}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;