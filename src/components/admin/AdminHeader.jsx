import React from 'react';
import './AdminHeader.css';

const AdminHeader = ({ 
  adminDarkMode, 
  toggleAdminTheme, 
  handleLogout, 
  handleExportPDF, 
  isGeneratingPDF, 
  showExportTooltip, 
  setShowExportTooltip,
  showArchived,
  setShowArchived
}) => {
  return (
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
            <i className="bx bx-log-out-circle"></i>
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
  );
};

export default AdminHeader;