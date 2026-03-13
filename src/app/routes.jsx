import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

const LandingPage  = lazy(() => import("../features/landing/pages/Landingpage"));
const EditorPage   = lazy(() => import("../features/editor/pages/EditorPage"));
const AnalyzerPage = lazy(() => import("../features/analyzer/pages/AnalyzerPage"));
const TemplatesPage = lazy(() => import("../features/template/pages/Templatepage"));
const NotFound     = lazy(() => import("../shared/pages/NotFound"));

// ─── Professional SaaS Loader ─────────────────────────────────────
const Loader = () => (
  <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--surface-50)]">

    {/* Logo */}
    <div className="mb-8 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
        <img src="/CVEX Logo Design.png" alt="CVEX" className="w-full h-full object-cover" />
      </div>
      <span className="text-xl font-black tracking-tight text-[var(--surface-900)]">
        CV<span className="text-[var(--brand-500)]">EX</span>
      </span>
    </div>

    {/* Animated bar */}
    <div className="w-48 h-0.5 rounded-full bg-[var(--surface-200)] overflow-hidden mb-4">
      <div
        className="h-full rounded-full bg-[var(--brand-500)]"
        style={{
          width: "40%",
          animation: "cvex-slide 1.2s ease-in-out infinite",
        }}
      />
    </div>

    <p className="text-xs font-medium text-[var(--surface-400)] tracking-wide">
      Loading…
    </p>

    {/* Keyframe */}
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
      <Route path="/"          element={<LandingPage />}   />
      <Route path="/editor"    element={<EditorPage />}    />
      <Route path="/analyzer"  element={<AnalyzerPage />}  />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="*"          element={<NotFound />}      />
    </Routes>
  </Suspense>
);

export default AppRoutes;