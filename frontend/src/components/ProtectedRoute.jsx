import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-teal-400">
        <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-400 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium tracking-wide text-slate-400">Verifying CivicLens authentication...</p>
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
