import React, { useMemo, useState } from "react";
import { cn } from "../../../utils/helper";

/* ── Score tier ──────────────────────────────────────────────────────────── */
function getSkillTier(score) {
  if (score >= 80) return {
    label: "Strong",
    numColor: "text-indigo-700",
    barFill: "bg-indigo-600",
    barTrack: "bg-indigo-200",
    rowBg: "bg-indigo-50 border-indigo-200",
    dot: "#4f46e5",
    badgeBg: "bg-indigo-200 text-indigo-900",
    hintColor: "text-indigo-600",
    nameColor: "text-indigo-900",
  };
  if (score >= 60) return {
    label: null,
    numColor: "text-blue-700",
    barFill: "bg-blue-600",
    barTrack: "bg-blue-100",
    rowBg: "bg-blue-50 border-blue-200",
    dot: "#2563eb",
    badgeBg: null,
    hintColor: "text-blue-700",
    nameColor: "text-blue-700",
  };
  if (score >= 40) return {
    label: "Fair",
    numColor: "text-amber-700",
    barFill: "bg-amber-500",
    barTrack: "bg-yellow-200",
    rowBg: "bg-yellow-50 border-yellow-300",
    dot: "#ca8a04",
    badgeBg: "bg-yellow-200 text-yellow-900",
    hintColor: "text-amber-700",
    nameColor: "text-yellow-900",
  };
  return {
    label: "Weak",
    numColor: "text-red-700",
    barFill: "bg-red-600",
    barTrack: "bg-red-200",
    rowBg: "bg-red-50 border-red-300",
    dot: "#dc2626",
    badgeBg: "bg-red-200 text-red-900",
    hintColor: "text-red-800",
    nameColor: "text-red-900",
  };
}

/* ── Pill colour per score tier ──────────────────────────────────────────── */
function pillStyle(score, isHighlighted) {
  if (isHighlighted) return { bg: "#e0e7ff", border: "#a5b4fc", text: "#3730a3", scoreBg: "#a5b4fc" };
  if (score >= 80) return { bg: "#ffffff", border: "#c7d2fe", text: "#4338ca", scoreBg: "#c7d2fe" };
  if (score >= 60) return { bg: "#ffffff", border: "#bfdbfe", text: "#1d4ed8", scoreBg: "#bfdbfe" };
  if (score >= 40) return { bg: "#fefce8", border: "#fde047", text: "#92400e", scoreBg: "#fde047" };
  return { bg: "#fee2e2", border: "#fca5a5", text: "#b91c1c", scoreBg: "#fca5a5" };
}

