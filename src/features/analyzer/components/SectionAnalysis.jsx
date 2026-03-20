import React, { useState, useMemo } from "react";
import { cn } from "../../../utils/helper";

/* ── Score tier ──────────────────────────────────────────────────────────── */
function getScoreTier(score) {
  if (score >= 80) return {
    label: "Strong", numColor: "text-indigo-700", barFill: "bg-indigo-600",
    barTrack: "bg-indigo-200", rowBg: "bg-indigo-50 border-indigo-200",
    iconBox: "bg-indigo-100 border border-indigo-300", iconStroke: "#4338ca",
    chevColor: "#6366f1", badgeBg: "bg-indigo-200 text-indigo-900",
    tipPassBg: "bg-indigo-50/70 border border-indigo-200/60 text-indigo-900",
    tipWarnBg: "bg-yellow-50/70 border border-yellow-200/80 text-yellow-900",
  };
  if (score >= 60) return {
  label: null,
  numColor: "text-blue-700",
  barFill: "bg-blue-600",
  barTrack: "bg-blue-100",
  rowBg: "bg-blue-50 border-blue-200",
  iconBox: "bg-blue-100 border border-blue-300",
  iconStroke: "#1d4ed8",
  chevColor: "#60a5fa", 
  badgeBg: null,
  tipPassBg: "bg-blue-50/70 border border-blue-200/60 text-blue-900",
  tipWarnBg: "bg-yellow-50/70 border border-yellow-200/80 text-yellow-900",
};
  if (score >= 40) return {
    label: "Needs work", numColor: "text-amber-700", barFill: "bg-amber-500",
    barTrack: "bg-yellow-200", rowBg: "bg-yellow-50 border-yellow-300",
    iconBox: "bg-yellow-100 border border-yellow-300", iconStroke: "#ca8a04",
    chevColor: "#ca8a04", badgeBg: "bg-yellow-200 text-yellow-900",
    tipPassBg: "bg-amber-50/70 border border-amber-200/60 text-amber-900",
    tipWarnBg: "bg-yellow-50/70 border border-yellow-200/80 text-yellow-900",
  };
  return {
    label: "Critical", numColor: "text-red-700", barFill: "bg-red-600",
    barTrack: "bg-red-200", rowBg: "bg-red-50 border-red-300",
    iconBox: "bg-red-100 border border-red-300", iconStroke: "#dc2626",
    chevColor: "#dc2626", badgeBg: "bg-red-200 text-red-900",
    tipPassBg: "bg-red-50/70 border border-red-200/60 text-red-900",
    tipWarnBg: "bg-yellow-50/70 border border-yellow-200/80 text-yellow-900",
  };
}

/* ── Only show sections with real data ───────────────────────────────────── */
function isValidSection(sec) {
  if (!sec || typeof sec !== "object") return false;
  if (typeof sec.score !== "number") return false;
  // score=0 with no name + no suggestions = empty placeholder, skip it
  if (sec.score === 0 && !sec.name && (!sec.suggestions || sec.suggestions.length === 0)) return false;
  return true;
}

/* ── Section SVG icons ───────────────────────────────────────────────────── */
function SectionIcon({ sectionKey, color }) {
  const paths = {
    personal:       <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />,
    summary:        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />,
    experience:     <><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" strokeLinecap="round" strokeLinejoin="round" /></>,
    education:      <><path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" strokeLinecap="round" strokeLinejoin="round" /></>,
    skills:         <><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" /></>,
    projects:       <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" />,
    certifications: <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" strokeLinecap="round" strokeLinejoin="round" />,
    languages:      <path d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" strokeLinecap="round" strokeLinejoin="round" />,
    awards:         <><path d="M8 21h8M12 17v4M7 4H4a1 1 0 00-1 1v3c0 3.314 2.686 6 6 6h6c3.314 0 6-2.686 6-6V5a1 1 0 00-1-1h-3" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 4h8" strokeLinecap="round" /></>,
  };
  const path = paths[sectionKey] || (
    <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 13h6M9 17h4" strokeLinecap="round" strokeLinejoin="round" /></>
  );
  return (
    <svg width="12" height="12" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24">
      {path}
    </svg>
  );
}

