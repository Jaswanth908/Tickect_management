import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { TicketCard } from '../components/TicketCard';
import { FilterBar } from '../components/FilterBar';
import { StatsCard } from '../components/StatsCard';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Layers,
  AlertCircle
} from 'lucide-react';

export const AgentDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    total_tickets: 0,
    open_tickets: 0,
    in_progress_tickets: 0,
    resolved_tickets: 0,
    closed_tickets: 0,
    urgent_tickets: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at_desc');

  const fetchStats = async () => {
    try {
      const res = await api.get('/tickets/stats');
      if (res.data && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.warn('Failed to load stats:', err);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      if (sortBy === 'created_at_desc') {
        params.sortBy = 'created_at';
        params.sortOrder = 'DESC';
      } else if (sortBy === 'created_at_asc') {
        params.sortBy = 'created_at';
        params.sortOrder = 'ASC';
      } else if (sortBy === 'priority_desc') {
        params.sortBy = 'priority';
        params.sortOrder = 'DESC';
      }

      const res = await api.get('/tickets', { params });
      setTickets(res.data.tickets || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, search, sortBy]);

  return (
    <div className="main-content">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
          Agent Command Center
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
          Overview of customer support queue, SLA response metrics, and ticket assignments
        </p>
      </div>

      {/* Ticket Metrics Cards */}
      <div className="stats-grid">
        <StatsCard
          title="Total Tickets"
          value={stats.total_tickets}
          icon={<Layers size={22} />}
          bg="#f1f5f9"
          color="#334155"
        />
        <StatsCard
          title="Open"
          value={stats.open_tickets}
          icon={<Inbox size={22} />}
          bg="#e0f2fe"
          color="#0284c7"
        />
        <StatsCard
          title="In Progress"
          value={stats.in_progress_tickets}
          icon={<Clock size={22} />}
          bg="#fef3c7"
          color="#d97706"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved_tickets}
          icon={<CheckCircle2 size={22} />}
          bg="#dcfce7"
          color="#16a34a"
        />
        <StatsCard
          title="Urgent"
          value={stats.urgent_tickets}
          icon={<AlertOctagon size={22} />}
          bg="#ffe4e6"
          color="#e11d48"
        />
      </div>

      {/* Filters & Sorting */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showSort={true}
      />

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Ticket List */}
      {loading ? (
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading support queue...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <h3>No tickets found</h3>
          <p style={{ marginTop: '0.5rem' }}>
            No tickets match your filter criteria or the queue is currently empty.
          </p>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showCustomer={true} />
          ))}
        </div>
      )}
    </div>
  );
};
