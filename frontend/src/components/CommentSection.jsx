import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Send, Shield, User, MessageSquare, AlertCircle } from 'lucide-react';

export const CommentSection = ({ ticketId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tickets/${ticketId}/comments`);
      setComments(res.data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchComments();
    }
  }, [ticketId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setError('');
    try {
      setSubmitting(true);
      const res = await api.post(`/tickets/${ticketId}/comments`, {
        comment: newComment.trim()
      });

      if (res.data && res.data.comment) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
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

  return (
    <div className="comments-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <MessageSquare size={20} color="#2563eb" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
          Conversation History ({comments.length})
        </h3>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', color: '#64748b' }}>
          <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>Loading conversation history...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="empty-state" style={{ padding: '2rem 1rem' }}>
          <p>No comments or responses yet. Start the conversation below.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {comments.map((c) => {
            const isAgent = c.user_role === 'agent';
            return (
              <div
                key={c.id}
                className={`comment-card ${isAgent ? 'agent-response' : ''}`}
              >
                <div className="comment-header">
                  <div className="comment-author">
                    {isAgent ? (
                      <Shield size={14} color="#2563eb" />
                    ) : (
                      <User size={14} color="#64748b" />
                    )}
                    <span>{c.user_name}</span>
                    <span
                      className="badge"
                      style={{
                        fontSize: '0.7rem',
                        backgroundColor: isAgent ? '#dbeafe' : '#f1f5f9',
                        color: isAgent ? '#1e40af' : '#475569'
                      }}
                    >
                      {isAgent ? 'Support Agent' : 'Customer'}
                    </span>
                  </div>
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <div className="comment-body">{c.comment}</div>
              </div>
            );
          })}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">
            {user?.role === 'agent' ? 'Add Support Response' : 'Reply / Add Comment'}
          </label>
          <textarea
            placeholder={
              user?.role === 'agent'
                ? 'Type your official response to the customer...'
                : 'Add additional details or reply to support...'
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="form-control"
            rows={3}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !newComment.trim()}
          >
            <Send size={16} />
            <span>{submitting ? 'Posting...' : 'Send Message'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
