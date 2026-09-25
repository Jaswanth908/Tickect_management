import React from 'react';

export const StatsCard = ({ title, value, icon, bg = '#eff6ff', color = '#2563eb' }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ backgroundColor: bg, color: color }}>
        {icon}
      </div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
      </div>
    </div>
  );
};
