import React, { useState } from "react";
import { cn } from "../../../utils/helper";

/* ── Priority config — vivid colors matching ATSScore/SectionAnalysis ────── */
const PRIORITY = {
  high: {
    label:       "Critical",
    dotBg:       "bg-red-600",
    dotIcon:     "error",
    cardBg:      "bg-red-50 border-red-300",
    badgeBg:     "bg-red-200 text-red-900",
    msgColor:    "text-red-900",
    catColor:    "text-red-700",
    tabCount:    "bg-red-100 text-red-700",
  },
  medium: {
    label:       "Important",
    dotBg:       "bg-yellow-500",
    dotIcon:     "warn",
    cardBg:      "bg-yellow-50 border-yellow-300",
    badgeBg:     "bg-yellow-200 text-yellow-900",
    msgColor:    "text-yellow-900",
    catColor:    "text-yellow-800",
    tabCount:    "bg-yellow-100 text-yellow-700",
  },
  low: {
    label:       "Optional",
    dotBg:       "bg-blue-600",
    dotIcon:     "info",
    cardBg:      "bg-blue-50 border-blue-300",
    badgeBg:     "bg-blue-200 text-blue-900",
    msgColor:    "text-blue-900",
    catColor:    "text-blue-800",
    tabCount:    "bg-blue-100 text-blue-700",
  },
};

const TABS = [
  { key: "all",    label: "All"       },
  { key: "high",   label: "Critical"  },
  { key: "medium", label: "Important" },
  { key: "low",    label: "Optional"  },
];

/* ── Dot icons ───────────────────────────────────────────────────────────── */
function DotIcon({ type }) {
  const paths = {
    error: <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />,
    warn:  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />,
    info:  <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" strokeLinecap="round" strokeLinejoin="round" /></>,
  };
  return (
    <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
      {paths[type]}
    </svg>
  );
}

/* ── Copy button ─────────────────────────────────────────────────────────── */
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };
  return (
    <button
      onClick={copy}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer border-none",
        copied
          ? "bg-emerald-100 text-emerald-700"
          : "bg-[var(--surface-200)] hover:bg-[var(--surface-300)] text-[var(--surface-600)] hover:text-[var(--surface-900)]"
      )}
    >
      {copied ? (
        <>
          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z"/>
            <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z"/>
          </svg>
          Copy rewrite
        </>
      )}
    </button>
  );
}

