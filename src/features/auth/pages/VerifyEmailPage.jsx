// src/features/auth/pages/VerifyEmailPage.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import { cn } from "../../../utils/helper";

export default function VerifyEmailPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, forgotPassword } = useAuth();

  const email = location.state?.email || user?.email || "";

  const [resent,  setResent]  = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    await forgotPassword(email);
    setLoading(false);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="One last step before you get started"
    >
      <div className="flex flex-col items-center gap-5 py-2 text-center">

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-indigo-100 border border-indigo-300 flex items-center justify-center">
          <svg width="28" height="28" fill="none" stroke="#4f46e5" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Message */}
        <div>
          <p className="text-sm font-semibold text-[var(--surface-800)] mb-1.5">
            Check your inbox
          </p>
          {email && (
            <p className="text-xs text-[var(--surface-500)] leading-relaxed">
              We sent a confirmation link to<br />
              <span className="font-semibold text-[var(--surface-700)]">{email}</span>
            </p>
          )}
        </div>

        {/* Hint */}
        <div className="w-full px-3.5 py-3 rounded-xl bg-amber-50 border border-amber-200 text-left">
          <p className="text-[11px] text-amber-800 leading-relaxed">
            <span className="font-bold">Didn't receive it?</span> Check your spam folder, or resend below.
          </p>
        </div>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={loading || resent}
          className={cn(
            "w-full h-10 rounded-xl font-bold text-sm",
            "border border-[var(--surface-300)] bg-[var(--surface-50)]",
            "hover:bg-[var(--surface-100)] text-[var(--surface-800)]",
            "flex items-center justify-center gap-2 cursor-pointer transition-all",
            (loading || resent) && "opacity-60 cursor-not-allowed"
          )}
        >
          {resent ? (
            <>
              <svg width="14" height="14" fill="none" stroke="#16a34a" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Email sent!
            </>
          ) : loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Sending…
            </>
          ) : (
            "Resend confirmation email"
          )}
        </button>

        {/* Back to login */}
        <button
          onClick={() => navigate("/auth/login")}
          className="text-xs text-[var(--surface-400)] hover:text-[var(--surface-700)] cursor-pointer transition-colors"
        >
          Back to sign in
        </button>

      </div>
    </AuthLayout>
  );
}