import React from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './PerformanceInsights.css';

const PerformanceInsights = ({ 
  filteredFeedbacks, 
  averages, 
  sentimentAnalysis, 
  recommendRate, 
  recommendCount, 
  keyThemes, 
  actionableInsights, 
  trendData,
  topStrength,
  improvementArea
}) => {
  const sentimentData = [
    { name: 'Positive', value: parseFloat(sentimentAnalysis.positive), color: '#10b981' },
    { name: 'Neutral', value: parseFloat(sentimentAnalysis.neutral), color: '#6b7280' },
    { name: 'Negative', value: parseFloat(sentimentAnalysis.negative), color: '#ef4444' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          <p className="tooltip-value">
            {`Rating: ${payload[0].value} / 5`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
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
              <i className="bx bx-trending-up"></i>
              <span>Based on {filteredFeedbacks.length} reviews</span>
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
              <i className="bx bx-user-check"></i>
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
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="#14b8a6" 
                  fill="url(#colorGradient)" 
                  strokeWidth={3}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
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
                  stroke="url(#strengthGradient)"
                  strokeWidth="3"
                  strokeDasharray={`${(parseFloat(averages[topStrength.name.toLowerCase()]) / 5) * 100}, 100`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="strengthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
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
                  stroke="url(#improvementGradient)"
                  strokeWidth="3"
                  strokeDasharray={`${(parseFloat(averages[improvementArea.name.toLowerCase()]) / 5) * 100}, 100`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="improvementGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
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
  );
};

export default PerformanceInsights;