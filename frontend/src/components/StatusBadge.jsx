import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStatusClass = (s) => {
    switch (s) {
      case 'Open':
        return 'badge-status-open';
      case 'In Progress':
        return 'badge-status-in-progress';
      case 'Resolved':
        return 'badge-status-resolved';
      case 'Closed':
        return 'badge-status-closed';
      default:
        return 'badge-status-open';
    }
  };

  return (
    <span className={`badge ${getStatusClass(status)}`}>
      <span style={{ fontSize: '10px' }}>●</span>
      {status || 'Open'}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const getPriorityClass = (p) => {
    switch (p) {
      case 'Low':
        return 'badge-priority-low';
      case 'Medium':
        return 'badge-priority-medium';
      case 'High':
        return 'badge-priority-high';
      case 'Urgent':
        return 'badge-priority-urgent';
      default:
        return 'badge-priority-medium';
    }
  };

  return (
    <span className={`badge ${getPriorityClass(priority)}`}>
      {priority || 'Medium'}
    </span>
  );
};