/* ── Tip dot ─────────────────────────────────────────────────────────────── */
function TipDot({ type }) {
  const isPass = type === "pass", isErr = type === "error";
  return (
    <div className={cn(
      "w-[14px] h-[14px] rounded-full flex items-center justify-center shrink-0 mt-0.5",
      isErr ? "bg-red-600" : isPass ? "bg-indigo-600" : "bg-yellow-500"
    )}>
      <svg width="8" height="8" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
        {isPass
          ? <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          : isErr
          ? <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          : <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
        }
      </svg>
    </div>
  );
}

/* ── Tip row ─────────────────────────────────────────────────────────────── */
function TipRow({ s, tier }) {
  const isObj   = typeof s === "object" && s !== null;
  const tipType = isObj ? (s.type || "tip") : "tip";
  const text    = isObj ? (s.text || s.msg || "") : s;
  const isPass  = tipType === "pass";
  const isError = tipType === "error";
  const bgClass = isPass
    ? tier.tipPassBg
    : isError
    ? "bg-red-50/70 border border-red-200/60 text-red-900"
    : tier.tipWarnBg;
  return (
    <div className={cn("flex items-start gap-2 px-2.5 py-1.5 rounded-lg text-[11px] leading-relaxed", bgClass)}>
      <TipDot type={tipType} />
      <span>{text}</span>
    </div>
  );
}

