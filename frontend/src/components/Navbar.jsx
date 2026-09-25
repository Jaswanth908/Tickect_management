import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Ticket, LogOut, User as UserIcon, Shield } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    return user.role === 'agent' ? '/agent-dashboard' : '/dashboard';
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={getDashboardLink()} className="navbar-brand">
          <Ticket size={24} color="#2563eb" />
          <span>SupportDesk</span>
        </Link>

        {isAuthenticated && user && (
          <div className="navbar-user">
            <div className="user-tag">
              <span className="user-name">{user.name}</span>
              <span className="user-role-badge">
                {user.role === 'agent' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <Shield size={10} /> Agent
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <UserIcon size={10} /> Customer
                  </span>
                )}
              </span>
            </div>

            <button onClick={handleLogout} className="btn btn-secondary" title="Logout" style={{ padding: '0.45rem 0.8rem' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
