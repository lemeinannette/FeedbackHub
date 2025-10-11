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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

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

  const handleExportPDF = async () => {
    if (filteredFeedbacks.length === 0) {
      alert("No data available to export for the current filter settings.");
      return;
    }

    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Professional header with gradient effect
      doc.setFillColor(25, 55, 109);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Add subtle gradient effect
      for(let i = 0; i < 40; i++) {
        const opacity = 1 - (i / 40) * 0.7;
        doc.setFillColor(25, 55, 109, opacity);
        doc.rect(0, i, pageWidth, 1, 'F');
      }
      
      // Company branding
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text("FeedbackHub Analytics", 20, 20);
      
      // Report title
      doc.setFontSize(16);
      doc.setFont(undefined, 'normal');
      doc.text("Customer Experience Report", 20, 30);
      
      // Report metadata
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth - 20, 20, { align: 'right' });
      doc.text(`Report ID: FB-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`, pageWidth - 20, 30, { align: 'right' });
      
      let currentY = 55;
      
      // Executive Summary section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text("Executive Summary", 14, currentY);
      currentY += 10;
      
      // Add a professional line under the section title
      doc.setDrawColor(25, 55, 109);
      doc.setLineWidth(0.5);
      doc.line(14, currentY, pageWidth - 14, currentY);
      currentY += 15;
      
      // Summary statistics with enhanced styling
      const statsBoxWidth = 50;
      const statsBoxHeight = 35;
      const statsBoxSpacing = 15;
      const statsStartX = 14;
      
      // Total feedback box
      doc.setFillColor(25, 55, 109);
      doc.roundedRect(statsStartX, currentY, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Total Responses", statsStartX + statsBoxWidth/2, currentY + 12, { align: 'center' });
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(filteredFeedbacks.length.toString(), statsStartX + statsBoxWidth/2, currentY + 25, { align: 'center' });
      
      // Recommendation rate box
      doc.setFillColor(76, 175, 80);
      doc.roundedRect(statsStartX + statsBoxWidth + statsBoxSpacing, currentY, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Recommendation", statsStartX + statsBoxWidth + statsBoxSpacing + statsBoxWidth/2, currentY + 12, { align: 'center' });
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(`${recommendRate}%`, statsStartX + statsBoxWidth + statsBoxSpacing + statsBoxWidth/2, currentY + 25, { align: 'center' });
      
      // Average rating box
      doc.setFillColor(255, 152, 0);
      doc.roundedRect(statsStartX + 2*(statsBoxWidth + statsBoxSpacing), currentY, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Average Rating", statsStartX + 2*(statsBoxWidth + statsBoxSpacing) + statsBoxWidth/2, currentY + 12, { align: 'center' });
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(averages.overall, statsStartX + 2*(statsBoxWidth + statsBoxSpacing) + statsBoxWidth/2, currentY + 25, { align: 'center' });
      
      // Report Period box
      doc.setFillColor(103, 58, 183);
      doc.roundedRect(statsStartX + 3*(statsBoxWidth + statsBoxSpacing), currentY, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text("Report Period", statsStartX + 3*(statsBoxWidth + statsBoxSpacing) + statsBoxWidth/2, currentY + 12, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      const periodText = getTimeFilterLabel().length > 12 ? 
        getTimeFilterLabel().substring(0, 12) + "..." : 
        getTimeFilterLabel();
      doc.text(periodText, statsStartX + 3*(statsBoxWidth + statsBoxSpacing) + statsBoxWidth/2, currentY + 25, { align: 'center' });
      
      currentY += statsBoxHeight + 25;
      
      // Category Ratings section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text("Category Ratings", 14, currentY);
      currentY += 10;
      
      // Add a professional line under the section title
      doc.setDrawColor(25, 55, 109);
      doc.setLineWidth(0.5);
      doc.line(14, currentY, pageWidth - 14, currentY);
      currentY += 15;
      
      // Enhanced bar chart for ratings
      const categories = [
        { name: 'Food', value: parseFloat(averages.food), color: [76, 175, 80] },
        { name: 'Ambience', value: parseFloat(averages.ambience), color: [33, 150, 243] },
        { name: 'Service', value: parseFloat(averages.service), color: [255, 152, 0] },
        { name: 'Overall', value: parseFloat(averages.overall), color: [156, 39, 176] }
      ];
      
      // Chart dimensions
      const chartX = 14;
      const chartY = currentY;
      const chartWidth = pageWidth - 28;
      const chartHeight = 70;
      const barWidth = 35;
      const barSpacing = (chartWidth - (barWidth * categories.length)) / (categories.length + 1);
      const maxRating = 5;
      
      // Draw chart background with subtle gradient
      doc.setFillColor(245, 245, 245);
      doc.rect(chartX, chartY, chartWidth, chartHeight, 'F');
      
      // Draw chart border
      doc.setDrawColor(200, 200, 200);
      doc.rect(chartX, chartY, chartWidth, chartHeight);
      
      // Draw grid lines
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.5);
      for (let i = 1; i <= 5; i++) {
        const y = chartY + chartHeight - (i * chartHeight / 5);
        doc.line(chartX, y, chartX + chartWidth, y);
      }
      
      // Draw axes
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(1);
      doc.line(chartX, chartY, chartX, chartY + chartHeight);
      doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight);
      
      // Draw bars with gradient effect
      categories.forEach((category, index) => {
        const barX = chartX + barSpacing + (index * (barWidth + barSpacing));
        const barHeight = (category.value / maxRating) * chartHeight;
        const barY = chartY + chartHeight - barHeight;
        
        // Draw bar with gradient effect
        for(let i = 0; i < barHeight; i++) {
          const opacity = 1 - (i / barHeight) * 0.3;
          doc.setFillColor(...category.color, opacity);
          doc.rect(barX, barY + i, barWidth, 1, 'F');
        }
        
        // Draw value on top of bar
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(category.value.toString(), barX + barWidth/2, barY - 5, { align: 'center' });
        
        // Draw category name below bar
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(category.name, barX + barWidth/2, chartY + chartHeight + 8, { align: 'center' });
        
        // Draw trend indicator if available
        const trend = trends[category.name.toLowerCase()];
        if (trend) {
          if (trend.isPositive) {
            doc.setTextColor(76, 175, 80);
          } else {
            doc.setTextColor(244, 67, 54);
          }
          doc.setFontSize(9);
          doc.text(`${trend.isPositive ? '↑' : '↓'} ${trend.value}%`, barX + barWidth/2, chartY + chartHeight + 18, { align: 'center' });
        }
      });
      
      // Draw Y-axis labels
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      for (let i = 0; i <= 5; i++) {
        const y = chartY + chartHeight - (i * chartHeight / 5);
        doc.text(i.toString(), chartX - 5, y, { align: 'right' });
      }
      
      // Draw Y-axis title
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text("Rating", chartX - 15, chartY + chartHeight/2, { align: 'center' });
      
      currentY += chartHeight + 30;
      
      // Feedback Details section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text("Feedback Details", 14, currentY);
      currentY += 10;
      
      // Add a professional line under the section title
      doc.setDrawColor(25, 55, 109);
      doc.setLineWidth(0.5);
      doc.line(14, currentY, pageWidth - 14, currentY);
      currentY += 15;
      
      // Define table columns with proper widths for landscape
      const tableColumns = [
        { header: 'Date', dataKey: 'date', width: 20 },
        { header: 'Name', dataKey: 'name', width: 25 },
        { header: 'Email', dataKey: 'email', width: 30 },
        { header: 'Contact', dataKey: 'contact', width: 25 },
        { header: 'Event', dataKey: 'event', width: 25 },
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
        startY: currentY,
        theme: 'grid',
        headStyles: {
          fillColor: [25, 55, 109],
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 9
        },
        bodyStyles: {
          textColor: 50,
          fontSize: 8,
          lineColor: [200, 200, 200],
          lineWidth: 0.1
        },
        alternateRowStyles: {
          fillColor: [245, 245, 250]
        },
        margin: { top: 10, bottom: 20 },
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: 'linebreak',
          cellWidth: 'wrap',
          minCellHeight: 10
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
          doc.text(`© ${new Date().getFullYear()} FeedbackHub - Customer Experience Management System | Confidential Report`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          doc.text(`Page ${data.pageNumber} of ${pageCount}`, pageWidth - 30, pageHeight - 10, { align: 'center' });
          
          // Add company name to footer
          doc.setTextColor(25, 55, 109);
          doc.setFontSize(8);
          doc.setFont(undefined, 'bold');
          doc.text("FeedbackHub", 20, pageHeight - 10);
        }
      });
      
      // Generate a unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const fileName = `feedback-report-${timestamp}.pdf`;
      
      // Save the PDF
      doc.save(fileName);
      
      // Show success message
      setTimeout(() => {
        setIsGeneratingPDF(false);
      }, 500);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGeneratingPDF(false);
      
      // Show error message with details
      alert(`Failed to generate PDF report. Error: ${error.message || "Unknown error occurred"}`);
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
        <div className="header-left">
          <h1>Feedback Analytics Dashboard</h1>
          <p className="header-subtitle">Customer Experience Management System</p>
        </div>
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
            <i className="bx bx-log-out"></i>
            Logout
          </button>
          <button 
            onClick={handleExportPDF} 
            className={`button export-btn ${isGeneratingPDF ? 'loading' : ''}`}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? (
              <>
                <span className="spinner"></span>
                Generating PDF...
              </>
            ) : (
              <>
                <i className="bx bx-file-pdf"></i>
                Export PDF
              </>
            )}
          </button>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="button archive-toggle"
          >
            <i className={`bx ${showArchived ? 'bx-archive-out' : 'bx-archive-in'}`}></i>
            {showArchived ? "Hide Archived" : "Show Archived"}
          </button>
        </div>
      </div>

      <div className="search-section">
        <div className="search-bar">
          <div className="search-input-wrapper">
            <i className="bx bx-search search-icon"></i>
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
                <i className="bx bx-x"></i>
              </button>
            )}
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
      </div>

      <div className="metrics-section">
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bx bx-message-square-detail"></i>
          </div>
          <div className="metric-content">
            <h3>Total Feedback</h3>
            <p className="metric-value">{filteredFeedbacks.length}</p>
            <div className="metric-change positive">
              <i className="bx bx-up-arrow-alt"></i>
              <span>12% from last period</span>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bx bx-like"></i>
          </div>
          <div className="metric-content">
            <h3>Recommendation Rate</h3>
            <p className="metric-value">{recommendRate}%</p>
            <div className="metric-change positive">
              <i className="bx bx-up-arrow-alt"></i>
              <span>5% from last period</span>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bx bx-star"></i>
          </div>
          <div className="metric-content">
            <h3>Average Rating</h3>
            <p className="metric-value">{averages.overall}</p>
            <div className="metric-change negative">
              <i className="bx bx-down-arrow-alt"></i>
              <span>2% from last period</span>
            </div>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">
            <i className="bx bx-calendar-check"></i>
          </div>
          <div className="metric-content">
            <h3>Report Period</h3>
            <p className="metric-value">{getTimeFilterLabel()}</p>
            <div className="metric-change neutral">
              <i className="bx bx-minus"></i>
              <span>Current selection</span>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <div className="chart-container">
          <div className="chart-header">
            <h2>Recommendation Rate</h2>
            <div className="chart-actions">
              <button className="chart-action-btn">
                <i className="bx bx-download"></i>
              </button>
              <button className="chart-action-btn">
                <i className="bx bx-expand"></i>
              </button>
            </div>
          </div>
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
          <div className="chart-header">
            <h2>Rating Comparison</h2>
            <div className="chart-actions">
              <button className="chart-action-btn">
                <i className="bx bx-download"></i>
              </button>
              <button className="chart-action-btn">
                <i className="bx bx-expand"></i>
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ratingsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="rating" fill="#19376D" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="top-section">
        <div className="card summary">
          <div className="card-header">
            <h2>Summary</h2>
            <i className="bx bx-dots-horizontal-rounded card-menu"></i>
          </div>
          <div className="card-content">
            <div className="summary-item">
              <span className="summary-label">Total Feedback:</span>
              <span className="summary-value">{filteredFeedbacks.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Recommend (Yes):</span>
              <span className="summary-value">{recommendCount}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Recommendation Rate:</span>
              <span className="summary-value">{recommendRate}%</span>
            </div>
          </div>
        </div>
        <div className="card averages">
          <div className="card-header">
            <h2>Average Ratings</h2>
            <i className="bx bx-dots-horizontal-rounded card-menu"></i>
          </div>
          <div className="card-content">
            <div className="ratings-visualization">
              {[
                { name: 'Food', value: averages.food, icon: 'bx-restaurant', color: '#4CAF50' },
                { name: 'Ambience', value: averages.ambience, icon: 'bx-palette', color: '#2196F3' },
                { name: 'Service', value: averages.service, icon: 'bx-user-voice', color: '#FF9800' },
                { name: 'Overall', value: averages.overall, icon: 'bx-star', color: '#9C27B0' }
              ].map((category, index) => (
                <div key={index} className="rating-category">
                  <div className="rating-header">
                    <div className="rating-info">
                      <i className={`bx ${category.icon} rating-icon`}></i>
                      <span className="rating-name">{category.name}</span>
                    </div>
                    <div className="rating-score">
                      <span className="score-value">{category.value}</span>
                      <div className="score-stars">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`bx ${i < Math.floor(category.value) ? 'bxs-star' : 'bx-star'}`}></i>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rating-progress">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(category.value / 5) * 100}%`,
                        backgroundColor: category.color
                      }}
                    ></div>
                  </div>
                  {trends[category.name.toLowerCase()] && (
                    <div className={`rating-trend ${trends[category.name.toLowerCase()].isPositive ? 'positive' : 'negative'}`}>
                      <i className={`bx ${trends[category.name.toLowerCase()].isPositive ? 'bx-trending-up' : 'bx-trending-down'}`}></i>
                      <span>{trends[category.name.toLowerCase()].value}% from last period</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card activity">
          <div className="card-header">
            <h2>Recent Activity</h2>
            <i className="bx bx-dots-horizontal-rounded card-menu"></i>
          </div>
          <div className="card-content">
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
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>Feedback Details</h2>
          <div className="table-actions">
            <button className="table-action-btn">
              <i className="bx bx-filter"></i>
              Filter
            </button>
            <button className="table-action-btn">
              <i className="bx bx-sort"></i>
              Sort
            </button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              {[
                "Date", "Name/Group", "Email", "Contact", "Event",
                "Food", "Ambience", "Service", "Overall",
                "Recommend", "Comments", "Actions"
              ].map((h) => (
                <th key={h}>
                  {h}
                  <i className="bx bx-chevron-down"></i>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr>
                <td colSpan="12" className="empty">
                  <i className="bx bx-inbox"></i>
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
            className="pagination-btn"
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
            className="pagination-btn"
          >
            Next
            <i className="bx bx-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;