/* ── Single suggestion card ──────────────────────────────────────────────── */
function SuggestionCard({ suggestion, globalIndex, idx }) {
  const [expanded, setExpanded] = useState(false);
  const cfg        = PRIORITY[suggestion.priority] || PRIORITY.low;
  const hasRewrite = !!(suggestion.rewrite?.trim());

  return (
    <div
      className={cn(
        "sgp-fu rounded-xl border overflow-hidden transition-all duration-150",
        cfg.cardBg,
      )}
      style={{ animationDelay: `${0.13 + idx * 0.05}s` }}
    >
      {/* ── Row button ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-start gap-2.5 px-3.5 py-3 text-left cursor-pointer bg-transparent border-none transition-all hover:brightness-[.97]"
      >
        {/* Priority dot */}
        <div className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          cfg.dotBg
        )}>
          <DotIcon type={cfg.dotIcon} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Meta row */}
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            {/* Priority badge */}
            <span className={cn(
              "text-[9px] font-bold px-[7px] py-[2px] rounded-[4px] uppercase tracking-[.04em]",
              cfg.badgeBg
            )}>
              {cfg.label}
            </span>

            {/* Category pill */}
            {suggestion.category && (
              <span className="text-[9px] font-semibold text-[var(--surface-500)] bg-[var(--surface-200)] px-[6px] py-[1px] rounded-[4px] capitalize">
                {suggestion.category}
              </span>
            )}

            {/* Rewrite indicator */}
            {hasRewrite && !expanded && (
              <span className="text-[9px] text-emerald-700 font-semibold flex items-center gap-1">
                <svg width="8" height="8" fill="#059669" viewBox="0 0 16 16">
                  <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zm-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z"/>
                  <path fillRule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.1z"/>
                </svg>
                Rewrite ready
              </span>
            )}
          </div>

          {/* Message */}
          <p className={cn("text-[11px] leading-relaxed", cfg.msgColor)}>
            {suggestion.message}
          </p>
        </div>

        {/* Chevron */}
        <svg
          width="12" height="12" fill="none" stroke="var(--surface-400)"
          strokeWidth="2" viewBox="0 0 24 24"
          className={cn("shrink-0 mt-0.5 transition-transform duration-200", expanded && "rotate-180")}
        >
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* ── Expanded: rewrite panel ── */}
      {expanded && hasRewrite && (
        <div className="px-3.5 pb-3.5" style={{ marginLeft: 34 }}>
          <div className="rounded-xl border border-[var(--surface-200)] overflow-hidden bg-[var(--surface-50)]">
            {/* Rewrite header */}
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border-b border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1.5">
                <svg width="11" height="11" fill="#10b981" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd"/>
                </svg>
                Suggested rewrite
              </span>
              <CopyButton text={suggestion.rewrite} />
            </div>
            {/* Rewrite text */}
            <p className="px-3 py-2.5 text-[11px] text-[var(--surface-800)] leading-relaxed italic">
              "{suggestion.rewrite}"
            </p>
          </div>
        </div>
      )}

      {/* ── Expanded: no rewrite ── */}
      {expanded && !hasRewrite && (
        <div className="px-3.5 pb-3" style={{ marginLeft: 34 }}>
          <p className="text-[10px] text-[var(--surface-400)] italic">
            No direct rewrite available for this suggestion.
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Summary stat cards ──────────────────────────────────────────────────── */
function StatStrip({ counts }) {
  const pills = [
    { count: counts.high,   label: "Critical",  bg: "bg-red-100 border border-red-300",     num: "text-red-800",    sub: "text-red-700"    },
    { count: counts.medium, label: "Important", bg: "bg-yellow-100 border border-yellow-300",num: "text-yellow-800", sub: "text-yellow-700" },
    { count: counts.low,    label: "Optional",  bg: "bg-blue-100 border border-blue-300",    num: "text-blue-800",   sub: "text-blue-700"   },
  ].filter(p => p.count > 0);

  if (!pills.length) return null;
  return (
    <div className="sgp-fu grid gap-1.5 mb-3" style={{ gridTemplateColumns: `repeat(${pills.length}, 1fr)`, animationDelay: "0.07s" }}>
      {pills.map(({ count, label, bg, num, sub }) => (
        <div key={label} className={cn("px-2.5 py-2 rounded-xl text-center", bg)}>
          <div className={cn("text-[18px] font-bold leading-none tracking-tight", num)}>{count}</div>
          <div className={cn("text-[9px] font-bold mt-1 uppercase tracking-[.05em]", sub)}>{label}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Empty / all-good state ──────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-3">
      <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center">
        <svg width="26" height="26" fill="none" stroke="#16a34a" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-green-800">Looking great!</p>
        <p className="text-xs text-[var(--surface-400)] mt-1 leading-relaxed">No major improvements needed. Your CV is well-optimised.</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */
export default function SuggestionsPanel({ suggestions = [] }) {
  const [activeTab, setActiveTab] = useState("all");

  const counts = {
    all:    suggestions.length,
    high:   suggestions.filter(s => s.priority === "high").length,
    medium: suggestions.filter(s => s.priority === "medium").length,
    low:    suggestions.filter(s => s.priority === "low").length,
  };

  const filtered = activeTab === "all"
    ? suggestions
    : suggestions.filter(s => s.priority === activeTab);

  const withRewrites = suggestions.filter(s => s.rewrite?.trim()).length;

  /* Sort: high → medium → low within each tab */
  const ORDER = { high: 0, medium: 1, low: 2 };
  const displayList = [...filtered].sort(
    (a, b) => (ORDER[a.priority] ?? 9) - (ORDER[b.priority] ?? 9)
  );

  return (
    <>
      <style>{`
        @keyframes sgpFadeUp { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .sgp-fu { animation: sgpFadeUp .3s ease forwards; opacity:0; }
      `}</style>

      <div className="p-5">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="sgp-fu flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <svg width="14" height="14" fill="none" stroke="#d97706" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[13px] font-bold text-[var(--surface-900)]">Suggestions</span>
            {suggestions.length > 0 && (
              <span className="hidden sm:inline text-[10px] text-[var(--surface-500)] bg-[var(--surface-200)] border border-[var(--surface-300)] px-2 py-0.5 rounded-full">
                {suggestions.length} tip{suggestions.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {withRewrites > 0 && (
            <div className="text-right shrink-0">
              <div className="text-[11px] font-bold text-emerald-700">{withRewrites} rewrite{withRewrites > 1 ? "s" : ""} ready</div>
              <div className="text-[10px] text-[var(--surface-400)] mt-0.5">copy &amp; paste</div>
            </div>
          )}
        </div>

        <p className="sgp-fu text-[11px] text-[var(--surface-500)] mt-1 mb-3 leading-relaxed" style={{ animationDelay: "0.04s" }}>
          Actionable improvements to boost your score — expand any tip for a ready-to-use rewrite.
        </p>

        {/* ── EMPTY STATE ────────────────────────────────────────── */}
        {suggestions.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Stat strip */}
            <StatStrip counts={counts} />

            {/* ── SLIDING TAB ──────────────────────────────────── */}
            <div className="sgp-fu relative flex bg-[var(--surface-200)] rounded-[10px] p-[3px] gap-[3px] mb-3" style={{ animationDelay: "0.1s" }}>
              {/* Sliding pill */}
              <div
                className="absolute top-[3px] bottom-[3px] bg-[var(--surface-50)] border border-[var(--surface-300)] rounded-[7px] transition-all duration-200 ease-out"
                style={{
                  width:  `calc(${100 / TABS.filter(t => t.key === "all" || counts[t.key] > 0).length}% - ${TABS.filter(t => t.key === "all" || counts[t.key] > 0).length > 1 ? "3px" : "2px"})`,
                  left:   (() => {
                    const visibleTabs = TABS.filter(t => t.key === "all" || counts[t.key] > 0);
                    const idx = visibleTabs.findIndex(t => t.key === activeTab);
                    const pct = 100 / visibleTabs.length;
                    return `calc(${idx * pct}% + 3px)`;
                  })(),
                }}
              />

              {TABS.filter(t => t.key === "all" || counts[t.key] > 0).map((tab) => {
                const countBg =
                  tab.key === "high"   ? "bg-red-100 text-red-700" :
                  tab.key === "medium" ? "bg-yellow-100 text-yellow-700" :
                  tab.key === "low"    ? "bg-blue-100 text-blue-700" :
                                         "bg-[var(--surface-300)] text-[var(--surface-600)]";

                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 py-[7px] text-[10px] font-semibold rounded-[7px]",
                      "relative z-10 bg-transparent border-none cursor-pointer transition-colors duration-150",
                      activeTab === tab.key ? "text-[var(--surface-900)]" : "text-[var(--surface-400)] hover:text-[var(--surface-600)]"
                    )}
                  >
                    {tab.label}
                    <span className={cn("text-[9px] font-bold px-1.5 py-[1px] rounded-full min-w-[16px] text-center", countBg)}>
                      {counts[tab.key]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── SUGGESTION CARDS ─────────────────────────────── */}
            {displayList.length === 0 ? (
              <p className="text-xs text-center text-[var(--surface-400)] py-4">
                No {activeTab} priority suggestions.
              </p>
            ) : (
              <div className="flex flex-col gap-[6px]">
                {displayList.map((s, idx) => (
                  <SuggestionCard
                    key={idx}
                    suggestion={s}
                    globalIndex={suggestions.indexOf(s)}
                    idx={idx}
                  />
                ))}
              </div>
            )}

            {/* ── BOTTOM INSIGHT ───────────────────────────────── */}
            {counts.high > 0 && activeTab === "all" && (
              <div
                className="sgp-fu mt-3.5 flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe]"
                style={{ animationDelay: `${0.15 + displayList.length * 0.04}s` }}
              >
                <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-0.5">
                  <svg width="10" height="10" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-[#4c1d95] mb-0.5">
                    Fix Critical issues first
                  </p>
                  <p className="text-[11px] text-[#6d28d9] leading-relaxed">
                    You have <span className="font-bold">{counts.high} critical</span> issue{counts.high > 1 ? "s" : ""} that will have the most impact on your score.
                    {withRewrites > 0 && <> {withRewrites} ready-to-paste rewrite{withRewrites > 1 ? "s" : ""} available — click any card to expand.</>}
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