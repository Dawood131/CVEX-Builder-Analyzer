import React, { useState } from "react";
import { cn } from "../../../utils/helper";

/* ── Type config ─────────────────────────────────────────────────────────── */
const TYPE_CONFIG = {
  technical: {
    tag:    "bg-blue-100 border border-blue-300 text-blue-900 hover:shadow-blue-200",
    swatch: "bg-blue-100 border border-blue-300",
    label:  "Technical",
    icon: (
      <svg width="9" height="9" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  soft_skill: {
    tag:    "bg-purple-100 border border-purple-300 text-purple-900 hover:shadow-purple-200",
    swatch: "bg-purple-100 border border-purple-300",
    label:  "Soft skill",
    icon: (
      <svg width="9" height="9" fill="none" stroke="#9333ea" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  action_verb: {
    tag:    "bg-green-100 border border-green-300 text-green-900 hover:shadow-green-200",
    swatch: "bg-green-100 border border-green-300",
    label:  "Action verb",
    icon: (
      <svg width="9" height="9" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  job_match: {
    tag:    "bg-yellow-100 border border-yellow-300 text-yellow-900 hover:shadow-yellow-200",
    swatch: "bg-yellow-100 border border-yellow-300",
    label:  "Job match",
    icon: (
      <svg width="9" height="9" fill="none" stroke="#ca8a04" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" strokeLinecap="round" />
      </svg>
    ),
  },
};

const MISSING_ICON = (
  <svg width="9" height="9" fill="none" stroke="#dc2626" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Keyword tag ─────────────────────────────────────────────────────────── */
function KwTag({ kw, isMissing, delay }) {
  const cfg = isMissing ? null : (TYPE_CONFIG[kw.type] || TYPE_CONFIG.technical);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold",
        "cursor-default select-none transition-all duration-150",
        "hover:-translate-y-px hover:shadow-md",
        "opacity-0",
        isMissing
          ? "bg-red-100 border border-red-300 text-red-900 hover:shadow-red-200"
          : cfg.tag
      )}
      style={{ animation: `kwTagPop 0.2s ease ${delay}s forwards` }}
    >
      {isMissing ? MISSING_ICON : cfg.icon}
      {kw.keyword || kw}
    </span>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function KeywordMatch({ keywordScore = 0, matchedKeywords = [], missingKeywords = [] }) {
  const [tab,     setTab]     = useState("matched");
  const [showAll, setShowAll] = useState(false);

  const matched  = matchedKeywords;
  const missing  = missingKeywords;
  const total    = matched.length + missing.length;
  const matchPct = total > 0 ? Math.round((matched.length / total) * 100) : 0;

  const LIMIT      = 16;
  const activeList = tab === "matched" ? matched : missing;
  const shown      = showAll ? activeList : activeList.slice(0, LIMIT);
  const hasMore    = activeList.length > LIMIT;

  return (
    <>
      <style>{`
        @keyframes kwTagPop { from{opacity:0;transform:scale(.85)} to{opacity:1;transform:scale(1)} }
        @keyframes kwBarIn  { from{width:0} to{width:var(--kw-w)} }
        @keyframes kwFadeUp { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .kw-bar { animation: kwBarIn 1s cubic-bezier(.25,.46,.45,.94) forwards; }
        .kw-fu  { animation: kwFadeUp .3s ease forwards; opacity:0; }
      `}</style>

      <div className="p-5">

        {/* ── HEADER ─────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3 mb-1">

          <div className="flex items-center gap-2">
            {/* Icon box */}
            <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <svg width="14" height="14" fill="none" stroke="#d97706" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[13px] font-bold text-[var(--surface-900)]">Keyword Analysis</span>
            <span className="hidden sm:inline text-[10px] text-[var(--surface-500)] bg-[var(--surface-200)] border border-[var(--surface-300)] px-2 py-0.5 rounded-full">
              NLP matched
            </span>
          </div>

          {/* Score */}
          <div className="text-right shrink-0">
            <div className="text-[22px] font-bold text-amber-600 leading-none tracking-tight">{keywordScore}</div>
            <div className="text-[10px] text-[var(--surface-400)] mt-0.5">/ 100</div>
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-[var(--surface-500)] mt-1 mb-4 leading-relaxed">
          Role-specific terms found in your CV compared to industry benchmarks.
        </p>

        {/* ── SPLIT PROGRESS BAR ─────────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-[7px] h-[7px] rounded-full bg-amber-500" />
              <span className="text-[11px] text-[var(--surface-500)]">Match ratio</span>
            </div>
            <span className="text-[11px] text-[var(--surface-400)]">
              {matched.length} / {total} keywords
            </span>
          </div>

          {/* Segmented bar */}
          <div className="h-1.5 bg-[var(--surface-200)] rounded-full overflow-hidden flex gap-px">
            <div
              className="kw-bar h-full bg-green-600 rounded-l-full"
              style={{ "--kw-w": `${matchPct}%`, width: 0 }}
            />
            <div
              className="kw-bar h-full bg-red-500 rounded-r-full"
              style={{ "--kw-w": `${100 - matchPct}%`, width: 0, animationDelay: "0.08s" }}
            />
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-[10px] font-semibold text-green-700">{matched.length} matched</span>
            <span className="text-[10px] font-semibold text-red-600">{missing.length} missing</span>
          </div>
        </div>

        {/* ── STAT CARDS ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2 mb-4">

          <div className="kw-fu bg-green-100 border border-green-300 rounded-xl px-3 py-2.5" style={{ animationDelay: "0.08s" }}>
            <div className="text-[22px] font-bold text-green-800 leading-none tracking-tight">
              {matched.length}
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-green-700">
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Keywords matched
            </div>
          </div>

          <div className="kw-fu bg-red-100 border border-red-300 rounded-xl px-3 py-2.5" style={{ animationDelay: "0.14s" }}>
            <div className="text-[22px] font-bold text-red-800 leading-none tracking-tight">
              {missing.length}
            </div>
            <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold text-red-700">
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Keywords missing
            </div>
          </div>

        </div>

        {/* ── DIVIDER ────────────────────────────────────────── */}
        <div className="h-px bg-[var(--surface-200)] mb-3" />

        {/* ── SLIDING TAB ────────────────────────────────────── */}
        <div className="relative flex bg-[var(--surface-200)] rounded-[10px] p-[3px] gap-[3px] mb-3">

          {/* Sliding pill */}
          <div
            className="absolute top-[3px] bottom-[3px] bg-[var(--surface-50)] border border-[var(--surface-300)] rounded-[7px] transition-all duration-200 ease-out"
            style={{ left: tab === "matched" ? 3 : "calc(50% + 1.5px)", width: "calc(50% - 4.5px)" }}
          />

          {[
            ["matched", `✓ Matched (${matched.length})`, "text-green-700"],
            ["missing", `✗ Missing (${missing.length})`,  "text-red-700"],
          ].map(([key, label, activeColor]) => (
            <button
              key={key}
              onClick={() => { setTab(key); setShowAll(false); }}
              className={cn(
                "flex-1 py-[7px] text-[11px] font-semibold rounded-[7px]",
                "relative z-10 bg-transparent border-none cursor-pointer transition-colors duration-150",
                tab === key ? activeColor : "text-[var(--surface-400)] hover:text-[var(--surface-600)]"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── KEYWORD TAGS ───────────────────────────────────── */}
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto [scrollbar-width:thin]  mb-2 pb-1 pr-1">
          {shown.map((kw, i) => (
            <KwTag
              key={i}
              kw={kw}
              isMissing={tab === "missing"}
              delay={0.04 + i * 0.025}
            />
          ))}

          {activeList.length === 0 && (
            <p className="text-xs text-[var(--surface-400)] italic py-2">
              {tab === "matched" ? "No keywords matched yet." : "All relevant keywords found!"}
            </p>
          )}
        </div>

        {/* Show more / less */}
        {hasMore && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-[7px] rounded-lg border border-[var(--surface-300)] text-[11px] font-semibold text-[var(--surface-600)] bg-transparent hover:bg-[var(--surface-100)] transition-colors cursor-pointer"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {showAll
                ? <path d="M5 15l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
                : <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
              }
            </svg>
            {showAll ? "Show less" : `Show ${activeList.length - LIMIT} more`}
          </button>
        )}

        {/* ── LEGEND — matched tab only ──────────────────────── */}
        {tab === "matched" && matched.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-[var(--surface-200)]">
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
              <span key={key} className="flex items-center gap-1.5 text-[10px] text-[var(--surface-700)]">
                <span className={cn("w-2 h-2 rounded-[2px] inline-block", cfg.swatch)} />
                {cfg.label}
              </span>
            ))}
          </div>
        )}

        {/* ── MISSING HINT ───────────────────────────────────── */}
        {tab === "missing" && missing.length > 0 && (
          <div className="mt-3 pt-3 border-t border-[var(--surface-200)]">
            <p className="text-[10px] text-[var(--surface-400)] leading-relaxed">
              Add these terms to improve keyword match score and ATS compatibility.
            </p>
          </div>
        )}

      </div>
    </>
  );
}