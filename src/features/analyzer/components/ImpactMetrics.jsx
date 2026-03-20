import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../../utils/helper";

/* ── Overall grade helper ────────────────────────────────────────────────── */
function getOverallGrade(pcts) {
  const avg = pcts.reduce((a, b) => a + b, 0) / pcts.length;
  if (avg >= 75) return { label: "Expert",  badge: "bg-emerald-600 text-white", ringColor: "#16a34a", ringTrack: "#bbf7d0" };
  if (avg >= 55) return { label: "Good",    badge: "bg-purple-600 text-white",  ringColor: "#9333ea", ringTrack: "#e9d5ff" };
  if (avg >= 35) return { label: "Fair",    badge: "bg-amber-500 text-white",   ringColor: "#f59e0b", ringTrack: "#fde68a" };
  return           { label: "Needs work", badge: "bg-red-600 text-white",    ringColor: "#ef4444", ringTrack: "#fecaca" };
}

function getOverallDesc(label) {
  if (label === "Expert")     return "Excellent! Your bullets are quantified, action-driven, and results-focused.";
  if (label === "Good")       return "Strong impact language. Quantify more achievements to reach Expert level.";
  if (label === "Fair")       return "Some bullets show impact. Add metrics and strong verbs to improve.";
  return "Most bullets lack impact language. Focus on results and numbers.";
}

/* ── Animated score counter ──────────────────────────────────────────────── */
function useCountUp(target, duration = 900) {
  const [val, setVal] = useState(0);
  const frame = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const run = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) frame.current = requestAnimationFrame(run);
    };
    frame.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return val;
}

