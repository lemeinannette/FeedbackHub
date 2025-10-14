// src/components/AdminPanel.jsx
/*
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPanel.css";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, Area, AreaChart } from 'recharts';

function AdminPanel({ 
  setIsAdminLoggedIn, 
  adminDarkMode,
  toggleAdminTheme
}) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'radar'
  const [notification, setNotification] = useState(null);
  const [showExportTooltip, setShowExportTooltip] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const expiresAt = parseInt(localStorage.getItem("adminExpires"), 10);
    if (!expiresAt || Date.now() > expiresAt) {
      localStorage.removeItem("isAdminLoggedIn");
      localStorage.removeItem("adminExpires");
      setIsAdminLoggedIn(false);
      navigate("/admin-login");
      return;
    }

    try {
      const saved = JSON.parse(localStorage.getItem("feedbacks")) || [];
      setFeedbacks(saved);
    } catch (error) {
      console.error("Error loading feedbacks:", error);
      setFeedbacks([]);
    }
  }, [navigate, setIsAdminLoggedIn]);

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

  // Move the average function definition here, before it's used
  const average = (key) => {
    if (!filteredFeedbacks.length) return "0.0";
    const sum = filteredFeedbacks.reduce((sum, f) => {
      const val = parseFloat(f[key]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    return (sum / filteredFeedbacks.length).toFixed(1);
  };

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  const updateStorage = (newData) => {
    try {
      setFeedbacks(newData);
      localStorage.setItem("feedbacks", JSON.stringify(newData));
    } catch (error) {
      console.error("Error saving feedbacks:", error);
    }
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

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

  // Consistent purple color scheme for charts - using the same shade for all bars
  const chartColors = {
    primary: '#8b5cf6',      // Purple-500 - matching Food and Ambience bars
    secondary: '#8b5cf6',    // Same shade for consistency
    tertiary: '#8b5cf6',     // Same shade for consistency
    quaternary: '#8b5cf6',   // Same shade for consistency
    success: '#059669',
    danger: '#dc2626',
    neutral: '#e5e7eb'
  };

  // Enhanced data for charts with consistent purple colors
  const recommendData = [
    { name: 'Would Recommend', value: recommendCount, color: chartColors.success },
    { name: 'Would Not Recommend', value: notRecommendCount, color: chartColors.danger }
  ];

  // Consistent purple ratings data for bar chart - all bars use the same shade
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

  // Data for radar chart
  const radarData = [
    { category: 'Food', value: parseFloat(averages.food) || 0, fullMark: 5 },
    { category: 'Ambience', value: parseFloat(averages.ambience) || 0, fullMark: 5 },
    { category: 'Service', value: parseFloat(averages.service) || 0, fullMark: 5 },
    { category: 'Overall', value: parseFloat(averages.overall) || 0, fullMark: 5 }
  ];

  // Sentiment data for pie chart
  const sentimentData = [
    { name: 'Positive', value: parseFloat(sentimentAnalysis.positive), color: '#059669' },
    { name: 'Neutral', value: parseFloat(sentimentAnalysis.neutral), color: '#6b7280' },
    { name: 'Negative', value: parseFloat(sentimentAnalysis.negative), color: '#dc2626' }
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminExpires");
    setIsAdminLoggedIn(false);
    navigate("/admin-login");
  };

  // Helper function to validate and return a safe number
  const safeNumber = (value, defaultValue = 0) => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Function to generate a proper bar chart for PDF with consistent purple colors
  const generateBarChartForPDF = () => {
    const maxRating = 5;
    const chartHeight = 250;
    const chartWidth = 400;
    const barWidth = 60;
    const barSpacing = 40;
    const startX = 60;
    const startY = 30;
    
    const categories = [
      { name: 'Food', value: parseFloat(averages.food) || 0, color: chartColors.primary },
      { name: 'Ambience', value: parseFloat(averages.ambience) || 0, color: chartColors.primary },
      { name: 'Service', value: parseFloat(averages.service) || 0, color: chartColors.primary },
      { name: 'Overall', value: parseFloat(averages.overall) || 0, color: chartColors.primary }
    ];
    
    let svgContent = `
      <svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg">
        <!-- Grid lines -->
        ${[0, 1, 2, 3, 4, 5].map(i => `
          <line x1="${startX}" y1="${startY + (chartHeight - 60) * (1 - i/maxRating)}" 
                x2="${chartWidth - 20}" y2="${startY + (chartHeight - 60) * (1 - i/maxRating)}" 
                stroke="#e5e7eb" stroke-width="1"/>
          <text x="${startX - 10}" y="${startY + (chartHeight - 60) * (1 - i/maxRating) + 5}" 
                text-anchor="end" font-size="12" fill="#6b7280">${i}</text>
        `).join('')}
        
        <!-- Y-axis -->
        <line x1="${startX}" y1="${startY}" x2="${startX}" y2="${startY + chartHeight - 60}" 
              stroke="#374151" stroke-width="2"/>
        
        <!-- X-axis -->
        <line x1="${startX}" y1="${startY + chartHeight - 60}" x2="${chartWidth - 20}" y2="${startY + chartHeight - 60}" 
              stroke="#374151" stroke-width="2"/>
        
        <!-- Bars -->
        ${categories.map((cat, index) => {
          const barHeight = (cat.value / maxRating) * (chartHeight - 60);
          const x = startX + 20 + index * (barWidth + barSpacing);
          const y = startY + (chartHeight - 60) - barHeight;
          
          return `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" 
                  fill="${cat.color}" rx="4" ry="4"/>
            <text x="${x + barWidth/2}" y="${y - 5}" text-anchor="middle" 
                  font-size="14" font-weight="bold" fill="#1f2937">${cat.value}</text>
            <text x="${x + barWidth/2}" y="${startY + chartHeight - 45}" text-anchor="middle" 
                  font-size="12" fill="#4b5563">${cat.name}</text>
          `;
        }).join('')}
        
        <!-- Y-axis label -->
        <text x="15" y="${startY + (chartHeight - 60)/2}" text-anchor="middle" 
              font-size="12" fill="#4b5563" transform="rotate(-90 15 ${startY + (chartHeight - 60)/2})">Rating</text>
      </svg>
    `;
    
    return svgContent;
  };

  // Calculate trend data (mock data for demonstration)
  const calculateTrend = (currentValue, previousValue) => {
    if (!previousValue) return { trend: 'neutral', value: 0 };
    const change = ((currentValue - previousValue) / previousValue) * 100;
    return {
      trend: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
      value: Math.abs(change).toFixed(1)
    };
  };

  // Mock previous period data (in real app, this would come from historical data)
  const previousPeriodData = {
    totalFeedback: Math.max(0, filteredFeedbacks.length - Math.floor(Math.random() * 5)),
    recommendRate: Math.max(0, parseFloat(recommendRate) - Math.random() * 10),
    averageRating: Math.max(0, parseFloat(averages.overall) - Math.random() * 0.5)
  };

  const trends = {
    totalFeedback: calculateTrend(filteredFeedbacks.length, previousPeriodData.totalFeedback),
    recommendRate: calculateTrend(parseFloat(recommendRate), previousPeriodData.recommendRate),
    averageRating: calculateTrend(parseFloat(averages.overall), previousPeriodData.averageRating)
  };

  // Show notification function
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
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
              font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
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
            
            /* Export Instructions */
            .export-instructions {
              background: #f0f9ff;
              border: 1px solid #bae6fd;
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 30px;
            }
            
            .export-instructions h3 {
              color: #0369a1;
              font-size: 16px;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .export-instructions ol {
              margin-left: 20px;
              color: #0c4a6e;
            }
            
            .export-instructions li {
              margin-bottom: 6px;
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
            
            .summary-trend {
              font-size: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            }
            
            .trend-positive {
              color: #10b981;
            }
            
            .trend-negative {
              color: #ef4444;
            }
            
            .trend-neutral {
              color: #64748b;
            }
            
            .summary-text {
              font-size: 14px;
              color: #475569;
              line-height: 1.6;
              margin-top: 20px;
            }
            
            /* Key Insights */
            .key-insights {
              margin-bottom: 30px;
            }
            
            .key-insights h2 {
              font-size: 24px;
              color: #1e293b;
              margin-bottom: 20px;
              font-weight: 600;
            }
            
            .insights-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 20px;
            }
            
            .insight-card {
              background: white;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              border-left: 4px solid #8b5cf6;
            }
            
            .insight-card.strength {
              border-left-color: #059669;
            }
            
            .insight-card.improvement {
              border-left-color: #d97706;
            }
            
            .insight-card.sentiment {
              border-left-color: #0891b2;
            }
            
            .insight-title {
              font-size: 16px;
              font-weight: 600;
              color: #1e293b;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .insight-value {
              font-size: 24px;
              font-weight: 700;
              color: #1e293b;
              margin-bottom: 10px;
            }
            
            .insight-description {
              font-size: 14px;
              color: #64748b;
              line-height: 1.5;
            }
            
            /* Charts Section */
            .charts-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            
            .chart-container {
              background: white;
              border-radius: 8px;
              padding: 20px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            }
            
            .chart-title {
              font-size: 18px;
              color: #1e293b;
              margin-bottom: 20px;
              font-weight: 600;
              text-align: center;
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
            
            /* Recommendations Section */
            .recommendations-section {
              background: #f0f9ff;
              border-radius: 12px;
              padding: 30px;
              margin-bottom: 30px;
              border-left: 4px solid #0891b2;
            }
            
            .recommendations-section h2 {
              font-size: 24px;
              color: #1e293b;
              margin-bottom: 20px;
              font-weight: 600;
            }
            
            .recommendation-list {
              list-style: none;
            }
            
            .recommendation-list li {
              padding: 10px 0;
              padding-left: 30px;
              position: relative;
              font-size: 14px;
              color: #475569;
              line-height: 1.6;
            }
            
            .recommendation-list li:before {
              content: "→";
              position: absolute;
              left: 0;
              color: #0891b2;
              font-weight: bold;
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
              .charts-section {
                page-break-inside: avoid;
              }
              
              .insights-grid {
                page-break-inside: avoid;
              }
              
              .feedback-table-section {
                page-break-inside: avoid;
              }
              
              .export-instructions {
                display: none;
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
            
            <!-- Export Instructions -->
            <div class="export-instructions">
              <h3><i class="bx bx-info-circle"></i> How to Save This Report as PDF</h3>
              <ol>
                <li>Press <strong>Ctrl+P</strong> (Windows) or <strong>Cmd+P</strong> (Mac) to open the print dialog</li>
                <li>In the destination/printer field, select <strong>"Save as PDF"</strong> or <strong>"Microsoft Print to PDF"</strong></li>
                <li>Adjust any settings as needed (layout, margins, etc.)</li>
                <li>Click <strong>"Save"</strong> and choose a location to save your PDF report</li>
              </ol>
            </div>
            
            <!-- Executive Summary -->
            <div class="executive-summary">
              <h2>Executive Summary</h2>
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-value">${filteredFeedbacks.length}</div>
                  <div class="summary-label">Total Feedback</div>
                  <div class="summary-trend trend-${trends.totalFeedback.trend}">
                    <i class="bx bx-${trends.totalFeedback.trend === 'positive' ? 'up-arrow' : trends.totalFeedback.trend === 'negative' ? 'down-arrow' : 'minus'}"></i>
                    <span>${trends.totalFeedback.value}% from last period</span>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${recommendRate}%</div>
                  <div class="summary-label">Recommendation Rate</div>
                  <div class="summary-trend trend-${trends.recommendRate.trend}">
                    <i class="bx bx-${trends.recommendRate.trend === 'positive' ? 'up-arrow' : trends.recommendRate.trend === 'negative' ? 'down-arrow' : 'minus'}"></i>
                    <span>${trends.recommendRate.value}% from last period</span>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${averages.overall}</div>
                  <div class="summary-label">Average Rating</div>
                  <div class="summary-trend trend-${trends.averageRating.trend}">
                    <i class="bx bx-${trends.averageRating.trend === 'positive' ? 'up-arrow' : trends.averageRating.trend === 'negative' ? 'down-arrow' : 'minus'}"></i>
                    <span>${trends.averageRating.value}% from last period</span>
                  </div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${recommendCount}</div>
                  <div class="summary-label">Positive Responses</div>
                  <div class="summary-trend trend-neutral">
                    <i class="bx bx-smile"></i>
                    <span>${parseFloat(recommendRate) > 50 ? 'Positive' : 'Needs Improvement'} Sentiment</span>
                  </div>
                </div>
              </div>
              <div class="summary-text">
                <strong>Overview:</strong> This report provides a comprehensive analysis of customer feedback collected during ${getTimeFilterLabel()}. 
                With ${filteredFeedbacks.length} responses and a ${recommendRate}% recommendation rate, 
                ${parseFloat(recommendRate) > 50 ? 'customer sentiment appears positive' : 'there is room for improvement in customer satisfaction'}. 
                The overall rating of ${averages.overall}/5 indicates ${parseFloat(averages.overall) > 3 ? 'satisfactory' : 'below satisfactory'} performance.
              </div>
            </div>
            
            <!-- Key Insights -->
            <div class="key-insights">
              <h2>Key Insights</h2>
              <div class="insights-grid">
                <div class="insight-card strength">
                  <div class="insight-title">
                    <i class="bx bx-trophy"></i>
                    Top Strength
                  </div>
                  <div class="insight-value">${averages.food}/5</div>
                  <div class="insight-description">
                    Food quality emerges as the strongest performer with an average rating of ${averages.food}/5. 
                    This indicates excellence in culinary offerings and should be maintained as a competitive advantage.
                  </div>
                </div>
                
                <div class="insight-card improvement">
                  <div class="insight-title">
                    <i class="bx bx-trending-up"></i>
                    Improvement Area
                  </div>
                  <div class="insight-value">${averages.service}/5</div>
                  <div class="insight-description">
                    Service quality shows the most opportunity for improvement with a rating of ${averages.service}/5. 
                    Focus on staff training and service standards could significantly impact overall satisfaction.
                  </div>
                </div>
                
                <div class="insight-card sentiment">
                  <div class="insight-title">
                    <i class="bx bx-smile"></i>
                    Customer Sentiment
                  </div>
                  <div class="insight-value">${recommendRate}%</div>
                  <div class="insight-description">
                    Customer sentiment is ${parseFloat(recommendRate) > 50 ? 'positive' : 'neutral'} with ${recommendRate}% of customers willing to recommend. 
                    ${parseFloat(recommendRate) < 70 ? 'Implementing improvements could boost this metric significantly.' : 'This indicates strong brand loyalty.'}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Charts Section -->
            <div class="charts-section">
              <div class="chart-container">
                <div class="chart-title">Recommendation Distribution</div>
                <div style="display: flex; justify-content: center; align-items: center; height: 250px;">
                  <div style="text-align: center;">
                    <div style="font-size: 48px; font-weight: 600; color: #059669; margin-bottom: 10px;">${recommendRate}%</div>
                    <div style="font-size: 16px; color: #64748b; margin-bottom: 20px;">Would Recommend</div>
                    <div style="display: flex; justify-content: center; gap: 30px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; background: #059669; border-radius: 2px;"></div>
                        <span style="font-size: 14px; color: #475569;">Yes (${recommendCount})</span>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <div style="width: 12px; height: 12px; background: #dc2626; border-radius: 2px;"></div>
                        <span style="font-size: 14px; color: #475569;">No (${notRecommendCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="chart-container">
                <div class="chart-title">Category Performance</div>
                <div style="display: flex; justify-content: center; align-items: center; height: 250px;">
                  ${generateBarChartForPDF()}
                </div>
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
            
            <!-- Recommendations Section -->
            <div class="recommendations-section">
              <h2>Recommendations</h2>
              <ul class="recommendation-list">
                <li>Maintain high standards in food quality as it's the strongest performing category (${averages.food}/5)</li>
                <li>Implement targeted service training programs to improve service ratings (${averages.service}/5)</li>
                <li>Focus on enhancing the overall customer experience to increase recommendation rates</li>
                <li>Regular monitoring of ambience factors to ensure consistent experience (${averages.ambience}/5)</li>
                <li>Consider implementing a customer loyalty program to leverage positive sentiment</li>
                <li>Address negative feedback promptly to prevent potential reputation impact</li>
                <li>Establish monthly feedback review meetings to track progress and identify trends</li>
              </ul>
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

  const handleDelete = (feedback) => {
    const actualIndex = feedbacks.findIndex(f => f === feedback);
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      const updated = feedbacks.filter((_, i) => i !== actualIndex);
      updateStorage(updated);
      
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  const handleArchive = (feedback) => {
    const actualIndex = feedbacks.findIndex(f => f === feedback);
    const updated = [...feedbacks];
    updated[actualIndex].archived = !updated[actualIndex].archived;
    updateStorage(updated);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, timeFilter, customStartDate, customEndDate, showArchived]);

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-value">
            {`Rating: ${payload[0].value} / 5`}
          </p>
          <p className="tooltip-percentage">
            {`${((payload[0].value / 5) * 100).toFixed(0)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Determine top strength and improvement area dynamically
  const topStrength = useMemo(() => {
    const categories = [
      { name: 'Food', value: parseFloat(averages.food) || 0 },
      { name: 'Ambience', value: parseFloat(averages.ambience) || 0 },
      { name: 'Service', value: parseFloat(averages.service) || 0 },
      { name: 'Overall', value: parseFloat(averages.overall) || 0 }
    ];
    return categories.reduce((max, cat) => cat.value > max.value ? cat : max);
  }, [averages]);

  const improvementArea = useMemo(() => {
    const categories = [
      { name: 'Food', value: parseFloat(averages.food) || 0 },
      { name: 'Ambience', value: parseFloat(averages.ambience) || 0 },
      { name: 'Service', value: parseFloat(averages.service) || 0 },
      { name: 'Overall', value: parseFloat(averages.overall) || 0 }
    ];
    return categories.reduce((min, cat) => cat.value < min.value ? cat : min);
  }, [averages]);

  return (
    <div className={`admin-container ${adminDarkMode ? 'dark-mode' : ''}`}>
      {/* Notification Component */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          <div className="notification-content">
            <i className={`bx bx-${notification.type === 'success' ? 'check-circle' : notification.type === 'error' ? 'error-circle' : 'info-circle'}`}></i>
            <span>{notification.message}</span>
            <button className="notification-close" onClick={() => setNotification(null)}>
              <i className="bx bx-x"></i>
            </button>
          </div>
        </div>
      )}
      
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">Feedback Analytics Dashboard</h1>
            <p className="dashboard-subtitle">Real-time Customer Experience Management</p>
          </div>
          <div className="header-actions">
            <button
              className={`theme-toggle-button ${adminDarkMode ? 'active' : ''}`}
              onClick={toggleAdminTheme}
              aria-label="Toggle admin dark mode"
              title="Toggle Admin Panel Theme"
            >
              <span className="toggle-slider"></span>
              <i className={`bx ${adminDarkMode ? 'bx-sun' : 'bx-moon'} theme-icon`}></i>
            </button>
            <button onClick={handleLogout} className="btn btn-logout">
              <i className="bx bx-log-out"></i>
              Logout
            </button>
            <div className="export-button-container">
              <button 
                onClick={handleExportPDF} 
                className={`btn btn-export ${isGeneratingPDF ? 'loading' : ''}`}
                disabled={isGeneratingPDF}
                onMouseEnter={() => setShowExportTooltip(true)}
                onMouseLeave={() => setShowExportTooltip(false)}
              >
                {isGeneratingPDF ? (
                  <>
                    <span className="spinner"></span>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <i className="bx bx-file-pdf"></i>
                    Export Report
                  </>
                )}
              </button>
              {showExportTooltip && (
                <div className="export-tooltip">
                  <div className="tooltip-content">
                    <h4>Export Instructions</h4>
                    <p>After clicking, a new window will open with your report. Use Ctrl+P (or Cmd+P) to save as PDF.</p>
                  </div>
                  <div className="tooltip-arrow"></div>
                </div>
              )}
            </div>
            <button
              onClick={() => setShowArchived(!showArchived)}
              className="btn btn-archive"
            >
              <i className={`bx ${showArchived ? 'bx-archive-out' : 'bx-archive-in'}`}></i>
              {showArchived ? "Hide Archived" : "Show Archived"}
            </button>
          </div>
        </div>
      </header>

      <section className="filters-section">
        <div className="filters-container">
          <div className="search-container">
            <div className="search-input-wrapper">
              <i className="bx bx-search search-icon"></i>
              <input 
                type="text" 
                placeholder="Search feedback..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  <i className="bx bx-x"></i>
                </button>
              )}
            </div>
          </div>
          
          <div className="time-filter-container">
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
                  <i className="bx bx-time-five"></i>
                  All Time
                </button>
                <button 
                  className={timeFilter === '7days' ? 'active' : ''} 
                  onClick={() => { setTimeFilter('7days'); setShowDatePicker(false); }}
                >
                  <i className="bx bx-calendar-week"></i>
                  Last 7 Days
                </button>
                <button 
                  className={timeFilter === '30days' ? 'active' : ''} 
                  onClick={() => { setTimeFilter('30days'); setShowDatePicker(false); }}
                >
                  <i className="bx bx-calendar-month"></i>
                  Last 30 Days
                </button>
                <button 
                  className={timeFilter === 'custom' ? 'active' : ''} 
                  onClick={() => setTimeFilter('custom')}
                >
                  <i className="bx bx-calendar-edit"></i>
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
        {searchTerm && (
          <div className="search-results-info">
            <i className="bx bx-info-circle"></i>
            Found {filteredFeedbacks.length} result{filteredFeedbacks.length !== 1 ? 's' : ''} for "{searchTerm}"
          </div>
        )}
      </section>

      {/* Enhanced Performance Insights Section */}
      <section className="performance-insights-section">
        <div className="section-header">
          <h2 className="section-title">Performance Insights</h2>
          <p className="section-subtitle">Real-time analysis of {filteredFeedbacks.length} customer feedbacks</p>
        </div>
        
        {/* Summary Cards */}
        <div className="insights-summary-grid">
          <div className="summary-card overall-score">
            <div className="summary-icon">
              <i className="bx bx-star"></i>
            </div>
            <div className="summary-content">
              <h3>Overall Score</h3>
              <div className="score-value">{averages.overall}</div>
              <div className="score-max">/ 5.0</div>
              <div className="score-trend">
                <span className="trend-label">Based on {filteredFeedbacks.length} reviews</span>
              </div>
            </div>
          </div>
          
          <div className="summary-card sentiment-score">
            <div className="summary-icon">
              <i className="bx bx-smile"></i>
            </div>
            <div className="summary-content">
              <h3>Sentiment Score</h3>
              <div className="sentiment-value">{sentimentAnalysis.positive}%</div>
              <div className="sentiment-label">Positive</div>
              <div className="sentiment-breakdown">
                <div className="sentiment-bar positive" style={{width: `${sentimentAnalysis.positive}%`}}></div>
                <div className="sentiment-bar neutral" style={{width: `${sentimentAnalysis.neutral}%`}}></div>
                <div className="sentiment-bar negative" style={{width: `${sentimentAnalysis.negative}%`}}></div>
              </div>
            </div>
          </div>
          
          <div className="summary-card recommendation-score">
            <div className="summary-icon">
              <i className="bx bx-like"></i>
            </div>
            <div className="summary-content">
              <h3>Recommendation</h3>
              <div className="recommend-value">{recommendRate}%</div>
              <div className="recommend-label">Would Recommend</div>
              <div className="recommend-count">
                {recommendCount} out of {filteredFeedbacks.length}
              </div>
            </div>
          </div>
        </div>

        {/* Key Themes and Insights */}
        <div className="insights-detailed-grid">
          {/* Key Themes from Comments */}
          <div className="insight-card themes-card">
            <div className="insight-header">
              <div className="insight-icon">
                <i className="bx bx-chat"></i>
              </div>
              <div className="insight-title">Key Themes from Comments</div>
            </div>
            <div className="insight-content">
              <div className="themes-list">
                {keyThemes.map((theme, index) => (
                  <div key={index} className="theme-item">
                    <div className="theme-header">
                      <span className="theme-name">{theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}</span>
                      <span className="theme-count">{theme.count} mentions</span>
                    </div>
                    {theme.examples.length > 0 && (
                      <div className="theme-example">
                        "{theme.examples[0]}"
                      </div>
                    )}
                  </div>
                ))}
                {keyThemes.length === 0 && (
                  <div className="no-themes">
                    <i className="bx bx-info-circle"></i>
                    <span>Not enough data to analyze themes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Trend */}
          <div className="insight-card trend-card">
            <div className="insight-header">
              <div className="insight-icon">
                <i className="bx bx-trending-up"></i>
              </div>
              <div className="insight-title">7-Day Performance Trend</div>
            </div>
            <div className="insight-content">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
                  <YAxis domain={[0, 5]} tick={{ fill: '#64748b' }} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="rating" 
                    stroke="#14b8a6" 
                    fill="#14b8a6" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Actionable Insights */}
        <div className="actionable-insights">
          <div className="insights-header">
            <h3>AI-Powered Insights & Recommendations</h3>
            <span className="insights-subtitle">Automatically generated from your feedback data</span>
          </div>
          <div className="insights-list">
            {actionableInsights.map((insight, index) => (
              <div key={index} className={`insight-item ${insight.type}`}>
                <div className="insight-item-header">
                  <div className="insight-priority">
                    <span className={`priority-badge ${insight.priority}`}>
                      {insight.priority.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="insight-item-title">{insight.title}</h4>
                </div>
                <p className="insight-item-description">{insight.description}</p>
                <div className="insight-item-action">
                  <i className="bx bx-bullseye"></i>
                  <span>{insight.action}</span>
                </div>
              </div>
            ))}
            {actionableInsights.length === 0 && (
              <div className="no-insights">
                <i className="bx bx-check-circle"></i>
                <span>All metrics are performing well. Keep up the great work!</span>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Metrics Grid */}
        <div className="detailed-metrics-grid">
          <div className="metric-detailed-card">
            <div className="metric-header">
              <div className="metric-icon strength">
                <i className="bx bx-trophy"></i>
              </div>
              <div className="metric-info">
                <h4>Top Strength</h4>
                <p>{topStrength.name}</p>
              </div>
            </div>
            <div className="metric-visual">
              <div className="circular-progress">
                <svg viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="3"
                    strokeDasharray={`${(parseFloat(averages[topStrength.name.toLowerCase()]) / 5) * 100}, 100`}
                  />
                </svg>
                <div className="progress-value">{averages[topStrength.name.toLowerCase()]}</div>
              </div>
            </div>
          </div>

          <div className="metric-detailed-card">
            <div className="metric-header">
              <div className="metric-icon improvement">
                <i className="bx bx-trending-up"></i>
              </div>
              <div className="metric-info">
                <h4>Improvement Area</h4>
                <p>{improvementArea.name}</p>
              </div>
            </div>
            <div className="metric-visual">
              <div className="circular-progress">
                <svg viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#d97706"
                    strokeWidth="3"
                    strokeDasharray={`${(parseFloat(averages[improvementArea.name.toLowerCase()]) / 5) * 100}, 100`}
                  />
                </svg>
                <div className="progress-value">{averages[improvementArea.name.toLowerCase()]}</div>
              </div>
            </div>
          </div>

          <div className="metric-detailed-card">
            <div className="metric-header">
              <div className="metric-icon sentiment">
                <i className="bx bx-smile"></i>
              </div>
              <div className="metric-info">
                <h4>Customer Sentiment</h4>
                <p>Analysis</p>
              </div>
            </div>
            <div className="metric-visual">
              <div className="sentiment-donut">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Charts Section */}
      <section className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Category Ratings</h2>
            <div className="chart-badge">Average Scores</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fill: '#64748b' }} />
              <YAxis domain={[0, 5]} tick={{ fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="rating" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                {ratingsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="chart-container">
          <div className="chart-header">
            <h2 className="chart-title">Sentiment Distribution</h2>
            <div className="chart-badge">{sentimentAnalysis.total} analyzed</div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Feedback Table Section */}
      <section className="table-section">
        <div className="table-header">
          <h2 className="table-title">Recent Feedback</h2>
          <div className="table-info">
            Showing {Math.min(itemsPerPage, filteredFeedbacks.length)} of {filteredFeedbacks.length} entries
          </div>
        </div>
        <div className="table-container">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name/Group</th>
                <th>Event</th>
                <th>Food</th>
                <th>Ambience</th>
                <th>Service</th>
                <th>Overall</th>
                <th>Recommend</th>
                <th>Comments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="10" className="empty-state">
                    <i className="bx bx-inbox"></i>
                    {searchTerm.trim() ? "No feedback found matching your search criteria." : "No feedback available"}
                  </td>
                </tr>
              ) : (
                currentItems.map((f, index) => (
                  <tr key={index} className={index % 2 === 0 ? "even" : "odd"}>
                    <td>{f.date}</td>
                    <td>{f.name}</td>
                    <td>{f.event}</td>
                    <td>
                      <div className="rating-cell">
                        <span>{f.food || "N/A"}</span>
                        {f.food && (
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`bx ${i < Math.floor(f.food) ? 'bxs-star' : 'bx-star'}`}></i>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="rating-cell">
                        <span>{f.ambience || "N/A"}</span>
                        {f.ambience && (
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`bx ${i < Math.floor(f.ambience) ? 'bxs-star' : 'bx-star'}`}></i>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="rating-cell">
                        <span>{f.service || "N/A"}</span>
                        {f.service && (
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`bx ${i < Math.floor(f.service) ? 'bxs-star' : 'bx-star'}`}></i>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="rating-cell">
                        <span>{f.overall || "N/A"}</span>
                        {f.overall && (
                          <div className="rating-stars">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`bx ${i < Math.floor(f.overall) ? 'bxs-star' : 'bx-star'}`}></i>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`recommend-badge ${f.recommend === 'Yes' ? 'yes' : 'no'}`}>
                        {f.recommend || "No"}
                      </span>
                    </td>
                    <td className="comments-cell">
                      <div className="comment-text" title={f.comments}>
                        {f.comments || "No comments"}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(f)}
                          title="Delete feedback"
                        >
                          <i className="bx bx-trash"></i>
                        </button>
                        <button
                          className={`action-btn archive-btn ${f.archived ? 'archived' : ''}`}
                          onClick={() => handleArchive(f)}
                          title={f.archived ? "Unarchive feedback" : "Archive feedback"}
                        >
                          <i className={`bx ${f.archived ? 'bx-archive-out' : 'bx-archive-in'}`}></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <section className="pagination-section">
          <div className="pagination">
            <button 
              onClick={() => paginate(currentPage - 1)} 
              disabled={currentPage === 1}
              className="pagination-btn prev"
            >
              <i className="bx bx-chevron-left"></i>
              Previous
            </button>
            <div className="pagination-info">
              <span>Page {currentPage} of {totalPages}</span>
              <span className="pagination-count">
                ({indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredFeedbacks.length)} of {filteredFeedbacks.length})
              </span>
            </div>
            <button 
              onClick={() => paginate(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="pagination-btn next"
            >
              Next
              <i className="bx bx-chevron-right"></i>
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminPanel;
*/