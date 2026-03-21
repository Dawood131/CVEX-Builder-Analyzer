// src/features/auth/pages/SignupPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import SocialAuthButtons from "../components/SocialAuthButtons";
import PasswordStrength from "../components/PasswordStrength";
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

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, authError, clearError } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Full name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Min 8 characters";
    if (confirm !== password) e.confirm = "Passwords don't match";
    if (!agreed) e.agreed = "You must agree to continue";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    clearError();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    const { error } = await signUp({ email, password, fullName });
    setLoading(false);
    if (!error) navigate("/auth/verify", { state: { email } });
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
    <AuthLayout title="Create your account" subtitle="Start building better CVs with AI">

      <SocialAuthButtons />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Server error */}
        {authError && (
          <div className="px-3.5 py-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-xs text-red-700 font-medium">{authError}</p>
          </div>
        )}

        {/* Full name */}
        <div>
          <label className="block text-xs font-semibold text-[var(--surface-700)] mb-1.5">
            Full name
          </label>
          <input
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={e => { setFullName(e.target.value); setErrors(p => ({ ...p, fullName: undefined })); }}
            placeholder="John Doe"
            className={inputCls(errors.fullName)}
          />
          {errors.fullName && <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>}
        </div>

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
          <label className="block text-xs font-semibold text-[var(--surface-700)] mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              autoComplete="new-password"
              value={password}
              onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })); }}
              placeholder="Min 8 characters"
              className={cn(inputCls(errors.password), "pr-10")}
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
              className={cn(inputCls(errors.confirm), "pr-10")}
            />
            <button type="button" onClick={() => setShowConf(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--surface-400)] hover:text-[var(--surface-700)] cursor-pointer">
              <EyeIcon open={showConf} />
            </button>
          </div>
          {errors.confirm && <p className="text-[11px] text-red-600 mt-1">{errors.confirm}</p>}
        </div>

        {/* Terms */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => { setAgreed(e.target.checked); setErrors(p => ({ ...p, agreed: undefined })); }}
              className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-[var(--brand-500)]"
            />
            <span className="text-xs text-[var(--surface-600)] leading-relaxed">
              I agree to the{" "}
              <Link to="/terms" className="text-[var(--brand-600)] hover:underline font-medium">Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" className="text-[var(--brand-600)] hover:underline font-medium">Privacy Policy</Link>
            </span>
          </label>
          {errors.agreed && <p className="text-[11px] text-red-600 mt-1 ml-6">{errors.agreed}</p>}
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
          {loading ? <><Spinner />Creating account…</> : "Create account"}
        </button>

      </form>

      <p className="text-center text-xs text-[var(--surface-500)] mt-5">
        Already have an account?{" "}
        <Link to="/auth/login" className="text-[var(--brand-600)] font-semibold hover:underline">
          Sign in
        </Link>
      </p>

    </AuthLayout>
  );
}