import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { TicketCard } from '../components/TicketCard';
import { FilterBar } from '../components/FilterBar';
import { CreateTicketModal } from '../components/CreateTicketModal';
import { PlusCircle, Ticket, AlertCircle } from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const res = await api.get('/tickets', { params });
      setTickets(res.data.tickets || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch your tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, search]);

  const handleTicketCreated = (newTicket) => {
    setTickets((prev) => [newTicket, ...prev]);
  };

  return (
    <div className="main-content">
      <div className="tickets-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>
            My Support Tickets
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '2px' }}>
            Track and manage your submitted support requests
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <PlusCircle size={18} />
          <span>New Support Ticket</span>
        </button>
      </div>

      <FilterBar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        showSort={false}
      />

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading your tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <Ticket size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
          <h3>No tickets found</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.25rem' }}>
            {search || statusFilter || priorityFilter
              ? 'No tickets match the selected filters.'
              : "You haven't submitted any support tickets yet."}
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <PlusCircle size={18} />
            <span>Create Your First Ticket</span>
          </button>
        </div>
      ) : (
        <div className="tickets-list">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} showCustomer={false} />
          ))}
        </div>
      )}

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
};
