import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRealtimeFeedback } from "../hooks/useRealtimeFeedback";
import Notification from "../common/Notification";
import AdminHeader from "./AdminHeader";
import AdminFilters from "./AdminFilters";
import PerformanceInsights from "./PerformanceInsights";
import AdminCharts from "./AdminCharts";
import FeedbackTable from "./FeedbackTable";
import Pagination from "./Pagination";
import "./AdminPanel.css";

function AdminPanel({ 
  setIsAdminLoggedIn, 
  adminDarkMode,
  toggleAdminTheme
}) {
  const [showArchived, setShowArchived] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showExportTooltip, setShowExportTooltip] = useState(false);
  const [notification, setNotification] = useState(null);

  const navigate = useNavigate();
  const { feedbacks, updateFeedbacks } = useRealtimeFeedback();

  useEffect(() => {
    const expiresAt = parseInt(localStorage.getItem("adminExpires"), 10);
    if (!expiresAt || Date.now() > expiresAt) {
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("adminExpires");
      setIsAdminLoggedIn(false);
      navigate("/admin-login");
      return;
    }
  }, [navigate, setIsAdminLoggedIn]);

  // Show notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
  };

  // Helper function to get time filter label
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

  // Helper function to get average
  const average = (key) => {
    if (!filteredFeedbacks.length) return "0.0";
    const sum = filteredFeedbacks.reduce((sum, f) => {
      const val = parseFloat(f[key]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    return (sum / filteredFeedbacks.length).toFixed(1);
  };

  // Filter feedbacks based on search, archive status, and time filter
  const filteredFeedbacks = useMemo(() => {
    let filtered = showArchived
      ? feedbacks
      : feedbacks.filter((f) => !f.archived);
    
    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(f => {
        const name = f.name || '';
        const email = f.email || '';
        const event = f.event || '';
        const comments = f.comments || '';
        
        return (
          name.toLowerCase().includes(lowerSearchTerm) ||
          email.toLowerCase().includes(lowerSearchTerm) ||
          event.toLowerCase().includes(lowerSearchTerm) ||
          comments.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }
    
    // Apply time filter
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
    
    // Default sorting by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return filtered;
  }, [feedbacks, showArchived, searchTerm, timeFilter, customStartDate, customEndDate]);

  // Real-time sentiment analysis
  const sentimentAnalysis = useMemo(() => {
    const positiveWords = ['excellent', 'amazing', 'great', 'good', 'fantastic', 'wonderful', 'perfect', 'love', 'best', 'awesome', 'brilliant', 'outstanding'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'disappointing', 'worst', 'hate', 'horrible', 'unacceptable', 'needs improvement', 'slow', 'rude'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    filteredFeedbacks.forEach(feedback => {
      const text = (feedback.comments || '').toLowerCase();
      let hasPositive = false;
      let hasNegative = false;
      
      positiveWords.forEach(word => {
        if (text.includes(word)) hasPositive = true;
      });
      
      negativeWords.forEach(word => {
        if (text.includes(word)) hasNegative = true;
      });
      
      if (hasPositive && !hasNegative) positiveCount++;
      else if (hasNegative && !hasPositive) negativeCount++;
      else neutralCount++;
    });
    
    const total = positiveCount + negativeCount + neutralCount;
    return {
      positive: total > 0 ? (positiveCount / total * 100).toFixed(1) : 0,
      negative: total > 0 ? (negativeCount / total * 100).toFixed(1) : 0,
      neutral: total > 0 ? (neutralCount / total * 100).toFixed(1) : 0,
      total
    };
  }, [filteredFeedbacks]);

  // Extract key themes from comments
  const keyThemes = useMemo(() => {
    const themes = {
      food: { keywords: ['food', 'meal', 'dish', 'taste', 'flavor', 'menu', 'cuisine'], count: 0, examples: [] },
      service: { keywords: ['service', 'staff', 'waiter', 'waitress', 'friendly', 'helpful', 'attitude'], count: 0, examples: [] },
      ambience: { keywords: ['ambience', 'atmosphere', 'decor', 'music', 'lighting', 'environment', 'clean'], count: 0, examples: [] },
      price: { keywords: ['price', 'cost', 'expensive', 'cheap', 'value', 'money', 'affordable'], count: 0, examples: [] },
      time: { keywords: ['time', 'wait', 'slow', 'fast', 'quick', 'delay', 'prompt'], count: 0, examples: [] }
    };
    
    filteredFeedbacks.forEach(feedback => {
      const text = (feedback.comments || '').toLowerCase();
      
      Object.keys(themes).forEach(theme => {
        themes[theme].keywords.forEach(keyword => {
          if (text.includes(keyword)) {
            themes[theme].count++;
            if (themes[theme].examples.length < 3 && feedback.comments) {
              themes[theme].examples.push(feedback.comments.substring(0, 100) + (feedback.comments.length > 100 ? '...' : ''));
            }
          }
        });
      });
    });
    
    return Object.entries(themes)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 3)
      .map(([name, data]) => ({ name, ...data }));
  }, [filteredFeedbacks]);

  // Generate actionable insights
  const actionableInsights = useMemo(() => {
    const insights = [];
    
    // Analyze ratings
    const avgFood = parseFloat(average("food"));
    const avgService = parseFloat(average("service"));
    const avgAmbience = parseFloat(average("ambience"));
    const avgOverall = parseFloat(average("overall"));
    
    if (avgFood < 3.5) {
      insights.push({
        type: 'improvement',
        priority: 'high',
        title: 'Food Quality Needs Attention',
        description: `Average food rating is ${avgFood}/5. Consider reviewing menu items and chef performance.`,
        action: 'Schedule a menu review and chef feedback session'
      });
    }
    
    if (avgService < 3.5) {
      insights.push({
        type: 'improvement',
        priority: 'high',
        title: 'Service Standards Declining',
        description: `Service rating at ${avgService}/5 requires immediate staff training.`,
        action: 'Implement customer service training program'
      });
    }
    
    if (sentimentAnalysis.negative > 30) {
      insights.push({
        type: 'urgent',
        priority: 'critical',
        title: 'High Negative Sentiment Detected',
        description: `${sentimentAnalysis.negative}% of feedback shows negative sentiment.`,
        action: 'Conduct emergency meeting to address customer concerns'
      });
    }
    
    if (avgFood > 4.5) {
      insights.push({
        type: 'strength',
        priority: 'maintain',
        title: 'Excellent Food Quality',
        description: `Food rating of ${avgFood}/5 is a key strength.`,
        action: 'Maintain current standards and consider featuring in marketing'
      });
    }
    
    if (filteredFeedbacks.length > 0) {
      const recentTrend = filteredFeedbacks.slice(0, 10);
      const recentAvg = recentTrend.reduce((sum, f) => sum + parseFloat(f.overall || 0), 0) / recentTrend.length;
      
      if (recentAvg > avgOverall + 0.5) {
        insights.push({
          type: 'positive',
          priority: 'info',
          title: 'Recent Improvement Trend',
          description: 'Recent feedback shows positive improvement.',
          action: 'Identify what changed and maintain momentum'
        });
      }
    }
    
    return insights.slice(0, 4);
  }, [filteredFeedbacks, sentimentAnalysis]);

  // Time series data for trend analysis
  const trendData = useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayFeedbacks = feedbacks.filter(f => f.date === dateStr);
      const avgRating = dayFeedbacks.length > 0 
        ? dayFeedbacks.reduce((sum, f) => sum + parseFloat(f.overall || 0), 0) / dayFeedbacks.length 
        : 0;
      
      last7Days.push({
        date: date.toLocaleDateString('en', { weekday: 'short' }),
        rating: avgRating.toFixed(1),
        count: dayFeedbacks.length
      });
    }
    return last7Days;
  }, [feedbacks]);

  // Determine top strength and improvement area dynamically
  const topStrength = useMemo(() => {
    const categories = [
      { name: 'Food', value: parseFloat(average("food")) || 0 },
      { name: 'Ambience', value: parseFloat(average("ambience")) || 0 },
      { name: 'Service', value: parseFloat(average("service")) || 0 },
      { name: 'Overall', value: parseFloat(average("overall")) || 0 }
    ];
    return categories.reduce((max, cat) => cat.value > max.value ? cat : max);
  }, [average]);

  const improvementArea = useMemo(() => {
    const categories = [
      { name: 'Food', value: parseFloat(average("food")) || 0 },
      { name: 'Ambience', value: parseFloat(average("ambience")) || 0 },
      { name: 'Service', value: parseFloat(average("service")) || 0 },
      { name: 'Overall', value: parseFloat(average("overall")) || 0 }
    ];
    return categories.reduce((min, cat) => cat.value < min.value ? cat : min);
  }, [average]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Calculate recommendation metrics
  const recommendCount = filteredFeedbacks.filter((f) => f.recommend === "Yes").length;
  const notRecommendCount = filteredFeedbacks.filter((f) => f.recommend === "No").length;
  const recommendRate = filteredFeedbacks.length
    ? ((recommendCount / filteredFeedbacks.length) * 100).toFixed(1)
    : "0.0";

  const averages = {
    food: average("food"),
    ambience: average("ambience"),
    service: average("service"),
    overall: average("overall"),
  };

  // Chart colors
  const chartColors = {
    primary: '#14b8a6',
    secondary: '#0d9488',
    tertiary: '#0f766e',
    quaternary: '#115e59',
    success: '#10b981',
    danger: '#ef4444',
    neutral: '#6b7280'
  };

  // Data for charts
  const ratingsData = [
    { 
      name: 'Food', 
      rating: parseFloat(averages.food) || 0,
      fullMark: 5,
      fill: chartColors.primary
    },
    { 
      name: 'Ambience', 
      rating: parseFloat(averages.ambience) || 0,
      fullMark: 5,
      fill: chartColors.primary
    },
    { 
      name: 'Service', 
      rating: parseFloat(averages.service) || 0,
      fullMark: 5,
      fill: chartColors.primary
    },
    { 
      name: 'Overall', 
      rating: parseFloat(averages.overall) || 0,
      fullMark: 5,
      fill: chartColors.primary
    }
  ];

  const sentimentData = [
    { name: 'Positive', value: parseFloat(sentimentAnalysis.positive), color: '#10b981' },
    { name: 'Neutral', value: parseFloat(sentimentAnalysis.neutral), color: '#6b7280' },
    { name: 'Negative', value: parseFloat(sentimentAnalysis.negative), color: '#ef4444' }
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminExpires");
    setIsAdminLoggedIn(false);
    navigate("/admin-login");
  };

  const handleDelete = (feedback) => {
    const actualIndex = feedbacks.findIndex(f => f === feedback);
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      const updated = feedbacks.filter((_, i) => i !== actualIndex);
      updateFeedbacks(updated);
      
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      showNotification("Feedback deleted successfully", "success");
    }
  };

  const handleArchive = (feedback) => {
    const actualIndex = feedbacks.findIndex(f => f === feedback);
    const updated = [...feedbacks];
    updated[actualIndex].archived = !updated[actualIndex].archived;
    updateFeedbacks(updated);
    
    showNotification(
      `Feedback ${updated[actualIndex].archived ? 'archived' : 'unarchived'} successfully`,
      "success"
    );
  };

  // Enhanced PDF Export with comprehensive reporting
  const handleExportPDF = () => {
    if (filteredFeedbacks.length === 0) {
      showNotification("No data available to export for the current filter settings.", "warning");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      // Create a comprehensive HTML report
      const reportHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Feedback Analytics Report</title>
          <style>
            @page {
              margin: 20mm;
              @bottom-center {
                content: "Page " counter(page);
                font-size: 10px;
                color: #64748b;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #334155;
              background: #ffffff;
              font-size: 14px;
            }
            
            .report-container {
              max-width: 100%;
              margin: 0 auto;
            }
            
            /* Header */
            .report-header {
              background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
              color: white;
              padding: 40px;
              border-radius: 12px;
              margin-bottom: 30px;
              text-align: center;
            }
            
            .report-header h1 {
              font-size: 32px;
              margin-bottom: 10px;
              font-weight: 600;
            }
            
            .report-header p {
              font-size: 16px;
              opacity: 0.9;
              margin-bottom: 20px;
            }
            
            .report-meta {
              display: flex;
              justify-content: center;
              gap: 30px;
              font-size: 14px;
              opacity: 0.8;
            }
            
            .report-meta-item {
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            /* Executive Summary */
            .executive-summary {
              background: #f8fafc;
              border-radius: 12px;
              padding: 30px;
              margin-bottom: 30px;
              border-left: 4px solid #14b8a6;
            }
            
            .executive-summary h2 {
              font-size: 24px;
              color: #1e293b;
              margin-bottom: 20px;
              font-weight: 600;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 20px;
              margin-bottom: 20px;
            }
            
            .summary-item {
              text-align: center;
              padding: 20px;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .summary-value {
              font-size: 28px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 5px;
            }
            
            .summary-label {
              font-size: 14px;
              color: #64748b;
              margin-bottom: 10px;
            }
            
            .summary-text {
              font-size: 14px;
              color: #475569;
              line-height: 1.6;
              margin-top: 20px;
            }
            
            /* Detailed Feedback Table */
            .feedback-table-section {
              margin-bottom: 30px;
            }
            
            .feedback-table-section h2 {
              font-size: 24px;
              color: #1e293b;
              margin-bottom: 20px;
              font-weight: 600;
            }
            
            .feedback-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            
            .feedback-table th {
              background: #f8fafc;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              color: #475569;
              border-bottom: 2px solid #e2e8f0;
            }
            
            .feedback-table td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              vertical-align: top;
            }
            
            .feedback-table tr:nth-child(even) {
              background: #f8fafc;
            }
            
            .recommend-badge {
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 600;
            }
            
            .recommend-badge.yes {
              background: #f0fdf4;
              color: #16a34a;
            }
            
            .recommend-badge.no {
              background: #fef2f2;
              color: #dc2626;
            }
            
            .rating-value {
              font-weight: 600;
              color: #1f2937;
            }
            
            /* Footer */
            .report-footer {
              text-align: center;
              padding: 20px;
              color: #64748b;
              font-size: 12px;
              border-top: 1px solid #e2e8f0;
              margin-top: 40px;
            }
            
            /* Page break */
            .page-break {
              page-break-before: always;
            }
            
            @media print {
              .feedback-table-section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <!-- Report Header -->
            <div class="report-header">
              <h1>Feedback Analytics Report</h1>
              <p>Customer Experience Management System</p>
              <div class="report-meta">
                <div class="report-meta-item">
                  <i class="bx bx-calendar"></i>
                  <span>Generated: ${new Date().toLocaleDateString()}</span>
                </div>
                <div class="report-meta-item">
                  <i class="bx bx-time-five"></i>
                  <span>Time: ${new Date().toLocaleTimeString()}</span>
                </div>
                <div class="report-meta-item">
                  <i class="bx bx-filter"></i>
                  <span>Period: ${getTimeFilterLabel()}</span>
                </div>
              </div>
            </div>
            
            <!-- Executive Summary -->
            <div class="executive-summary">
              <h2>Executive Summary</h2>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-value">${filteredFeedbacks.length}</div>
                  <div class="summary-label">Total Feedback</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${recommendRate}%</div>
                  <div class="summary-label">Recommendation Rate</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${averages.overall}</div>
                  <div class="summary-label">Average Rating</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${recommendCount}</div>
                  <div class="summary-label">Positive Responses</div>
                </div>
              </div>
              <div class="summary-text">
                <strong>Overview:</strong> This report provides a comprehensive analysis of customer feedback collected during ${getTimeFilterLabel()}. 
                With ${filteredFeedbacks.length} responses and a ${recommendRate}% recommendation rate, 
                ${parseFloat(recommendRate) > 50 ? 'customer sentiment appears positive' : 'there is room for improvement in customer satisfaction'}. 
                The overall rating of ${averages.overall}/5 indicates ${parseFloat(averages.overall) > 3 ? 'satisfactory' : 'below satisfactory'} performance.
              </div>
            </div>
            
            <!-- Detailed Feedback Table -->
            <div class="feedback-table-section">
              <h2>Detailed Feedback Analysis</h2>
              <table class="feedback-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Name</th>
                    <th>Event</th>
                    <th>Food</th>
                    <th>Ambience</th>
                    <th>Service</th>
                    <th>Overall</th>
                    <th>Recommend</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredFeedbacks.map(feedback => `
                    <tr>
                      <td>${feedback.date || 'N/A'}</td>
                      <td>${feedback.name || 'N/A'}</td>
                      <td>${feedback.event || 'N/A'}</td>
                      <td><span class="rating-value">${feedback.food || 'N/A'}</span></td>
                      <td><span class="rating-value">${feedback.ambience || 'N/A'}</span></td>
                      <td><span class="rating-value">${feedback.service || 'N/A'}</span></td>
                      <td><span class="rating-value">${feedback.overall || 'N/A'}</span></td>
                      <td>
                        <span class="recommend-badge ${feedback.recommend === 'Yes' ? 'yes' : 'no'}">
                          ${feedback.recommend || 'No'}
                        </span>
                      </td>
                      <td>${feedback.comments ? feedback.comments.substring(0, 100) + (feedback.comments.length > 100 ? '...' : '') : 'No comments'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            
            <!-- Report Footer -->
            <div class="report-footer">
              <p>© FeedbackHub Analytics | Professional Report</p>
              <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p>Report ID: ${Date.now()}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a new window and print
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      if (printWindow) {
        printWindow.document.write(reportHtml);
        printWindow.document.close();
        
        // Show success notification
        showNotification("Report generated successfully. Instructions for saving as PDF are included in the report.", "success");
      } else {
        showNotification("Popup blocked! Please allow popups for this site to generate the report.", "error");
      }
      
      setIsGeneratingPDF(false);
      
    } catch (error) {
      console.error("Error generating report:", error);
      setIsGeneratingPDF(false);
      showNotification('Failed to generate report. Please try again.', "error");
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, timeFilter, customStartDate, customEndDate, showArchived]);

  return (
    <div className={`admin-container ${adminDarkMode ? 'dark-mode' : ''}`}>
      {/* Notification Component */}
      <Notification notification={notification} setNotification={setNotification} />
      
      {/* Header Component */}
      <AdminHeader 
        adminDarkMode={adminDarkMode}
        toggleAdminTheme={toggleAdminTheme}
        handleLogout={handleLogout}
        handleExportPDF={handleExportPDF}
        isGeneratingPDF={isGeneratingPDF}
        showExportTooltip={showExportTooltip}
        setShowExportTooltip={setShowExportTooltip}
        showArchived={showArchived}
        setShowArchived={setShowArchived}
      />
      
      {/* Filters Component */}
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
      
      {/* Performance Insights Component */}
      <PerformanceInsights 
        filteredFeedbacks={filteredFeedbacks}
        averages={averages}
        sentimentAnalysis={sentimentAnalysis}
        recommendRate={recommendRate}
        recommendCount={recommendCount}
        keyThemes={keyThemes}
        actionableInsights={actionableInsights}
        trendData={trendData}
        topStrength={topStrength}
        improvementArea={improvementArea}
      />
      
      {/* Charts Component */}
      <AdminCharts 
        ratingsData={ratingsData}
        sentimentData={sentimentData}
        sentimentAnalysis={sentimentAnalysis}
      />
      
      {/* Feedback Table Component */}
      <FeedbackTable 
        currentItems={currentItems}
        filteredFeedbacks={filteredFeedbacks}
        searchTerm={searchTerm}
        handleDelete={handleDelete}
        handleArchive={handleArchive}
      />
      
      {/* Pagination Component */}
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        paginate={paginate}
        indexOfFirstItem={indexOfFirstItem}
        indexOfLastItem={indexOfLastItem}
        filteredFeedbacks={filteredFeedbacks}
      />
    </div>
  );
}

export default AdminPanel;