/* ── Section row ─────────────────────────────────────────────────────────── */
function SectionRow({ sectionKey, sec, idx, isExpanded, onToggle }) {
  const tier           = getScoreTier(sec.score || 0);
  const hasSuggestions = sec.suggestions && sec.suggestions.length > 0;
  const name           = sec.name || sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1);

  return (
    <div
      className={cn("sec-fu rounded-xl border overflow-hidden transition-all duration-200", tier.rowBg)}
      style={{ animationDelay: `${0.08 + idx * 0.06}s` }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 px-3 py-[11px] text-left cursor-pointer bg-transparent border-none transition-all hover:brightness-[.97]"
      >
        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0", tier.iconBox)}>
          <SectionIcon sectionKey={sectionKey} color={tier.iconStroke} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-[5px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-bold text-gray-700 leading-none">{name}</span>
              {tier.label && tier.badgeBg && (
                <span className={cn("text-[9px] font-bold px-[6px] py-[1px] rounded-[4px] uppercase tracking-[.04em]", tier.badgeBg)}>
                  {tier.label}
                </span>
              )}
            </div>
            <span className={cn("text-[14px] font-bold tracking-tight ml-2 tabular-nums", tier.numColor)}>
              {sec.score || 0}%
            </span>
          </div>
          <div className={cn("h-[5px] rounded-full overflow-hidden", tier.barTrack)}>
            <div
              className={cn("sec-bar h-full rounded-full", tier.barFill)}
              style={{ "--sec-w": `${Math.max(2, sec.score || 0)}%`, width: 0, animationDelay: `${0.14 + idx * 0.06}s` }}
            />
          </div>
        </div>

        <svg
          width="11" height="11" fill="none" strokeWidth="2.2" viewBox="0 0 24 24"
          className={cn("shrink-0 transition-transform duration-200", isExpanded && "rotate-180")}
          style={{ stroke: tier.chevColor }}
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-0">
          <div className="ml-[38px] flex flex-col gap-[5px]">
            {hasSuggestions
              ? sec.suggestions.map((s, i) => <TipRow key={i} s={s} tier={tier} />)
              : <p className="text-[11px] text-[var(--surface-400)] italic">No suggestions for this section.</p>
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Summary strip ───────────────────────────────────────────────────────── */
function SummaryStrip({ validSections }) {
  const vals     = validSections.map(([, s]) => s.score || 0);
  const strong   = vals.filter(v => v >= 80).length;
  const good     = vals.filter(v => v >= 60 && v < 80).length;
  const fair     = vals.filter(v => v >= 40 && v < 60).length;
  const critical = vals.filter(v => v < 40).length;

  const pills = [
    { count: strong,   label: "Strong",   bg: "bg-green-100 border border-green-300",   num: "text-green-800",  sub: "text-green-700"  },
    { count: good,     label: "Good",     bg: "bg-blue-100 border border-blue-300",     num: "text-blue-800",   sub: "text-blue-700"   },
    { count: fair,     label: "Fair",     bg: "bg-yellow-100 border border-yellow-300", num: "text-yellow-800", sub: "text-yellow-700" },
    { count: critical, label: "Critical", bg: "bg-red-100 border border-red-300",       num: "text-red-800",    sub: "text-red-700"    },
  ].filter(p => p.count > 0);

  if (!pills.length) return null;

  return (
    <div className="sec-fu flex gap-1.5 mb-3.5" style={{ animationDelay: "0.08s" }}>
      {pills.map(({ count, label, bg, num, sub }) => (
        <div key={label} className={cn("flex-1 px-2.5 py-2 rounded-xl text-center", bg)}>
          <div className={cn("text-[17px] font-bold leading-none tracking-tight", num)}>{count}</div>
          <div className={cn("text-[9px] font-bold mt-1 uppercase tracking-[.05em]", sub)}>{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Weakest insight ─────────────────────────────────────────────────────── */
function WeakestInsight({ validSections }) {
  if (!validSections.length) return null;
  const [key, sec] = validSections[0]; // already sorted worst-first
  if ((sec.score || 0) >= 70) return null;
  const name      = sec.name || key.charAt(0).toUpperCase() + key.slice(1);
  const score     = sec.score || 0;
  const potential = Math.min(100, score + 8 + Math.round((70 - score) * 0.3));
  return (
    <div
      className="sec-fu mt-3.5 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe]"
      style={{ animationDelay: "0.5s" }}
    >
      <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
        <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div>
        <p className="text-[11px] font-bold text-[#4c1d95] mb-0.5">Focus on {name} first</p>
        <p className="text-[11px] text-[#6d28d9] leading-relaxed">
          At {score}%, this is your biggest opportunity. Improving it could add up to{" "}
          <span className="font-bold">{potential - score} points</span> to your overall score.
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════════════════ */
export default function SectionAnalysis({ sectionBreakdown }) {
  const sections = sectionBreakdown || {};
  const [expanded, setExpanded] = useState(null);

  /* Filter to sections with real data, sort worst → best */
  const validSections = useMemo(() =>
    Object.entries(sections)
      .filter(([, sec]) => isValidSection(sec))
      .sort(([, a], [, b]) => (a.score || 0) - (b.score || 0)),
    [sections]
  );

  const avg = useMemo(() => {
    if (!validSections.length) return 0;
    return Math.round(validSections.reduce((sum, [, s]) => sum + (s.score || 0), 0) / validSections.length);
  }, [validSections]);

  return (
    <>
      <style>{`
        @keyframes secBarIn  { from{width:0} to{width:var(--sec-w)} }
        @keyframes secFadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .sec-bar { animation: secBarIn .9s cubic-bezier(.25,.46,.45,.94) forwards; }
        .sec-fu  { animation: secFadeUp .32s ease forwards; opacity:0; }
      `}</style>

      <div className="p-5">

        {/* Header */}
        <div className="sec-fu flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 border border-indigo-300 flex items-center justify-center shrink-0">
              <svg width="14" height="14" fill="none" stroke="#4f46e5" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M4 6h16M4 10h16M4 14h8M4 18h8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[13px] font-bold text-[var(--surface-900)]">Section Analysis</span>
            {validSections.length > 0 && (
              <span className="hidden sm:inline text-[10px] text-[var(--surface-500)] bg-[var(--surface-200)] border border-[var(--surface-300)] px-2 py-0.5 rounded-full">
                {validSections.length} section{validSections.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-[22px] font-bold text-indigo-600 leading-none tracking-tight">{avg}</div>
            <div className="text-[10px] text-[var(--surface-400)] mt-0.5">avg score</div>
          </div>
        </div>

        <p className="sec-fu text-[11px] text-[var(--surface-500)] mt-1 mb-3 leading-relaxed" style={{ animationDelay: "0.04s" }}>
          Per-section quality breakdown — click any row to expand improvement tips.
        </p>

        {validSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-100)] border-2 border-dashed border-[var(--surface-300)] flex items-center justify-center">
              <svg width="24" height="24" fill="none" stroke="var(--surface-400)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4 6h16M4 10h16M4 14h8M4 18h8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--surface-700)]">No section data</p>
              <p className="text-xs text-[var(--surface-400)] mt-1">Run a full analysis to see per-section breakdown.</p>
            </div>
          </div>
        ) : (
          <>
            <SummaryStrip validSections={validSections} />
            <div className="flex flex-col gap-[5px]">
              {validSections.map(([key, sec], idx) => (
                <SectionRow
                  key={key}
                  sectionKey={key}
                  sec={sec}
                  idx={idx}
                  isExpanded={expanded === key}
                  onToggle={() => setExpanded(p => p === key ? null : key)}
                />
              ))}
            </div>
            <WeakestInsight validSections={validSections} />
          </>
        )}
      </div>
    </>
  );
}