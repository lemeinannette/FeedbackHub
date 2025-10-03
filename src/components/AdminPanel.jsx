import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DarkModeToggle from "./DarkModeToggle";
import "./AdminPanel.css";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function AdminPanel({ setIsAdminLoggedIn }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Session Expiration
    const expiresAt = parseInt(localStorage.getItem("adminExpires"), 10);
    if (!expiresAt || Date.now() > expiresAt) {
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("adminExpires");
      setIsAdminLoggedIn(false);
      navigate("/admin-login");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("feedbacks")) || [];
    setFeedbacks(saved);
  }, [navigate, setIsAdminLoggedIn]);

  const updateStorage = (newData) => {
    setFeedbacks(newData);
    localStorage.setItem("feedbacks", JSON.stringify(newData));
  };

  // --- Filter feedbacks based on time period ---
  const getFilteredFeedbacks = () => {
    let filtered = showArchived
      ? feedbacks
      : feedbacks.filter((f) => !f.archived);
    
    const now = new Date();
    
    if (timeFilter === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(f => new Date(f.date) >= sevenDaysAgo);
    } else if (timeFilter === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(f => new Date(f.date) >= thirtyDaysAgo);
    } else if (timeFilter === 'custom' && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      filtered = filtered.filter(f => {
        const feedbackDate = new Date(f.date);
        return feedbackDate >= start && feedbackDate <= end;
      });
    }
    
    return filtered;
  };

  const visibleFeedbacks = getFilteredFeedbacks();
  const totalSubmissions = visibleFeedbacks.length;

  // --- Calculations ---
  const recommendCount = visibleFeedbacks.filter(
    (f) => f.recommend === "Yes"
  ).length;

  const recommendRate = totalSubmissions
    ? ((recommendCount / totalSubmissions) * 100).toFixed(1)
    : 0;

  const average = (key) =>
    totalSubmissions
      ? (
          visibleFeedbacks.reduce((sum, f) => sum + Number(f[key] || 0), 0) /
          totalSubmissions
        ).toFixed(1)
      : 0;

  const averages = {
    food: average("food"),
    ambience: average("ambience"),
    service: average("service"),
    overall: average("overall"),
  };

  // --- Trend Calculations ---
  const calculateTrend = (key) => {
    if (timeFilter === 'all') return null;
    
    const now = new Date();
    let currentPeriod, previousPeriod;
    
    if (timeFilter === '7days') {
      currentPeriod = visibleFeedbacks.filter(f => {
        const feedbackDate = new Date(f.date);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return feedbackDate >= sevenDaysAgo;
      });
      
      previousPeriod = feedbacks.filter(f => {
        const feedbackDate = new Date(f.date);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return feedbackDate >= fourteenDaysAgo && feedbackDate < sevenDaysAgo;
      });
    } else if (timeFilter === '30days') {
      currentPeriod = visibleFeedbacks.filter(f => {
        const feedbackDate = new Date(f.date);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return feedbackDate >= thirtyDaysAgo;
      });
      
      previousPeriod = feedbacks.filter(f => {
        const feedbackDate = new Date(f.date);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return feedbackDate >= sixtyDaysAgo && feedbackDate < thirtyDaysAgo;
      });
    } else {
      return null;
    }
    
    const currentAvg = currentPeriod.length
      ? currentPeriod.reduce((sum, f) => sum + Number(f[key] || 0), 0) / currentPeriod.length
      : 0;
      
    const previousAvg = previousPeriod.length
      ? previousPeriod.reduce((sum, f) => sum + Number(f[key] || 0), 0) / previousPeriod.length
      : 0;
      
    if (previousAvg === 0) return null;
    
    const change = ((currentAvg - previousAvg) / previousAvg) * 100;
    return {
      value: change.toFixed(1),
      isPositive: change >= 0
    };
  };

  const trends = {
    food: calculateTrend("food"),
    ambience: calculateTrend("ambience"),
    service: calculateTrend("service"),
    overall: calculateTrend("overall"),
  };

  // --- Chart Data ---
  const recommendData = [
    { name: 'Would Recommend', value: recommendCount, color: '#4CAF50' },
    { name: 'Would Not Recommend', value: totalSubmissions - recommendCount, color: '#F44336' }
  ];

  const ratingsData = [
    { name: 'Food', rating: parseFloat(averages.food) },
    { name: 'Ambience', rating: parseFloat(averages.ambience) },
    { name: 'Service', rating: parseFloat(averages.service) },
    { name: 'Overall', rating: parseFloat(averages.overall) }
  ];

  // --- Actions ---
  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    navigate("/");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [[
        "Date", "Name/Group", "Email", "Contact", "Event",
        "Food", "Ambience", "Service", "Overall",
        "Recommend", "Comments", "Archived"
      ]],
      body: feedbacks.map((f) => [
        f.date,
        f.name,
        f.email,
        f.contact,
        f.event,
        f.food,
        f.ambience,
        f.service,
        f.overall,
        f.recommend || "No",
        f.comments,
        f.archived ? "Yes" : "No",
      ]),
    });
    doc.save("feedbacks.pdf");
  };

  const handleDelete = (index) => {
    const updated = feedbacks.filter((_, i) => i !== index);
    updateStorage(updated);
  };

  const handleArchive = (index) => {
    const updated = [...feedbacks];
    updated[index].archived = !updated[index].archived;
    updateStorage(updated);
  };

  const getTimeFilterLabel = () => {
    switch(timeFilter) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'custom': return customStartDate && customEndDate 
        ? `${customStartDate} to ${customEndDate}` 
        : 'Custom Range';
      default: return 'All Time';
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="header">
        <h1>Admin Dashboard</h1>
        <div className="header-buttons">
          <DarkModeToggle />
          <button onClick={handleLogout} className="button logout-btn">
            <i className="bx bx-log-out"></i> Logout
          </button>
          <button onClick={handleExportPDF} className="button export-btn">
            <i className="bx bx-download"></i> Export PDF
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="button archive-toggle"
          >
            <i className="bx bx-archive"></i> {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
        </div>
      </div>

      {/* Search Bar with Time Filter */}
      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <i className="bx bx-search search-icon"></i>
            <input 
              type="text" 
              placeholder="Search feedback..."
              className="search-input"
            />
          </div>
          <div className="time-filter-dropdown">
            <button 
              className="time-filter-button"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <i className="bx bx-calendar"></i>
              <span>{getTimeFilterLabel()}</span>
              <i className={`bx bx-chevron-${showDatePicker ? 'up' : 'down'}`}></i>
            </button>
            {showDatePicker && (
              <div className="date-picker-dropdown">
                <button 
                  className={timeFilter === 'all' ? 'active' : ''} 
                  onClick={() => { setTimeFilter('all'); setShowDatePicker(false); }}
                >
                  All Time
                </button>
                <button 
                  className={timeFilter === '7days' ? 'active' : ''} 
                  onClick={() => { setTimeFilter('7days'); setShowDatePicker(false); }}
                >
                  Last 7 Days
                </button>
                <button 
                  className={timeFilter === '30days' ? 'active' : ''} 
                  onClick={() => { setTimeFilter('30days'); setShowDatePicker(false); }}
                >
                  Last 30 Days
                </button>
                <button 
                  className={timeFilter === 'custom' ? 'active' : ''} 
                  onClick={() => setTimeFilter('custom')}
                >
                  Custom Range
                </button>
                {timeFilter === 'custom' && (
                  <div className="custom-date-inputs">
                    <input 
                      type="date" 
                      value={customStartDate} 
                      onChange={(e) => setCustomStartDate(e.target.value)}
                    />
                    <span>to</span>
                    <input 
                      type="date" 
                      value={customEndDate} 
                      onChange={(e) => setCustomEndDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-container">
          <h2>Recommendation Rate</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={recommendData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {recommendData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <h2>Rating Comparison</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rating" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Section with Trends */}
      <div className="top-section">
        <div className="card summary">
          <h2>Summary</h2>
          <p><strong>Total Feedback:</strong> {totalSubmissions}</p>
          <p><strong>Recommend (Yes):</strong> {recommendCount}</p>
          <p><strong>Recommendation Rate:</strong> {recommendRate}%</p>
        </div>
        <div className="card averages">
          <h2>Average Ratings</h2>
          <p>
            Food: {averages.food} 
            {trends.food && (
              <span className={`trend ${trends.food.isPositive ? 'positive' : 'negative'}`}>
                {trends.food.isPositive ? '↑' : '↓'} {trends.food.value}%
              </span>
            )}
          </p>
          <p>
            Ambience: {averages.ambience}
            {trends.ambience && (
              <span className={`trend ${trends.ambience.isPositive ? 'positive' : 'negative'}`}>
                {trends.ambience.isPositive ? '↑' : '↓'} {trends.ambience.value}%
              </span>
            )}
          </p>
          <p>
            Service: {averages.service}
            {trends.service && (
              <span className={`trend ${trends.service.isPositive ? 'positive' : 'negative'}`}>
                {trends.service.isPositive ? '↑' : '↓'} {trends.service.value}%
              </span>
            )}
          </p>
          <p>
            Overall: {averages.overall}
            {trends.overall && (
              <span className={`trend ${trends.overall.isPositive ? 'positive' : 'negative'}`}>
                {trends.overall.isPositive ? '↑' : '↓'} {trends.overall.value}%
              </span>
            )}
          </p>
        </div>
        <div className="card activity">
          <h2>Recent Activity</h2>
          {visibleFeedbacks.slice(-3).reverse().map((f, i) => (
            <p key={i}>
              <strong>{f.name}</strong> left a {f.overall}-star review
              ({new Date(f.date).toLocaleTimeString()})
            </p>
          ))}
        </div>
      </div>

      {/* Feedback Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              {[
                "Date", "Name/Group", "Email", "Contact", "Event",
                "Food", "Ambience", "Service", "Overall",
                "Recommend", "Comments", "Actions"
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleFeedbacks.length === 0 ? (
              <tr>
                <td colSpan="12" className="empty">No feedback available</td>
              </tr>
            ) : (
              visibleFeedbacks.map((f, index) => (
                <tr key={index} className={index % 2 === 0 ? "even" : "odd"}>
                  <td>{f.date}</td>
                  <td>{f.name}</td>
                  <td>{f.email}</td>
                  <td>{f.contact}</td>
                  <td>{f.event}</td>
                  <td>{f.food}</td>
                  <td>{f.ambience}</td>
                  <td>{f.service}</td>
                  <td>{f.overall}</td>
                  <td>{f.recommend || "No"}</td>
                  <td>{f.comments}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(index)}
                      title="Delete feedback"
                    >
                      <i className="bx bx-trash-alt"></i>
                    </button>
                    <button
                      className="archive-btn"
                      onClick={() => handleArchive(feedbacks.indexOf(f))}
                      title={f.archived ? "Unarchive" : "Archive feedback"}
                    >
                      <i className="bx bx-archive-in"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}