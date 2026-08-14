import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--ink-base)', color: 'var(--ink-text)' }}>
        <div className="w-10 h-10 border-4 border-ink-border border-t-ink-accent rounded-full animate-spin mb-4" style={{ borderColor: 'var(--ink-border)', borderTopColor: 'var(--ink-accent)' }}></div>
        <p className="text-sm font-medium tracking-wide" style={{ color: 'var(--ink-muted)' }}>Verifying CivicLens authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's assigned role dashboard if role mismatch
    if (user.role === 'CITIZEN') return <Navigate to="/citizen/dashboard" replace />;
    if (user.role === 'CONTRACTOR') return <Navigate to="/contractor/dashboard" replace />;
    if (user.role === 'GOVERNMENT_ADMIN' || user.role === 'CIVICLENS_ADMIN') return <Navigate to="/government/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};
