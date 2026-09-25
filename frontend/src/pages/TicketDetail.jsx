import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/StatusBadge';
import { CommentSection } from '../components/CommentSection';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Shield,
  Trash2,
  Check,
  AlertCircle
} from 'lucide-react';

export const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/tickets/${id}`);
      const t = res.data.ticket;
      setTicket(t);
      setStatus(t.status);
      setPriority(t.priority);
      setAssignedTo(t.assigned_to ? String(t.assigned_to) : '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load ticket details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    if (user?.role === 'agent') {
      try {
        const res = await api.get('/users?role=agent');
        setAgents(res.data.users || []);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicket();
      fetchAgents();
    }
  }, [id, user?.role]);

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      setUpdating(true);
      const payload = {
        status,
        priority,
        assigned_to: assignedTo ? parseInt(assignedTo, 10) : null
      };

      const res = await api.put(`/tickets/${id}`, payload);
      if (res.data && res.data.ticket) {
        setTicket(res.data.ticket);
        setSuccessMsg('Ticket updated successfully.');
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update ticket.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/tickets/${id}`);
      navigate(user?.role === 'agent' ? '/agent-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ticket.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="main-content">
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
        <button
          onClick={() => navigate(user?.role === 'agent' ? '/agent-dashboard' : '/dashboard')}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  const isAgent = user?.role === 'agent';

  return (
    <div className="main-content">
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate(isAgent ? '/agent-dashboard' : '/dashboard')}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success">
          <Check size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isAgent ? '2fr 1fr' : '1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                  TICKET #{ticket.id}
                </span>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '4px', color: '#0f172a' }}>
                  {ticket.subject}
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <PriorityBadge priority={ticket.priority} />
                <StatusBadge status={ticket.status} />
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: '#f8fafc', borderRadius: 'var(--radius-sm)', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.85rem', color: '#475569' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={15} color="#64748b" />
                <span>Customer: <strong>{ticket.customer_name}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={15} color="#64748b" />
                <span>{ticket.customer_email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#64748b" />
                <span>Created: {formatDate(ticket.created_at)}</span>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>
                Description
              </h3>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#1e293b' }}>
                {ticket.description}
              </p>
            </div>
          </div>

          <CommentSection ticketId={ticket.id} />
        </div>

        {isAgent && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="#2563eb" />
              Ticket Management
            </h3>

            <form onSubmit={handleUpdateTicket}>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="form-control"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="form-control"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Agent</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="form-control"
                >
                  <option value="">-- Unassigned --</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={updating}
              >
                {updating ? 'Saving changes...' : 'Save Updates'}
              </button>
            </form>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={handleDeleteTicket}
                className="btn btn-danger"
                style={{ width: '100%', fontSize: '0.85rem' }}
              >
                <Trash2 size={16} />
                <span>Delete Ticket</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
