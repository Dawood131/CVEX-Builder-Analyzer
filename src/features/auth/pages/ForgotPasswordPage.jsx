// src/features/auth/pages/ForgotPasswordPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { cn } from "../../../utils/helper";

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function ForgotPasswordPage() {
  const { forgotPassword, authError, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    clearError();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setError("Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    const { error: err } = await forgotPassword(email);
    setLoading(false);
    if (!err) setSent(true);
  };

  useEffect(() => {
    clearError();
  }, []);

  // Success state
  if (sent) {
    return (
      <AuthLayout title="Check your inbox" subtitle={`Reset link sent to ${email}`}>
        <div className="flex flex-col items-center gap-4 py-2 text-center">

          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
            <svg width="26" height="26" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-xs text-[var(--surface-500)] leading-relaxed max-w-[260px]">
            Click the link in the email to reset your password. Check spam folder if you don't see it.
          </p>

          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="text-xs text-[var(--brand-600)] hover:underline font-medium cursor-pointer"
          >
            Resend email
          </button>
        </div>

        <p className="text-center text-xs text-[var(--surface-500)] mt-4">
          <Link to="/auth/login" className="text-[var(--brand-600)] font-semibold hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send a reset link"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {(error || authError) && (
          <div className="px-3.5 py-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs text-red-700 font-medium">{error || authError}</p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[var(--surface-700)] mb-1.5">
            Email address
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(""); }}
            placeholder="you@example.com"
            className={cn(
              "w-full h-10 px-3.5 rounded-xl border text-sm transition-all",
              "bg-[var(--surface-50)] text-[var(--surface-900)] placeholder-[var(--surface-400)]",
              "focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)]",
              error ? "border-red-400" : "border-[var(--surface-300)]"
            )}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-10 rounded-xl font-bold text-sm text-white",
            "flex items-center justify-center gap-2 border-none cursor-pointer",
            "transition-all duration-150",
            loading ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:-translate-y-0.5"
          )}
          style={{ background: "linear-gradient(135deg, var(--brand-500), #8b5cf6)" }}
        >
          {loading ? <><Spinner />Sending…</> : "Send reset link"}
        </button>

      </form>

      <p className="text-center text-xs text-[var(--surface-500)] mt-5">
        <Link to="/auth/login" className="text-[var(--brand-600)] font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}