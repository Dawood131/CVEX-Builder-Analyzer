// src/features/auth/pages/ResetPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import PasswordStrength from "../components/PasswordStrength";
import { cn } from "../../../utils/helper";

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25"/>
      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { resetPassword, authError, clearError } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [done,     setDone]     = useState(false);

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    clearError();
    const e = {};
    if (!password || password.length < 8) e.password = "Min 8 characters";
    if (confirm !== password)             e.confirm  = "Passwords don't match";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    const { error } = await resetPassword(password);
    setLoading(false);
    if (!error) {
      setDone(true);
      setTimeout(() => navigate("/auth/login"), 2500);
    }
  };

  // Success state
  if (done) {
    return (
      <AuthLayout title="Password updated!" subtitle="Redirecting you to sign in…">
        <div className="flex justify-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
            <svg width="26" height="26" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </AuthLayout>
    );
  }

  const inputCls = (hasError) => cn(
    "w-full h-10 px-3.5 pr-10 rounded-xl border text-sm transition-all",
    "bg-[var(--surface-50)] text-[var(--surface-900)] placeholder-[var(--surface-400)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)]",
    hasError ? "border-red-400" : "border-[var(--surface-300)]"
  );

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password">

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {authError && (
          <div className="px-3.5 py-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs text-red-700 font-medium">{authError}</p>
          </div>
        )}

        {/* New password */}
        <div>
          <label className="block text-xs font-semibold text-[var(--surface-700)] mb-1.5">
            New password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
              placeholder="Min 8 characters"
              className={inputCls(errors.password)}
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--surface-400)] hover:text-[var(--surface-700)] cursor-pointer">
              <EyeIcon open={showPass} />
            </button>
          </div>
          <PasswordStrength password={password} />
          {errors.password && <p className="text-[11px] text-red-600 mt-1">{errors.password}</p>}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-xs font-semibold text-[var(--surface-700)] mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              type={showConf ? "text" : "password"}
              autoComplete="new-password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })); }}
              placeholder="Repeat password"
              className={inputCls(errors.confirm)}
            />
            <button type="button" onClick={() => setShowConf(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--surface-400)] hover:text-[var(--surface-700)] cursor-pointer">
              <EyeIcon open={showConf} />
            </button>
          </div>
          {errors.confirm && <p className="text-[11px] text-red-600 mt-1">{errors.confirm}</p>}
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
          {loading ? <><Spinner />Updating…</> : "Update password"}
        </button>

      </form>
    </AuthLayout>
  );
}