import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import { Calendar, User, ShieldCheck } from 'lucide-react';

export const TicketCard = ({ ticket, showCustomer = false }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ticket-card" onClick={() => navigate(`/tickets/${ticket.id}`)}>
      <div className="ticket-card-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#64748b' }}>
            #{ticket.id}
          </span>
          <h3 className="ticket-title">{ticket.subject}</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>

      <p className="ticket-desc">{ticket.description}</p>

      <div className="ticket-meta">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {showCustomer && ticket.customer_name && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <User size={14} color="#64748b" />
              <span>{ticket.customer_name}</span>
            </span>
          )}

          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} color="#64748b" />
            <span>{formatDate(ticket.created_at)}</span>
          </span>
        </div>

        <div>
          {ticket.assigned_agent_name ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#1d4ed8' }}>
              <ShieldCheck size={14} />
              <span>Assigned: {ticket.assigned_agent_name}</span>
            </span>
          ) : (
            <span style={{ color: '#94a3b8' }}>Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};
