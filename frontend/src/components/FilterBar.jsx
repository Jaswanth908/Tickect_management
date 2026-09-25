import React from 'react';
import { Search, Filter } from 'lucide-react';

export const FilterBar = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  showSort = true
}) => {
  return (
    <div className="filter-bar">
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '10px', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search tickets by subject, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
          style={{ paddingLeft: '2.25rem' }}
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="filter-select"
      >
        <option value="">All Statuses</option>
        <option value="Open">Open</option>
        <option value="In Progress">In Progress</option>
        <option value="Resolved">Resolved</option>
        <option value="Closed">Closed</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => setPriorityFilter(e.target.value)}
        className="filter-select"
      >
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
        <option value="Urgent">Urgent</option>
      </select>

      {showSort && setSortBy && (
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="created_at_desc">Newest First</option>
          <option value="created_at_asc">Oldest First</option>
          <option value="priority_desc">Priority (High to Low)</option>
        </select>
      )}
    </div>
  );
};
