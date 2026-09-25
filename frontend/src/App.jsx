import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AgentDashboard } from './pages/AgentDashboard';
import { TicketDetail } from './pages/TicketDetail';
import { NotFound } from './pages/NotFound';

// Root redirect handler based on auth state
const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === 'agent' ? '/agent-dashboard' : '/dashboard'} replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Root Route */}
            <Route path="/" element={<RootRedirect />} />

            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Customer Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Agent Routes */}
            <Route
              path="/agent-dashboard"
              element={
                <ProtectedRoute allowedRoles={['agent']}>
                  <AgentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Protected Shared Routes (Customer & Agent) */}
            <Route
              path="/tickets/:id"
              element={
                <ProtectedRoute allowedRoles={['customer', 'agent']}>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