/* ── Metric config ───────────────────────────────────────────────────────── */
const METRIC_CFG = {
  quantified: {
    label: "Quantified",
    tip:   "Statements with numbers, %, or metrics",
    iconBox: "bg-blue-100 border border-blue-300",
    numColor: "text-blue-700",
    barColor: "bg-blue-600",
    icon: (
      <svg width="12" height="12" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  actionLed: {
    label: "Action-led",
    tip:   "Starting with strong action verbs",
    iconBox: "bg-purple-100 border border-purple-300",
    numColor: "text-purple-700",
    barColor: "bg-purple-600",
    icon: (
      <svg width="12" height="12" fill="none" stroke="#9333ea" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  resultOriented: {
    label: "Result-oriented",
    tip:   "Showing measurable impact or outcome",
    iconBox: "bg-green-100 border border-green-300",
    numColor: "text-green-700",
    barColor: "bg-green-600",
    icon: (
      <svg width="12" height="12" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="8" />
      </svg>
    ),
  },
};

/* ── Single metric row ───────────────────────────────────────────────────── */
function MetricRow({ cfg, value, pct, total, delay }) {
  const animPct = useCountUp(pct, 900);

  return (
    <div
      className="opacity-0"
      style={{ animation: `impFadeUp .35s ease ${delay}s forwards` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", cfg.iconBox)}>
            {cfg.icon}
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--surface-900)] leading-none">{cfg.label}</p>
            <p className="text-[10px] text-[var(--surface-400)] mt-0.5">{cfg.tip}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className={cn("text-[18px] font-bold leading-none tracking-tight", cfg.numColor)}>
            {animPct}%
          </span>
          <p className="text-[10px] text-[var(--surface-400)] mt-0.5">{value} / {total}</p>
        </div>
      </div>

      {/* Bar track */}
      <div className="h-[7px] bg-[var(--surface-200)] rounded-full overflow-hidden">
        <div
          className={cn("imp-bar h-full rounded-full", cfg.barColor)}
          style={{ "--imp-w": `${Math.max(2, pct)}%`, width: 0, animationDelay: `${delay + 0.1}s` }}
        />
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function ImpactMetrics({ impactMetrics }) {
  const m = impactMetrics || {
    totalStatements: 0,
    quantified: 0, quantifiedPct: 0,
    actionLed: 0, actionLedPct: 0,
    resultOriented: 0, resultOrientedPct: 0,
    overallImpact: 0,
  };

  const pcts  = [m.quantifiedPct, m.actionLedPct, m.resultOrientedPct];
  const avg   = m.overallImpact || Math.round(pcts.reduce((a, b) => a + b, 0) / 3);
  const grade = getOverallGrade(pcts);

  /* Arc for overall ring */
  const R    = 20, CIRC = 2 * Math.PI * R;
  const dash = CIRC * (1 - avg / 100);

  const showTip = m.quantifiedPct < 50;

  const rows = [
    { key: "quantified",     value: m.quantified,     pct: m.quantifiedPct },
    { key: "actionLed",      value: m.actionLed,      pct: m.actionLedPct },
    { key: "resultOriented", value: m.resultOriented, pct: m.resultOrientedPct },
  ];

  return (
    <>
      <style>{`
        @keyframes impBarIn  { from{width:0} to{width:var(--imp-w)} }
        @keyframes impFadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .imp-bar { animation: impBarIn 1s cubic-bezier(.25,.46,.45,.94) forwards; }
      `}</style>

      <div className="p-5">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 border border-purple-300 flex items-center justify-center shrink-0">
              <svg width="14" height="14" fill="none" stroke="#9333ea" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[13px] font-bold text-[var(--surface-900)]">Impact Metrics</span>
            <span className="hidden sm:inline text-[10px] text-[var(--surface-500)] bg-[var(--surface-200)] border border-[var(--surface-300)] px-2 py-0.5 rounded-full">
              Bullet analysis
            </span>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[22px] font-bold text-purple-600 leading-none tracking-tight">
              {m.totalStatements}
            </div>
            <div className="text-[10px] text-[var(--surface-400)] mt-0.5">statements</div>
          </div>
        </div>

        <p className="text-[11px] text-[var(--surface-500)] mt-1 mb-4 leading-relaxed">
          Measures how effectively your bullet points demonstrate real-world impact.
        </p>

        {/* ── EMPTY STATE ────────────────────────────────────────── */}
        {m.totalStatements === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-100)] border-2 border-dashed border-[var(--surface-300)] flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="var(--surface-400)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--surface-700)]">No statements yet</p>
              <p className="text-xs text-[var(--surface-400)] mt-1 max-w-[200px] leading-relaxed">
                Add experience descriptions to see impact metrics
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── OVERALL SCORE CARD ─────────────────────────────── */}
            <div
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl mb-4 opacity-0"
              style={{
                background: `${grade.ringColor}10`,
                border: `1px solid ${grade.ringColor}35`,
                animation: "impFadeUp .35s ease .05s forwards",
              }}
            >
              {/* Mini arc ring */}
              <div className="relative w-[52px] h-[52px] shrink-0">
                <svg width="52" height="52" className="absolute inset-0" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="26" cy="26" r={R} fill="none" stroke={grade.ringTrack} strokeWidth="5" />
                  <circle cx="26" cy="26" r={R} fill="none"
                    stroke={grade.ringColor} strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={CIRC} strokeDashoffset={dash}
                    style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(.25,.46,.45,.94) .1s" }}
                  />
                </svg>
                <div
                  className="absolute inset-0 flex items-center justify-center text-[13px] font-bold"
                  style={{ color: grade.ringColor }}
                >
                  {avg}%
                </div>
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-[12px] font-bold mb-0.5 leading-none"
                  style={{ color: grade.ringColor }}
                >
                  {getOverallDesc(grade.label).split(".")[0]}
                </p>
                <p className="text-[11px] leading-snug" style={{ color: `${grade.ringColor}cc` }}>
                  {getOverallDesc(grade.label).split(".").slice(1).join(".").trim()}
                </p>
              </div>

              {/* Grade badge */}
              <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0", grade.badge)}>
                {grade.label}
              </span>
            </div>

            {/* ── METRIC ROWS ────────────────────────────────────── */}
            <div className="flex flex-col gap-3">
              {rows.map(({ key, value, pct }, i) => (
                <MetricRow
                  key={key}
                  cfg={METRIC_CFG[key]}
                  value={value}
                  pct={pct}
                  total={m.totalStatements}
                  delay={0.12 + i * 0.08}
                />
              ))}
            </div>

            {/* ── DIVIDER ────────────────────────────────────────── */}
            {showTip && <div className="h-px bg-[var(--surface-200)] mt-4 mb-3" />}

            {/* ── TIP CARD ───────────────────────────────────────── */}
            {showTip && (
              <div
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-[10px] bg-yellow-100 border border-yellow-300 opacity-0"
                style={{ animation: "impFadeUp .35s ease .42s forwards" }}
              >
                <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-yellow-900 mb-0.5">Improve your score</p>
                  <p className="text-[11px] text-yellow-800 leading-relaxed">
                    Add numbers to quantify impact — e.g. "Increased revenue by 35%" or "Led a team of 12 engineers"
                  </p>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}