/* ── Pill-label SVG Radar ────────────────────────────────────────────────── */
function RadarSVG({ data, highlightIdx, avg }) {
  const VW = 300;
  const VH = 300;
  const CX = VW / 2;
  const CY = VH / 2;
  const MAX_R = 88;
  const PILL_R = MAX_R + 42;    // distance from centre to pill centre
  const PILL_W = 74;
  const PILL_H = 18;
  const SCORE_W = 26;           // score badge portion inside pill
  const n = data.length;

  if (n < 3) return null;

  const angle = (i) => (i / n) * 2 * Math.PI - Math.PI / 2;
  const pt = (i, r) => ({
    x: +(CX + r * Math.cos(angle(i))).toFixed(2),
    y: +(CY + r * Math.sin(angle(i))).toFixed(2),
  });

  /* Grid rings */
  const gridRings = [0.25, 0.5, 0.75, 1].map(pct =>
    Array.from({ length: n }, (_, i) => {
      const p = pt(i, MAX_R * pct);
      return `${p.x},${p.y}`;
    }).join(" ")
  );

  /* Data polygon */
  const dataPolygon = data
    .map((d, i) => {
      const p = pt(i, (Math.min(100, Math.max(0, d.score)) / 100) * MAX_R);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  /* Truncate to fit pill */
  const trunc = (str, max = 13) =>
    str && str.length > max ? str.slice(0, max - 1) + "…" : (str || "");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${VW} ${VH}`}
      style={{ maxWidth: 300, overflow: "visible" }}
    >
      {/* ── Grid rings ── */}
      {gridRings.map((pts, ri) => (
        <polygon key={ri} points={pts}
          fill="none" stroke="#94a3b8" strokeWidth="0.8" opacity="0.22" />
      ))}

      {/* ── Ring % ticks ── */}
      {[25, 50, 75].map((pct) => {
        const r = (pct / 100) * MAX_R;
        return (
          <text key={pct}
            x={CX + 4} y={CY - r + 1}
            textAnchor="start" dominantBaseline="hanging"
            fontSize="7" fill="#94a3b8" opacity="0.65"
            style={{ fontFamily: "system-ui,sans-serif", userSelect: "none" }}>
            {pct}
          </text>
        );
      })}

      {/* ── Axis spokes ── */}
      {Array.from({ length: n }, (_, i) => {
        const p = pt(i, MAX_R);
        return (
          <line key={i}
            x1={CX} y1={CY} x2={p.x} y2={p.y}
            stroke="#94a3b8" strokeWidth="0.7" opacity="0.18" />
        );
      })}

      {/* ── Data polygon ── */}
      <polygon
        points={dataPolygon}
        fill="#4f46e5" fillOpacity="0.13"
        stroke="#4f46e5" strokeWidth="2.2" strokeLinejoin="round"
      />

      {/* ── Data points ── */}
      {data.map((d, i) => {
        const p = pt(i, (Math.min(100, Math.max(0, d.score)) / 100) * MAX_R);
        const isH = highlightIdx === i;
        const tier = getSkillTier(d.score);
        return (
          <circle key={i}
            cx={p.x} cy={p.y}
            r={isH ? 7 : 5}
            fill={tier.dot}
            stroke="white" strokeWidth={isH ? 3 : 2.5}
            style={{ transition: "r .15s ease, stroke-width .15s ease" }}
          />
        );
      })}

      {/* ── Pill labels ── */}
      {data.map((d, i) => {
        const lp = pt(i, PILL_R);
        const isH = highlightIdx === i;
        const ps = pillStyle(d.score, isH);
        const rx = lp.x - PILL_W / 2;
        const ry = lp.y - PILL_H / 2;

        return (
          <g key={i}>
            {/* Pill base */}
            <rect
              x={rx}
              y={ry}
              width={PILL_W}
              height={PILL_H}
              rx="9"
              fill={ps.bg}
              stroke={ps.border}
              strokeWidth={isH ? 1.5 : 1}
            />

            {/* Category text — fully visible, centered */}
            <text
              x={rx + PILL_W / 2}
              y={ry + PILL_H / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={isH ? "9" : "8.5"}
              fontWeight={isH ? "700" : "600"}
              fill={ps.text}
              style={{ fontFamily: "system-ui,sans-serif", whiteSpace: "pre" }}
            >
              {d.category}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Summary strip ───────────────────────────────────────────────────────── */
function SummaryStrip({ data }) {
  const strong = data.filter(d => d.score >= 80).length;
  const good = data.filter(d => d.score >= 60 && d.score < 80).length;
  const fair = data.filter(d => d.score >= 40 && d.score < 60).length;
  const weak = data.filter(d => d.score < 40).length;

  const pills = [
    { count: strong, label: "Strong", bg: "bg-green-100 border border-green-300", num: "text-green-800", sub: "text-green-700" },
    { count: good, label: "Good", bg: "bg-blue-100 border border-blue-300", num: "text-blue-800", sub: "text-blue-700" },
    { count: fair, label: "Fair", bg: "bg-yellow-100 border border-yellow-300", num: "text-yellow-800", sub: "text-yellow-700" },
    { count: weak, label: "Weak", bg: "bg-red-100 border border-red-300", num: "text-red-800", sub: "text-red-700" },
  ].filter(p => p.count > 0);

  if (!pills.length) return null;

  return (
    <div className="radar-fu flex gap-1.5 mb-3.5" style={{ animationDelay: "0.08s" }}>
      {pills.map(({ count, label, bg, num, sub }) => (
        <div key={label} className={cn("flex-1 px-2.5 py-2 rounded-xl text-center", bg)}>
          <div className={cn("text-[17px] font-bold leading-none tracking-tight", num)}>{count}</div>
          <div className={cn("text-[9px] font-bold mt-1 uppercase tracking-[.05em]", sub)}>{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Auto hint ───────────────────────────────────────────────────────────── */
function getHint(d) {
  if (d.hint) return d.hint;
  const missing = (d.total || 0) - (d.matched || 0);
  if (d.score >= 80) return `Well covered.${missing > 0 ? ` ${missing} skill${missing > 1 ? "s" : ""} missing — add to polish.` : " All expected skills present."}`;
  if (d.score >= 60) return `Good foundation.${missing > 0 ? ` Add ${missing} more skill${missing > 1 ? "s" : ""} to strengthen this category.` : ""}`;
  if (d.score >= 40) return `Needs improvement.${missing > 0 ? ` ${missing} of ${d.total} expected skills absent.` : ""} Add relevant experience or certifications.`;
  return `Critical gap.${missing > 0 ? ` Only ${d.matched || 0} of ${d.total} expected signals present.` : ""} Prioritise this in your CV.`;
}

/* ── Skill row ───────────────────────────────────────────────────────────── */
function SkillRow({ d, idx, isHovered, onHover, onLeave }) {
  const tier = getSkillTier(d.score);
  const hint = getHint(d);

  return (
    <div
      className={cn(
        "radar-fu rounded-xl border px-3 py-2.5 cursor-default transition-all duration-150",
        isHovered
          ? "bg-indigo-50 border-indigo-300 scale-[1.005]"
          : tier.rowBg
      )}
      style={{ animationDelay: `${0.13 + idx * 0.05}s` }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full shrink-0 transition-transform duration-150"
            style={{
              background: isHovered ? "#4f46e5" : tier.dot,
              transform: isHovered ? "scale(1.4)" : "scale(1)",
            }}
          />
          <span className={cn(
            "text-[12px] font-bold leading-none transition-colors",
            isHovered ? "text-indigo-900" : tier.nameColor
          )}>
            {d.category}
          </span>
          {tier.label && tier.badgeBg && (
            <span className={cn("text-[9px] font-bold px-[6px] py-[1px] rounded-[4px] uppercase tracking-[.04em]", tier.badgeBg)}>
              {tier.label}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {d.total > 0 && (
            <div className="flex items-center gap-0.5">
              <span className={cn("text-[11px] font-bold tabular-nums", isHovered ? "text-indigo-700" : tier.numColor)}>
                {d.matched ?? 0}
              </span>
              <span className="text-[10px] text-[var(--surface-400)]">/{d.total}</span>
            </div>
          )}
          <span className={cn(
            "text-[14px] font-bold tabular-nums tracking-tight",
            isHovered ? "text-indigo-700" : tier.numColor
          )}>
            {d.score}%
          </span>
        </div>
      </div>

      {/* Bar */}
      <div className={cn("h-[5px] rounded-full overflow-hidden", isHovered ? "bg-indigo-200" : tier.barTrack)}>
        <div
          className={cn("radar-bar h-full rounded-full", isHovered ? "bg-indigo-600" : tier.barFill)}
          style={{
            "--radar-w": `${Math.max(2, d.score)}%`,
            width: 0,
            animationDelay: `${0.19 + idx * 0.05}s`,
          }}
        />
      </div>

      {/* Hint */}
      {hint && (
        <p className={cn(
          "text-[10px] mt-1.5 leading-relaxed transition-colors",
          isHovered ? "text-indigo-700" : tier.hintColor
        )}>
          {hint}
        </p>
      )}
    </div>
  );
}

/* ── Insight block ───────────────────────────────────────────────────────── */
function InsightBlock({ data }) {
  const weakest = [...data].sort((a, b) => a.score - b.score)[0];
  if (!weakest || weakest.score >= 70) return null;
  const missing = (weakest.total || 0) - (weakest.matched || 0);
  const potential = Math.min(100, weakest.score + 8 + Math.round((70 - weakest.score) * 0.3));

  return (
    <div
      className="radar-fu mt-3.5 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe]"
      style={{ animationDelay: `${0.15 + data.length * 0.05}s` }}
    >
      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p className="text-[11px] font-bold text-[#4c1d95] mb-0.5">
          Priority gap: {weakest.category}
        </p>
        <p className="text-[11px] text-[#6d28d9] leading-relaxed">
          At {weakest.score}%, this is your weakest category.
          {missing > 0 && <> Only {weakest.matched ?? 0} of {weakest.total} signals present — {missing} missing.</>}
          {" "}Fixing this could add up to <span className="font-bold">{potential - weakest.score} points</span> to your overall.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function SkillsGapRadar({ radarData }) {
  const data = radarData || [];
  const [hovered, setHovered] = useState(null);

  const sorted = useMemo(() =>
    [...data].sort((a, b) => a.score - b.score),
    [data]
  );

  const avg = useMemo(() =>
    data.length ? Math.round(data.reduce((s, d) => s + d.score, 0) / data.length) : 0,
    [data]
  );

  const hoveredOrigIdx = hovered !== null
    ? data.findIndex(d => d === sorted[hovered])
    : null;

  return (
    <>
      <style>{`
        @keyframes radarBarIn  { from{width:0} to{width:var(--radar-w)} }
        @keyframes radarFadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .radar-bar { animation: radarBarIn .9s cubic-bezier(.25,.46,.45,.94) forwards; }
        .radar-fu  { animation: radarFadeUp .32s ease forwards; opacity:0; }
      `}</style>

      <div className="p-5">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="radar-fu flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-300 flex items-center justify-center shrink-0">
              <svg width="14" height="14" fill="none" stroke="#4f46e5" strokeWidth="1.8" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[13px] font-bold text-[var(--surface-900)]">Skills Gap Radar</span>
            {data.length > 0 && (
              <span className="hidden sm:inline text-[10px] text-[var(--surface-500)] bg-[var(--surface-200)] border border-[var(--surface-300)] px-2 py-0.5 rounded-full">
                {data.length} categor{data.length === 1 ? "y" : "ies"}
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-[22px] font-bold text-indigo-600 leading-none tracking-tight">{avg}</div>
            <div className="text-[10px] text-[var(--surface-400)] mt-0.5">avg score</div>
          </div>
        </div>

        <p className="radar-fu text-[11px] text-[var(--surface-500)] mt-1 mb-3 leading-relaxed" style={{ animationDelay: "0.04s" }}>
          Skill coverage across categories — hover any row to highlight on the radar.
        </p>

        {/* ── EMPTY STATE ────────────────────────────────────────── */}
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-100)] border-2 border-dashed border-[var(--surface-300)] flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="var(--surface-400)" strokeWidth="1.5" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--surface-700)]">No radar data</p>
              <p className="text-xs text-[var(--surface-400)] mt-1">Run a full analysis to see skills gap breakdown.</p>
            </div>
          </div>
        ) : (
          <>
            <SummaryStrip data={data} />

            {/* Radar */}
            <div className="radar-fu flex justify-center mb-3" style={{ animationDelay: "0.1s" }}>
              <RadarSVG data={data} highlightIdx={hoveredOrigIdx} avg={avg} />
            </div>

            <div className="h-px bg-[var(--surface-200)] mb-3" />

            {/* Skill rows */}
            <div className="flex flex-col gap-[5px]">
              {sorted.map((d, idx) => (
                <SkillRow
                  key={d.category || idx}
                  d={d}
                  idx={idx}
                  isHovered={hovered === idx}
                  onHover={() => setHovered(idx)}
                  onLeave={() => setHovered(null)}
                />
              ))}
            </div>

            <InsightBlock data={data} />
          </>
        )}
      </div>
    </>
  );
}