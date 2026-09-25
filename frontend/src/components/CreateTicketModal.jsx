import React, { useState } from 'react';
import api from '../api/axios';
import { X, PlusCircle, AlertCircle } from 'lucide-react';

export const CreateTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!subject.trim()) {
      setError('Please enter a ticket subject.');
      return;
    }

    if (!description.trim()) {
      setError('Please enter a detailed description of your issue.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/tickets', {
        subject: subject.trim(),
        description: description.trim(),
        priority
      });

      if (res.data && res.data.ticket) {
        onTicketCreated(res.data.ticket);
        setSubject('');
        setDescription('');
        setPriority('Medium');
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlusCircle size={22} color="#2563eb" />
            Create Support Ticket
          </h2>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input
              type="text"
              placeholder="e.g. Unable to connect to VPN gateway"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="form-control"
              maxLength={255}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="form-control"
            >
              <option value="Low">Low - General inquiry / minor</option>
              <option value="Medium">Medium - Normal priority issue</option>
              <option value="High">High - Impairing core operations</option>
              <option value="Urgent">Urgent - Critical business outage</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              placeholder="Describe your issue or question in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
              rows={4}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
