import React, { useEffect, useState, useRef } from "react";
import { cn } from "../../../utils/helper";

/* ── Score meta — Tailwind classes per tier ──────────────────────────────── */
function getScoreMeta(score) {
  if (score >= 80) return {
    hex:        "#10b981",
    label:      "Highly compatible",
    desc:       "Your CV is well-optimised for ATS systems.",
    dot:        "bg-emerald-500",
    labelText:  "text-emerald-600",
    scoreText:  "text-emerald-500",
    bar:        "bg-emerald-500",
    iconBox:    "bg-emerald-100 border border-emerald-300",
    iconStroke: "#10b981",
  };
  if (score >= 60) return {
    hex:        "#3b82f6",
    label:      "Good compatibility",
    desc:       "Some optimisations will improve parse accuracy.",
    dot:        "bg-blue-500",
    labelText:  "text-blue-600",
    scoreText:  "text-blue-500",
    bar:        "bg-blue-500",
    iconBox:    "bg-blue-100 border border-blue-300",
    iconStroke: "#3b82f6",
  };
  if (score >= 40) return {
    hex:        "#f59e0b",
    label:      "Needs attention",
    desc:       "Several issues may cause CV rejection by ATS.",
    dot:        "bg-amber-500",
    labelText:  "text-amber-600",
    scoreText:  "text-amber-500",
    bar:        "bg-amber-500",
    iconBox:    "bg-amber-100 border border-amber-300",
    iconStroke: "#f59e0b",
  };
  return {
    hex:        "#ef4444",
    label:      "High risk",
    desc:       "Your CV may be filtered out before human review.",
    dot:        "bg-red-500",
    labelText:  "text-red-600",
    scoreText:  "text-red-500",
    bar:        "bg-red-500",
    iconBox:    "bg-red-100 border border-red-300",
    iconStroke: "#ef4444",
  };
}

/* ── Diagnostic type config — vivid Tailwind classes ────────────────────── */
const TYPE_CONFIG = {
  pass: {
    icon:       "check",
    row:        "bg-green-100 border border-green-300",
    iconCircle: "bg-green-600",
    textTitle:  "text-green-900",
    textBody:   "text-green-800",
    badge:      "bg-green-600 text-white",
    badgeLabel: "PASS",
  },
  warning: {
    icon:       "warn",
    row:        "bg-yellow-100 border border-yellow-300",
    iconCircle: "bg-yellow-600",
    textTitle:  "text-yellow-900",
    textBody:   "text-yellow-800",
    badge:      "bg-yellow-600 text-white",
    badgeLabel: "WARN",
  },
  error: {
    icon:       "cross",
    row:        "bg-red-100 border border-red-300",
    iconCircle: "bg-red-600",
    textTitle:  "text-red-900",
    textBody:   "text-red-800",
    badge:      "bg-red-600 text-white",
    badgeLabel: "ERROR",
  },
  info: {
    icon:       "info",
    row:        "bg-blue-100 border border-blue-300",
    iconCircle: "bg-blue-600",
    textTitle:  "text-blue-900",
    textBody:   "text-blue-800",
    badge:      "bg-blue-600 text-white",
    badgeLabel: "INFO",
  },
};

