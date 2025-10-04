import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
    // Clear authentication data from localStorage
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminExpires");
    
    // Update authentication state
    setIsAdminLoggedIn(false);
    
    // Redirect to login page instead of home page
    navigate("/admin-login");
  };

  const handleExportPDF = () => {
    // Check if there's data to export
    if (visibleFeedbacks.length === 0) {
      alert("No data available to export for the current filter settings.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Define colors
    const primaryColor = [66, 133, 244]; // Blue
    const secondaryColor = [43, 183, 169]; // Teal
    const successColor = [76, 175, 80]; // Green
    const warningColor = [255, 152, 0]; // Orange
    const dangerColor = [244, 67, 54]; // Red
    
    // Add header with logo placeholder
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Add title in header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text("Feedback Report", pageWidth / 2, 25, { align: 'center' });
    
    // Add report metadata
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 50);
    doc.text(`Filter: ${getTimeFilterLabel()}`, 14, 57);
    doc.text(`Showing: ${showArchived ? 'All Feedback' : 'Active Feedback Only'}`, 14, 64);
    
    // Add summary statistics with colored boxes
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Summary Statistics", 14, 80);
    
    // Create summary boxes
    const summaryY = 90;
    const boxWidth = 45;
    const boxHeight = 30;
    const boxSpacing = 5;
    const startX = 14;
    
    // Total Feedback box
    doc.setFillColor(...primaryColor);
    doc.rect(startX, summaryY, boxWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Total", startX + boxWidth/2, summaryY + 12, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(totalSubmissions.toString(), startX + boxWidth/2, summaryY + 22, { align: 'center' });
    
    // Recommendation Rate box
    doc.setFillColor(...successColor);
    doc.rect(startX + (boxWidth + boxSpacing), summaryY, boxWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Recommend", startX + (boxWidth + boxSpacing) + boxWidth/2, summaryY + 12, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(`${recommendRate}%`, startX + (boxWidth + boxSpacing) + boxWidth/2, summaryY + 22, { align: 'center' });
    
    // Average Overall Rating box
    doc.setFillColor(...secondaryColor);
    doc.rect(startX + 2*(boxWidth + boxSpacing), summaryY, boxWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Overall", startX + 2*(boxWidth + boxSpacing) + boxWidth/2, summaryY + 12, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(averages.overall, startX + 2*(boxWidth + boxSpacing) + boxWidth/2, summaryY + 22, { align: 'center' });
    
    // Average Food Rating box
    doc.setFillColor(...warningColor);
    doc.rect(startX + 3*(boxWidth + boxSpacing), summaryY, boxWidth, boxHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text("Food", startX + 3*(boxWidth + boxSpacing) + boxWidth/2, summaryY + 12, { align: 'center' });
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(averages.food, startX + 3*(boxWidth + boxSpacing) + boxWidth/2, summaryY + 22, { align: 'center' });
    
    // Add detailed ratings section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Detailed Ratings", 14, summaryY + 45);
    
    // Create rating bars
    const ratingStartY = summaryY + 55;
    const ratingBarWidth = 100;
    const ratingBarHeight = 8;
    const maxRating = 5;
    
    const ratings = [
      { label: 'Food', value: parseFloat(averages.food), color: warningColor },
      { label: 'Service', value: parseFloat(averages.service), color: primaryColor },
      { label: 'Ambience', value: parseFloat(averages.ambience), color: secondaryColor },
      { label: 'Overall', value: parseFloat(averages.overall), color: successColor }
    ];
    
    ratings.forEach((rating, index) => {
      const y = ratingStartY + (index * 20);
      
      // Label
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(rating.label, 14, y);
      
      // Rating value
      doc.setFont(undefined, 'bold');
      doc.text(`${rating.value}/${maxRating}`, 60, y);
      
      // Background bar
      doc.setFillColor(240, 240, 240);
      doc.rect(90, y - 5, ratingBarWidth, ratingBarHeight, 'F');
      
      // Filled bar
      const fillWidth = (rating.value / maxRating) * ratingBarWidth;
      doc.setFillColor(...rating.color);
      doc.rect(90, y - 5, fillWidth, ratingBarHeight, 'F');
    });
    
    // Add recommendation chart
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Recommendation Breakdown", 14, ratingStartY + 85);
    
    // Create simple pie chart representation
    const chartCenterX = 40;
    const chartCenterY = ratingStartY + 110;
    const chartRadius = 20;
    
    // Draw pie chart
    const recommendPercentage = recommendCount / totalSubmissions;
    const notRecommendPercentage = 1 - recommendPercentage;
    
    // Recommend segment
    doc.setFillColor(...successColor);
    doc.circle(chartCenterX, chartCenterY, chartRadius, 'F');
    
    // Not recommend segment
    doc.setFillColor(...dangerColor);
    const startAngle = recommendPercentage * 360;
    doc.circle(chartCenterX, chartCenterY, chartRadius, 'F');
    
    // Add legend
    doc.setFillColor(...successColor);
    doc.rect(70, chartCenterY - 5, 10, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Would Recommend (${recommendCount})`, 85, chartCenterY + 2);
    
    doc.setFillColor(...dangerColor);
    doc.rect(70, chartCenterY + 10, 10, 10, 'F');
    doc.text(`Would Not Recommend (${totalSubmissions - recommendCount})`, 85, chartCenterY + 17);
    
    // Add detailed feedback table
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text("Detailed Feedback", 14, ratingStartY + 145);
    
    // Add table with better styling
    autoTable(doc, {
      head: [[
        "Date", "Name/Group", "Email", "Contact", "Event",
        "Food", "Ambience", "Service", "Overall",
        "Recommend", "Comments", "Type"
      ]],
      body: visibleFeedbacks.map((f) => {
        // Color code ratings
        const getRatingColor = (rating) => {
          const numRating = parseFloat(rating);
          if (numRating >= 4) return [76, 175, 80]; // Green
          if (numRating >= 3) return [255, 152, 0]; // Orange
          return [244, 67, 54]; // Red
        };
        
        // Color code recommendation
        const recommendColor = f.recommend === "Yes" ? [76, 175, 80] : [244, 67, 54];
        
        return [
          f.date,
          f.name,
          f.email || "N/A",
          f.contact || "N/A",
          f.event,
          { content: f.food || "N/A", styles: { textColor: getRatingColor(f.food) } },
          { content: f.ambience || "N/A", styles: { textColor: getRatingColor(f.ambience) } },
          { content: f.service || "N/A", styles: { textColor: getRatingColor(f.service) } },
          { content: f.overall || "N/A", styles: { textColor: getRatingColor(f.overall) } },
          { content: f.recommend || "No", styles: { textColor: recommendColor } },
          f.comments || "No comments",
          f.type || "Individual"
        ];
      }),
      startY: ratingStartY + 155,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [...primaryColor],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250],
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Date
        1: { cellWidth: 25 }, // Name/Group
        2: { cellWidth: 30 }, // Email
        3: { cellWidth: 20 }, // Contact
        4: { cellWidth: 25 }, // Event
        5: { cellWidth: 15 }, // Food
        6: { cellWidth: 15 }, // Ambience
        7: { cellWidth: 15 }, // Service
        8: { cellWidth: 15 }, // Overall
        9: { cellWidth: 20 }, // Recommend
        10: { cellWidth: 30 }, // Comments
        11: { cellWidth: 20 }, // Type
      },
      didDrawPage: function (data) {
        // Add footer with page number
        const footerY = pageHeight - 15;
        
        // Footer line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(14, footerY, pageWidth - 14, footerY);
        
        // Page number
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text(
          `Page ${doc.internal.getNumberOfPages()}`,
          pageWidth / 2,
          footerY + 10,
          { align: 'center' }
        );
        
        // Footer text
        doc.text(
          `Generated on ${new Date().toLocaleDateString()} by Feedback Hub`,
          pageWidth / 2,
          footerY + 5,
          { align: 'center' }
        );
      },
    });
    
    // Save the PDF
    const fileName = `feedback-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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