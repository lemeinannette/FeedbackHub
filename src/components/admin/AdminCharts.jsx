import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './AdminCharts.css';

const AdminCharts = ({ 
  ratingsData, 
  sentimentData, 
  sentimentAnalysis 
}) => {
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

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <section className="charts-section">
      <div className="chart-container">
        <div className="chart-header">
          <h2 className="chart-title">Category Ratings</h2>
          <div className="chart-badge">Average Scores</div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={ratingsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#64748b', fontSize: 14 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              domain={[0, 5]} 
              tick={{ fill: '#64748b', fontSize: 14 }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="rating" 
              fill="url(#barGradient)" 
              radius={[12, 12, 0, 0]}
              animationDuration={1000}
            >
              {ratingsData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={1} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={1} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="chart-container">
        <div className="chart-header">
          <h2 className="chart-title">Sentiment Distribution</h2>
          <div className="chart-badge">{sentimentAnalysis.total} analyzed</div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={sentimentData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {sentimentData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => (
                <span style={{ color: '#64748b', fontSize: 14 }}>
                  {entry.name}: {value}%
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default AdminCharts;