/* ── Icon paths ──────────────────────────────────────────────────────────── */
function DiagIcon({ type }) {
  const paths = {
    check: <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />,
    warn:  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />,
    cross: <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />,
    info:  <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" strokeLinecap="round" strokeLinejoin="round" /></>,
  };
  return (
    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
}

/* ── Single diagnostic row ───────────────────────────────────────────────── */
function DiagRow({ item, delay }) {
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.info;

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 px-3 py-2.5 rounded-[10px] opacity-0",
        cfg.row,
      )}
      style={{ animation: `atsFadeUp 0.3s ease ${delay}s forwards` }}
    >
      {/* Solid filled icon circle */}
      <div className={cn(
        "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
        cfg.iconCircle,
      )}>
        <DiagIcon type={cfg.icon} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-[12px] font-semibold leading-snug mb-0.5", cfg.textTitle)}>
          {item.title || item.msg}
        </p>
        {item.detail && (
          <p className={cn("text-[11px] leading-relaxed", cfg.textBody)}>
            {item.detail}
          </p>
        )}
        {!item.detail && item.msg && item.title && (
          <p className={cn("text-[11px] leading-relaxed", cfg.textBody)}>
            {item.msg}
          </p>
        )}
      </div>

      {/* Badge */}
      <span className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-[5px] shrink-0 mt-0.5 tracking-wide",
        cfg.badge,
      )}>
        {cfg.badgeLabel}
      </span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function ATSScore({ atsScore = 0, atsDetails = [] }) {
  const [animScore,   setAnimScore]   = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const frameRef = useRef(null);
  const meta     = getScoreMeta(atsScore);

  /* Animate score counter */
  useEffect(() => {
    const start = performance.now();
    const duration = 1100;
    const run = (now) => {
      const t    = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setAnimScore(Math.round(ease * atsScore));
      if (t < 1) frameRef.current = requestAnimationFrame(run);
    };
    frameRef.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frameRef.current);
  }, [atsScore]);

  /* Arc geometry */
  const R    = 36;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - Math.min(100, Math.max(0, atsScore)) / 100);

  /* Count by type */
  const counts   = atsDetails.reduce((acc, d) => { acc[d.type] = (acc[d.type] || 0) + 1; return acc; }, {});
  const passed   = counts.pass    || 0;
  const warnings = counts.warning || 0;
  const errors   = counts.error   || 0;
  const total    = atsDetails.length;

  const VISIBLE_DEFAULT = 4;
  const shown   = showDetails ? atsDetails : atsDetails.slice(0, VISIBLE_DEFAULT);
  const hasMore = atsDetails.length > VISIBLE_DEFAULT;

  /* Normalise both {msg} and {title,detail} shapes */
  const normalise = (d) => ({
    type:   d.type  || "info",
    title:  d.title || d.msg || "",
    detail: d.detail || (d.title ? d.msg : ""),
  });

  return (
    <>
      <style>{`
        @keyframes atsBarIn  { from{width:0} to{width:var(--ats-bar)} }
        @keyframes atsFadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .ats-bar { animation: atsBarIn 1.1s cubic-bezier(.25,.46,.45,.94) forwards; }
      `}</style>

      <div className="p-5">

        {/* ── TOP ROW: header + arc ───────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">

          <div className="flex-1 min-w-0">

            {/* Title row */}
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", meta.iconBox)}>
                <svg width="14" height="14" fill="none" stroke={meta.iconStroke} strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-[13px] font-bold text-[var(--surface-900)]">ATS Compatibility</span>
              <span className="hidden sm:inline text-[10px] text-[var(--surface-500)] bg-[var(--surface-200)] border border-[var(--surface-300)] px-2 py-0.5 rounded-full">
                Applicant Tracking
              </span>
            </div>

            {/* Description */}
            <p className="text-[11px] text-[var(--surface-500)] mb-3.5 leading-relaxed pl-9">
              {meta.desc}
            </p>

            {/* Progress bar block */}
            <div className="pl-9">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-[7px] h-[7px] rounded-full", meta.dot)} />
                  <span className={cn("text-[11px]", meta.labelText)}>{meta.label}</span>
                </div>
                <span className="text-[11px] text-[var(--surface-400)]">{atsScore} / 100</span>
              </div>

              {/* Track */}
              <div className="h-1.5 bg-[var(--surface-200)] rounded-full overflow-hidden mb-1.5">
                <div
                  className={cn("ats-bar h-full rounded-full", meta.bar)}
                  style={{ "--ats-bar": `${atsScore}%`, width: 0 }}
                />
              </div>

              {/* Scale ticks */}
              <div className="flex justify-between">
                {["0", "Poor", "Good", "100"].map((t) => (
                  <span key={t} className="text-[9px] text-[var(--surface-400)]">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ─────────────────────────────────────────────── */}
        <div className="h-px bg-[var(--surface-200)] my-4" />

        {/* ── DIAGNOSTIC CHECKS ───────────────────────────────────── */}
        {total > 0 && (
          <>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--surface-400)] mb-2.5">
              Diagnostic checks
            </p>

            <div className="flex flex-col gap-1.5">
              {shown.map((d, i) => (
                <DiagRow
                  key={i}
                  item={normalise(d)}
                  delay={0.08 + i * 0.07}
                />
              ))}
            </div>

            {/* Show more / less */}
            {hasMore && (
              <button
                onClick={() => setShowDetails(v => !v)}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-[7px] rounded-lg border border-[var(--surface-300)] text-[11px] font-semibold text-[var(--surface-600)] bg-transparent hover:bg-[var(--surface-100)] transition-colors cursor-pointer"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {showDetails
                    ? <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                    : <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
                  }
                </svg>
                {showDetails ? "Show less" : `Show ${atsDetails.length - VISIBLE_DEFAULT} more checks`}
              </button>
            )}

            {/* Footer summary */}
            <div className="h-px bg-[var(--surface-200)] mt-3.5 mb-2.5" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {passed > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-green-700 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                    {passed} passed
                  </div>
                )}
                {warnings > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-yellow-700 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                    {warnings} warning{warnings > 1 ? "s" : ""}
                  </div>
                )}
                {errors > 0 && (
                  <div className="flex items-center gap-1 text-[11px] text-red-700 font-medium">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                    {errors} error{errors > 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-[var(--surface-400)]">
                {total} check{total !== 1 ? "s" : ""} run
              </span>
            </div>
          </>
        )}

        {/* Empty state */}
        {total === 0 && (
          <p className="text-center text-xs text-[var(--surface-400)] py-4">
            No diagnostic details available for this scan.
          </p>
        )}

      </div>
    </>
  );
}