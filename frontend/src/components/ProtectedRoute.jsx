import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If role unauthorized, route to appropriate dashboard
    const fallback = user.role === 'agent' ? '/agent-dashboard' : '/dashboard';
    return <Navigate to={fallback} replace />;
  }

  return children;
};
