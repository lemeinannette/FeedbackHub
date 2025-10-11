// src/components/AdminPanel.js

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./AdminPanel.css";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function AdminPanel({ 
  setIsAdminLoggedIn, 
  previousRoute, 
  setPreviousRoute,
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

    const saved = JSON.parse(localStorage.getItem("feedbacks")) || [];
    console.log("Loaded feedbacks:", saved);
    setFeedbacks(saved);
  }, [navigate, setIsAdminLoggedIn]);

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
        const type = f.type || '';
        
        return (
          name.toLowerCase().includes(lowerSearchTerm) ||
          email.toLowerCase().includes(lowerSearchTerm) ||
          event.toLowerCase().includes(lowerSearchTerm) ||
          comments.toLowerCase().includes(lowerSearchTerm) ||
          type.toLowerCase().includes(lowerSearchTerm)
        );
      });
    }
    
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
  }, [feedbacks, showArchived, searchTerm, timeFilter, customStartDate, customEndDate]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredFeedbacks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);

  const updateStorage = (newData) => {
    setFeedbacks(newData);
    localStorage.setItem("feedbacks", JSON.stringify(newData));
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const recommendCount = filteredFeedbacks.filter(
    (f) => f.recommend === "Yes"
  ).length;

  const recommendRate = filteredFeedbacks.length
    ? ((recommendCount / filteredFeedbacks.length) * 100).toFixed(1)
    : 0;

  const average = (key) =>
    filteredFeedbacks.length
      ? (
          filteredFeedbacks.reduce((sum, f) => sum + Number(f[key] || 0), 0) /
          filteredFeedbacks.length
        ).toFixed(1)
      : 0;

  const averages = {
    food: average("food"),
    ambience: average("ambience"),
    service: average("service"),
    overall: average("overall"),
  };

  const calculateTrend = (key) => {
    if (timeFilter === 'all') return null;
    
    const now = new Date();
    let currentPeriod, previousPeriod;
    
    if (timeFilter === '7days') {
      currentPeriod = filteredFeedbacks.filter(f => {
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
      currentPeriod = filteredFeedbacks.filter(f => {
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

  const recommendData = [
    { name: 'Would Recommend', value: recommendCount, color: '#4CAF50' },
    { name: 'Would Not Recommend', value: filteredFeedbacks.length - recommendCount, color: '#F44336' }
  ];

  const ratingsData = [
    { name: 'Food', rating: parseFloat(averages.food) },
    { name: 'Ambience', rating: parseFloat(averages.ambience) },
    { name: 'Service', rating: parseFloat(averages.service) },
    { name: 'Overall', rating: parseFloat(averages.overall) }
  ];

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    localStorage.removeItem("adminExpires");
    setIsAdminLoggedIn(false);
    navigate("/admin-login");
  };

  const handleExportPDF = () => {
    if (filteredFeedbacks.length === 0) {
      alert("No data available to export for the current filter settings.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Company Logo (placeholder - replace with actual logo if available)
    const logoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // Professional Header with Logo
    doc.setFillColor(25, 55, 109); // Dark blue professional color
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Add logo placeholder (if you have a logo, replace this)
    doc.addImage(logoUrl, 'PNG', 14, 10, 30, 30);
    
    // Company name and report title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text("Feedback Analytics Report", pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text("Customer Experience Management System", pageWidth / 2, 35, { align: 'center' });
    
    // Report metadata
    doc.setFontSize(10);
    doc.text(`Report ID: FB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`, pageWidth / 2, 45, { align: 'center' });
    
    // Executive Summary Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Executive Summary", 14, 75);
    
    // Draw a line under the section title
    doc.setDrawColor(25, 55, 109);
    doc.setLineWidth(0.5);
    doc.line(14, 78, pageWidth - 14, 78);
    
    // Summary statistics in professional boxes
    const summaryY = 90;
    const boxWidth = 50;
    const boxHeight = 35;
    const boxSpacing = 10;
    const startX = 14;
    
    // Total feedback box
    doc.setFillColor(25, 55, 109);
    doc.roundedRect(startX, summaryY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text("Total Responses", startX + boxWidth/2, summaryY + 12, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(filteredFeedbacks.length.toString(), startX + boxWidth/2, summaryY + 25, { align: 'center' });
    
    // Recommendation rate box
    doc.setFillColor(76, 175, 80);
    doc.roundedRect(startX + boxWidth + boxSpacing, summaryY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text("Recommendation Rate", startX + boxWidth + boxSpacing + boxWidth/2, summaryY + 12, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(`${recommendRate}%`, startX + boxWidth + boxSpacing + boxWidth/2, summaryY + 25, { align: 'center' });
    
    // Average rating box
    doc.setFillColor(255, 152, 0);
    doc.roundedRect(startX + 2*(boxWidth + boxSpacing), summaryY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text("Average Rating", startX + 2*(boxWidth + boxSpacing) + boxWidth/2, summaryY + 12, { align: 'center' });
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(averages.overall, startX + 2*(boxWidth + boxSpacing) + boxWidth/2, summaryY + 25, { align: 'center' });
    
    // Report Period box
    doc.setFillColor(103, 58, 183);
    doc.roundedRect(startX + 3*(boxWidth + boxSpacing), summaryY, boxWidth, boxHeight, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text("Report Period", startX + 3*(boxWidth + boxSpacing) + boxWidth/2, summaryY + 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    const periodText = getTimeFilterLabel().length > 15 ? 
      getTimeFilterLabel().substring(0, 15) + "..." : 
      getTimeFilterLabel();
    doc.text(periodText, startX + 3*(boxWidth + boxSpacing) + boxWidth/2, summaryY + 25, { align: 'center' });
    
    // Performance Metrics Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Performance Metrics", 14, summaryY + boxHeight + 20);
    
    // Draw a line under the section title
    doc.setDrawColor(25, 55, 109);
    doc.setLineWidth(0.5);
    doc.line(14, summaryY + boxHeight + 23, pageWidth - 14, summaryY + boxHeight + 23);
    
    // Category ratings with visual indicators
    const metricsY = summaryY + boxHeight + 35;
    const metricsData = [
      { name: 'Food Quality', value: averages.food, color: [76, 175, 80] },
      { name: 'Ambience', value: averages.ambience, color: [33, 150, 243] },
      { name: 'Service', value: averages.service, color: [255, 152, 0] },
      { name: 'Overall Experience', value: averages.overall, color: [156, 39, 176] }
    ];
    
    metricsData.forEach((metric, index) => {
      const y = metricsY + (index * 25);
      
      // Metric name
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(metric.name, 14, y);
      
      // Rating bar background
      doc.setFillColor(230, 230, 230);
      doc.rect(100, y - 7, 80, 10, 'F');
      
      // Rating bar fill
      doc.setFillColor(...metric.color);
      const fillWidth = (parseFloat(metric.value) / 5) * 80;
      doc.rect(100, y - 7, fillWidth, 10, 'F');
      
      // Rating value
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(metric.value + '/5.0', 190, y);
      
      // Trend indicator if available
      const trendKey = metric.name.toLowerCase().replace(' quality', '').replace(' experience', '');
      const trend = trends[trendKey === 'food' ? 'food' : 
                        trendKey === 'ambience' ? 'ambience' : 
                        trendKey === 'service' ? 'service' : 'overall'];
      
      if (trend) {
        // Fixed the ternary operator issue by using an if statement
        if (trend.isPositive) {
          doc.setTextColor(76, 175, 80);
        } else {
          doc.setTextColor(244, 67, 54);
        }
        doc.setFontSize(10);
        doc.text(`${trend.isPositive ? '↑' : '↓'} ${trend.value}%`, 210, y);
      }
    });
    
    // Detailed Feedback Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text("Detailed Feedback Analysis", 14, metricsY + (metricsData.length * 25) + 15);
    
    // Draw a line under the section title
    doc.setDrawColor(25, 55, 109);
    doc.setLineWidth(0.5);
    doc.line(14, metricsY + (metricsData.length * 25) + 18, pageWidth - 14, metricsY + (metricsData.length * 25) + 18);
    
    // Report metadata
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, metricsY + (metricsData.length * 25) + 28);
    doc.text(`Filter: ${getTimeFilterLabel()}`, 14, metricsY + (metricsData.length * 25) + 35);
    doc.text(`Showing: ${showArchived ? 'All Feedback' : 'Active Feedback Only'}`, 14, metricsY + (metricsData.length * 25) + 42);
    if (searchTerm.trim()) {
      doc.text(`Search: "${searchTerm}"`, 14, metricsY + (metricsData.length * 25) + 49);
    }
    
    // Define table columns with proper widths
    const tableColumns = [
      { header: 'Date', dataKey: 'date', width: 22 },
      { header: 'Name', dataKey: 'name', width: 28 },
      { header: 'Email', dataKey: 'email', width: 35 },
      { header: 'Contact', dataKey: 'contact', width: 25 },
      { header: 'Event', dataKey: 'event', width: 28 },
      { header: 'Food', dataKey: 'food', width: 15 },
      { header: 'Ambience', dataKey: 'ambience', width: 20 },
      { header: 'Service', dataKey: 'service', width: 20 },
      { header: 'Overall', dataKey: 'overall', width: 20 },
      { header: 'Recommend', dataKey: 'recommend', width: 25 },
      { header: 'Comments', dataKey: 'comments', width: 'auto' }
    ];
    
    // Prepare data for the table with proper handling of missing values
    const tableData = filteredFeedbacks.map(feedback => ({
      date: feedback.date || 'N/A',
      name: feedback.name || 'N/A',
      email: feedback.email || 'N/A',
      contact: feedback.contact || 'N/A',
      event: feedback.event || 'N/A',
      food: feedback.food || 'N/A',
      ambience: feedback.ambience || 'N/A',
      service: feedback.service || 'N/A',
      overall: feedback.overall || 'N/A',
      recommend: feedback.recommend || 'No',
      comments: feedback.comments || 'No comments'
    }));
    
    // Add the table to the PDF with professional formatting
    autoTable(doc, {
      head: [tableColumns.map(col => col.header)],
      body: tableData.map(row => tableColumns.map(col => row[col.dataKey])),
      startY: metricsY + (metricsData.length * 25) + 60,
      theme: 'grid',
      headStyles: {
        fillColor: [25, 55, 109],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        textColor: 50,
        fontSize: 9,
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [245, 245, 250]
      },
      margin: { top: 10, bottom: 25 },
      styles: {
        fontSize: 9,
        cellPadding: 4,
        overflow: 'linebreak',
        cellWidth: 'wrap'
      },
      columnStyles: tableColumns.reduce((acc, col, index) => {
        acc[index] = { cellWidth: col.width };
        return acc;
      }, {}),
      didParseCell: function(data) {
        // Ensure comments column can wrap text
        if (data.column.dataKey === 'comments') {
          data.cell.styles.cellWidth = 'auto';
        }
        
        // Color code ratings
        if (['food', 'ambience', 'service', 'overall'].includes(data.column.dataKey)) {
          const value = parseFloat(data.cell.raw);
          if (value >= 4) {
            data.cell.styles.textColor = [76, 175, 80]; // Green for good ratings
          } else if (value >= 3) {
            data.cell.styles.textColor = [255, 152, 0]; // Orange for average ratings
          } else {
            data.cell.styles.textColor = [244, 67, 54]; // Red for poor ratings
          }
        }
        
        // Color code recommendation
        if (data.column.dataKey === 'recommend') {
          if (data.cell.raw === 'Yes') {
            data.cell.styles.textColor = [76, 175, 80]; // Green for yes
          } else {
            data.cell.styles.textColor = [244, 67, 54]; // Red for no
          }
        }
      },
      // Add page breaks if needed
      rowPageBreak: 'auto',
      // Add footers on each page
      didDrawPage: function(data) {
        // Footer with company info
        const pageCount = doc.internal.getNumberOfPages();
        
        // Footer line
        doc.setDrawColor(25, 55, 109);
        doc.setLineWidth(0.5);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        
        // Footer text
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`© ${new Date().getFullYear()} Customer Experience Management System | Confidential Report`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 30, pageHeight - 10, { align: 'center' });
      }
    });
    
    // Add final page with insights if there's space
    if (doc.internal.getNumberOfPages() === 1 || 
        (doc.autoTable.previous.finalY && doc.autoTable.previous.finalY < pageHeight - 100)) {
      doc.addPage();
      
      // Insights header
      doc.setFillColor(25, 55, 109);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text("Key Insights", pageWidth / 2, 25, { align: 'center' });
      
      // Insights content
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Performance Highlights", 14, 60);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      
      // Generate insights based on data
      const insights = [];
      
      // Best performing category
      const bestCategory = Object.keys(averages).reduce((a, b) => 
        parseFloat(averages[a]) > parseFloat(averages[b]) ? a : b
      );
      insights.push(`Highest rated category: ${bestCategory.charAt(0).toUpperCase() + bestCategory.slice(1)} (${averages[bestCategory]}/5.0)`);
      
      // Recommendation rate insight
      if (recommendRate >= 80) {
        insights.push(`Excellent recommendation rate of ${recommendRate}% indicates high customer satisfaction`);
      } else if (recommendRate >= 60) {
        insights.push(`Moderate recommendation rate of ${recommendRate}% suggests room for improvement`);
      } else {
        insights.push(`Low recommendation rate of ${recommendRate}% requires immediate attention`);
      }
      
      // Trend insights
      const positiveTrends = Object.keys(trends).filter(key => trends[key] && trends[key].isPositive).length;
      const negativeTrends = Object.keys(trends).filter(key => trends[key] && !trends[key].isPositive).length;
      
      if (positiveTrends > negativeTrends) {
        insights.push(`Positive trends observed in ${positiveTrends} categories compared to previous period`);
      } else if (negativeTrends > positiveTrends) {
        insights.push(`Negative trends observed in ${negativeTrends} categories compared to previous period`);
      }
      
      // Add insights to PDF
      insights.forEach((insight, index) => {
        const y = 80 + (index * 15);
        doc.text(`• ${insight}`, 14, y);
      });
      
      // Recommendations section
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Recommendations", 14, 80 + (insights.length * 15) + 10);
      
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      
      // Generate recommendations based on data
      const recommendations = [];
      
      // Find lowest rated category
      const lowestCategory = Object.keys(averages).reduce((a, b) => 
        parseFloat(averages[a]) < parseFloat(averages[b]) ? a : b
      );
      recommendations.push(`Focus on improving ${lowestCategory} which has the lowest rating (${averages[lowestCategory]}/5.0)`);
      
      // Comments analysis
      const negativeComments = filteredFeedbacks.filter(f => 
        f.comments && (
          f.comments.toLowerCase().includes('poor') ||
          f.comments.toLowerCase().includes('bad') ||
          f.comments.toLowerCase().includes('disappointed') ||
          f.comments.toLowerCase().includes('slow')
        )
      ).length;
      
      if (negativeComments > 0) {
        recommendations.push(`Address ${negativeComments} negative comments to improve overall satisfaction`);
      }
      
      // Add recommendations to PDF
      recommendations.forEach((recommendation, index) => {
        const y = 100 + (insights.length * 15) + (index * 15);
        doc.text(`• ${recommendation}`, 14, y);
      });
      
      // Footer
      doc.setDrawColor(25, 55, 109);
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`© ${new Date().getFullYear()} Customer Experience Management System | Confidential Report`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      doc.text(`Page ${doc.internal.getNumberOfPages()} of ${doc.internal.getNumberOfPages()}`, pageWidth - 30, pageHeight - 10, { align: 'center' });
    }
    
    const fileName = `feedback-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, timeFilter, customStartDate, customEndDate, showArchived]);

  return (
    <div className={`admin-container ${adminDarkMode ? 'dark-mode' : ''}`}>
      <div className="header">
        <h1>Admin Dashboard</h1>
        <div className="header-buttons">
          <button
            className={`theme-toggle-button ${adminDarkMode ? 'active' : ''}`}
            onClick={toggleAdminTheme}
            aria-label="Toggle admin dark mode"
            title="Toggle Admin Panel Theme"
          >
            <span className="toggle-slider"></span>
            <i className={`bx ${adminDarkMode ? 'bx-sun' : 'bx-moon'} theme-icon`}></i>
          </button>
          <button onClick={handleLogout} className="button logout-btn">
            Logout
          </button>
          <button onClick={handleExportPDF} className="button export-btn">
            Export PDF
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="button archive-toggle"
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
        </div>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <input 
              type="text" 
              placeholder="Search feedback by name, email, event, or comments..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
                title="Clear search"
              >
                Clear
              </button>
            )}
          </div>
          <div className="time-filter-dropdown">
            <button 
              className="time-filter-button"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              <span>{getTimeFilterLabel()}</span>
              {showDatePicker ? '▲' : '▼'}
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
        {searchTerm && (
          <div className="search-results-info">
            Found {filteredFeedbacks.length} result{filteredFeedbacks.length !== 1 ? 's' : ''} for "{searchTerm}"
          </div>
        )}
      </div>

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

      <div className="top-section">
        <div className="card summary">
          <h2>Summary</h2>
          <p><strong>Total Feedback:</strong> {filteredFeedbacks.length}</p>
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
          {filteredFeedbacks.slice(-3).reverse().map((f, i) => (
            <div key={i} className="activity-item">
              <div className="activity-header">
                <strong>{f.name}</strong>
                <span className="activity-meta">{new Date(f.date).toLocaleTimeString()}</span>
              </div>
              <p>left a {f.overall}-star review</p>
              {f.comments && (
                <p className="activity-comment">"{f.comments}"</p>
              )}
            </div>
          ))}
        </div>
      </div>

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
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="12" className="empty">
                  {searchTerm.trim() ? "No feedback found matching your search criteria." : "No feedback available"}
                </td>
              </tr>
            ) : (
              currentItems.map((f, index) => (
                <tr key={index} className={index % 2 === 0 ? "even" : "odd"}>
                  <td>{f.date}</td>
                  <td>{f.name}</td>
                  <td>{f.email || "N/A"}</td>
                  <td>{f.contact || "N/A"}</td>
                  <td>{f.event}</td>
                  <td>{f.food || "N/A"}</td>
                  <td>{f.ambience || "N/A"}</td>
                  <td>{f.service || "N/A"}</td>
                  <td>{f.overall || "N/A"}</td>
                  <td>{f.recommend || "No"}</td>
                  <td>{f.comments || "No comments"}</td>
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

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;