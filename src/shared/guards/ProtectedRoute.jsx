// src/shared/guards/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function AuthLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-[var(--surface-50)]">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin w-8 h-8 text-[var(--brand-500)]" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <p className="text-sm text-[var(--surface-500)] font-medium">Loading…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { user, loading, isRecoveryMode } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoader />;

  if (user && !isRecoveryMode) {
    const from = location.state?.from?.pathname || "/";
    return <Navigate to={from} replace />;
  }

  return children;
}