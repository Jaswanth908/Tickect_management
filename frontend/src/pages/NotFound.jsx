import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="main-content">
      <div className="empty-state" style={{ padding: '4rem 1rem' }}>
        <HelpCircle size={56} color="#94a3b8" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>404 - Page Not Found</h2>
        <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link to="/login" className="btn btn-primary">
          <ArrowLeft size={16} />
          <span>Return to Portal</span>
        </Link>
      </div>
    </div>
  );
};
