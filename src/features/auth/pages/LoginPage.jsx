// src/features/auth/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import SocialAuthButtons from "../components/SocialAuthButtons";
import { cn } from "../../../utils/helper";

function EyeIcon({ open }) {
  return open ? (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" />
      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, authError, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || "/";

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    clearError();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    const { error } = await signIn({ email, password });
    setLoading(false);
    if (!error) navigate(from, { replace: true });
  };

  useEffect(() => {
    clearError();
  }, []);

  const inputCls = (hasError) => cn(
    "w-full h-10 px-3.5 rounded-xl border text-sm transition-all",
    "bg-[var(--surface-50)] text-[var(--surface-900)] placeholder-[var(--surface-400)]",
    "focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]/20 focus:border-[var(--brand-500)]",
    hasError ? "border-red-400" : "border-[var(--surface-300)]"
  );

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your CVEX account">

      <SocialAuthButtons />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Server error */}
        {authError && (
          <div className="px-3.5 py-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs text-red-700 font-medium">{authError}</p>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-[var(--surface-700)] mb-1.5">
            Email address
          </label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })); }}
            placeholder="you@example.com"
            className={inputCls(errors.email)}
          />
          {errors.email && <p className="text-[11px] text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-[var(--surface-700)]">Password</label>
            <Link to="/auth/forgot-password" className="text-[11px] text-[var(--brand-600)] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
              placeholder="••••••••"
              className={cn(inputCls(errors.password), "pr-10")}
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--surface-400)] hover:text-[var(--surface-700)] cursor-pointer">
              <EyeIcon open={showPass} />
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-red-600 mt-1">{errors.password}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full h-10 rounded-xl font-bold text-sm text-white",
            "flex items-center justify-center gap-2 border-none cursor-pointer",
            "transition-all duration-150",
            loading ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
          )}
          style={{ background: "linear-gradient(135deg, var(--brand-500), #8b5cf6)" }}
        >
          {loading ? <><Spinner />Signing in…</> : "Sign in"}
        </button>

      </form>

      <p className="text-center text-xs text-[var(--surface-500)] mt-5">
        Don't have an account?{" "}
        <Link to="/auth/signup" className="text-[var(--brand-600)] font-semibold hover:underline">
          Sign up
        </Link>
      </p>

    </AuthLayout>
  );
}