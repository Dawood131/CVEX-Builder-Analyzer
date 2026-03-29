import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, GuestRoute } from "../shared/guards/ProtectedRoute";

const LandingPage = lazy(() => import("../features/landing/pages/Landingpage"));
const EditorPage = lazy(() => import("../features/editor/pages/EditorPage"));
const AnalyzerPage = lazy(() => import("../features/analyzer/pages/AnalyzerPage"));
const TemplatesPage = lazy(() => import("../features/template/pages/Templatepage"));
const NotFound = lazy(() => import("../shared/pages/NotFound"));
const PrivacyPolicy = lazy(() => import("../shared/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("../shared/pages/ServicePolicy"));


// Auth pages
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const SignupPage = lazy(() => import("../features/auth/pages/SignupPage"));
const ForgotPasswordPage = lazy(() => import("../features/auth/pages/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../features/auth/pages/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("../features/auth/pages/VerifyEmailPage"));
const AuthCallback = lazy(() => import("../features/auth/pages/AuthCallback"));

// ─── Loader ───────────────────────────────────────────────────────
const Loader = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--surface-50)]">
    <div className="mb-8 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
        <img src="/CVEX Logo Design.png" alt="CVEX" className="w-full h-full object-cover" />
      </div>
      <span className="text-xl font-black tracking-tight text-[var(--surface-900)]">
        CV<span className="text-[var(--brand-500)]">EX</span>
      </span>
    </div>
    <div className="w-48 h-0.5 rounded-full bg-[var(--surface-200)] overflow-hidden mb-4">
      <div
        className="h-full rounded-full bg-[var(--brand-500)]"
        style={{ width: "40%", animation: "cvex-slide 1.2s ease-in-out infinite" }}
      />
    </div>
    <p className="text-xs font-medium text-[var(--surface-400)] tracking-wide">Loading…</p>
    <style>{`
      @keyframes cvex-slide {
        0%   { transform: translateX(-120%); }
        50%  { transform: translateX(160%); }
        100% { transform: translateX(160%); }
      }
    `}</style>
  </div>
);

// ─── Routes ───────────────────────────────────────────────────────
const AppRoutes = () => (
  <Suspense fallback={<Loader />}>
    <Routes>

      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/privacypolicy" element={<PrivacyPolicy />} />
      <Route path="/servicepolicy" element={<TermsOfService />} />
      {/* Guest only — redirect if logged in */}
      <Route path="/auth/login"
        element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/auth/signup"
        element={<GuestRoute><SignupPage /></GuestRoute>} />
      <Route path="/auth/forgot-password"
        element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

      {/* Auth utility */}
      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
      <Route path="/auth/verify" element={<VerifyEmailPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected — login required */}
      <Route path="/templates"
        element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
      <Route path="/analyzer"
        element={<ProtectedRoute><AnalyzerPage /></ProtectedRoute>} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  </Suspense>
);

export default AppRoutes;