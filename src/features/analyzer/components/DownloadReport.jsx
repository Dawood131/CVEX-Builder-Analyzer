import React, { useState } from "react";
import { cn } from "../../../utils/helper";
import { exportCVToPDF } from "../../editor/exportPdf";

/* ── helpers ─────────────────────────────────────────────────────────────── */
const scoreHex = (s) =>
  s >= 80 ? "#10b981" : s >= 60 ? "#3b82f6" : s >= 40 ? "#f59e0b" : "#ef4444";

const scoreTier = (s) =>
  s >= 80 ? { label: "Strong", bg: "#dcfce7", fg: "#166534" }
    : s >= 60 ? { label: "Good", bg: "#dbeafe", fg: "#1e40af" }
      : s >= 40 ? { label: "Fair", bg: "#fef9c3", fg: "#92400e" }
        : { label: "Critical", bg: "#fee2e2", fg: "#991b1b" };

const priCfg = (p) =>
  p === "high" ? { bg: "#fee2e2", border: "#fca5a5", fg: "#991b1b", dot: "#dc2626", lbl: "Critical" }
    : p === "medium" ? { bg: "#fefce8", border: "#fde047", fg: "#92400e", dot: "#ca8a04", lbl: "Important" }
      : { bg: "#eff6ff", border: "#bfdbfe", fg: "#1e40af", dot: "#2563eb", lbl: "Optional" };

const atsCfg = (t) =>
  t === "pass" ? { dot: "#16a34a", fg: "#14532d", lbl: "PASS" }
    : t === "warning" ? { dot: "#ca8a04", fg: "#713f12", lbl: "WARN" }
      : t === "error" ? { dot: "#dc2626", fg: "#7f1d1d", lbl: "ERROR" }
        : { dot: "#2563eb", fg: "#1e3a8a", lbl: "INFO" };


export function renderAnalysisHTML(r) {
  if (!r) return "";

  const cvName = r.meta?.cvName || "Untitled CV";
  const ind = r.meta?.industry ? r.meta.industry.charAt(0).toUpperCase() + r.meta.industry.slice(1) : "";
  const date = new Date(r.analyzedAt || r.timestamp || Date.now())
    .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const sc = r.overallScore || 0;

  /* tiny bar */
  const bar = (pct, hex) =>
    `<div style="height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden;margin-top:3px"><div style="height:100%;width:${Math.max(2, Math.min(100, pct))}%;background:${hex};border-radius:3px"></div></div>`;

  /* inline badge */
  const badge = (txt, bg, fg) =>
    `<span style="display:inline-block;padding:1px 7px;border-radius:4px;font-size:8.5px;font-weight:700;background:${bg};color:${fg}">${txt}</span>`;

  /* ── score metrics grid (5 cols) ── */
  const metrics = [
    ["Content", r.contentScore || 0, "30%"],
    ["ATS", r.atsScore || 0, "25%"],
    ["Keywords", r.keywordScore || 0, "20%"],
    ["Formatting", r.formattingScore || 0, "15%"],
    ["Writing", r.grammarScore || 0, "10%"],
  ].map(([lbl, val, wt]) => {
    const h = scoreHex(val);
    return `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:7px;padding:7px 8px;text-align:center">
      <div style="font-size:16px;font-weight:800;color:${h};line-height:1">${val}</div>
      <div style="font-size:8px;color:#64748b;margin-top:2px">${lbl}<span style="color:#94a3b8"> ${wt}</span></div>
      ${bar(val, h)}
    </div>`;
  }).join("");

  /* ── ATS: max 5 ── */
  const atsRows = (r.atsDetails || []).slice(0, 5).map(d => {
    const c = atsCfg(d.type);
    return `<div style="display:flex;align-items:flex-start;gap:7px;padding:5px 0;border-bottom:1px solid #f1f5f9">
      <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${c.dot};flex-shrink:0;margin-top:2px"></span>
      <span style="font-size:8px;font-weight:700;color:${c.dot};flex-shrink:0;width:28px">${c.lbl}</span>
      <span style="font-size:9.5px;color:${c.fg};line-height:1.4">${d.title || d.label || d.msg || ""}</span>
    </div>`;
  }).join("");

  /* ── suggestions: top 5, sorted high→med→low, no rewrite box ── */
  const sortedSugg = [...(r.suggestions || [])]
    .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] ?? 9) - ({ high: 0, medium: 1, low: 2 }[b.priority] ?? 9))
    .slice(0, 5);

  const suggRows = sortedSugg.map(s => {
    const c = priCfg(s.priority);
    return `<div style="display:flex;align-items:flex-start;gap:7px;padding:5px 8px;border-radius:7px;background:${c.bg};border:1px solid ${c.border};margin-bottom:5px">
      <span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${c.dot};flex-shrink:0;margin-top:3px"></span>
      <div style="flex:1;min-width:0">
        <span style="font-size:8px;font-weight:700;color:${c.dot}">${c.lbl}&nbsp;&nbsp;</span>
        ${s.category ? `<span style="font-size:8px;color:#94a3b8;text-transform:capitalize">${s.category}</span>` : ""}
        <p style="font-size:9.5px;color:${c.fg};margin:2px 0 0;line-height:1.4">${s.message || ""}</p>
      </div>
    </div>`;
  }).join("");

  /* ── keywords: max 12 each, inline tags ── */
  const kwTag = (kw, isMissing) => {
    const word = kw.keyword || kw;
    const bg = isMissing ? "#fee2e2" : "#e0e7ff";
    const fg = isMissing ? "#991b1b" : "#3730a3";
    return `<span style="display:inline-block;padding:2px 8px;border-radius:5px;font-size:9px;font-weight:600;background:${bg};color:${fg};margin:2px 3px 2px 0">${word}</span>`;
  };
  const matchedKws = (r.matchedKeywords || []).slice(0, 12);
  const missingKws = (r.missingKeywords || []).slice(0, 12);

  /* ── section breakdown: valid, max 6, sorted worst→best ── */
  const validSec = Object.entries(r.sectionBreakdown || {})
    .filter(([, s]) => s && typeof s.score === "number" &&
      !(s.score === 0 && !s.name && !(s.suggestions?.length)))
    .sort(([, a], [, b]) => (a.score || 0) - (b.score || 0))
    .slice(0, 6);

  const secRows = validSec.map(([key, sec]) => {
    const h = scoreHex(sec.score || 0);
    const t = scoreTier(sec.score || 0);
    const name = sec.name || key.charAt(0).toUpperCase() + key.slice(1);
    return `<div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid #f8fafc">
      <span style="font-size:9.5px;font-weight:600;color:#374151;width:90px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</span>
      <div style="flex:1">${bar(sec.score || 0, h)}</div>
      ${badge(t.label, t.bg, t.fg)}
      <span style="font-size:10px;font-weight:800;color:${h};width:28px;text-align:right;flex-shrink:0">${sec.score || 0}%</span>
    </div>`;
  }).join("");

  /* ── section header helper ── */
  const sh = (title) =>
    `<div style="display:flex;align-items:center;gap:6px;margin:14px 0 8px">
      <div style="width:3px;height:14px;background:#4f46e5;border-radius:2px;flex-shrink:0"></div>
      <span style="font-size:11px;font-weight:800;color:#0f172a;letter-spacing:-.01em">${title}</span>
    </div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;
    background:#fff;color:#1e293b;font-size:10px;line-height:1.4;
    -webkit-print-color-adjust:exact;print-color-adjust:exact;
    padding:0 8mm 12mm 8mm;
  }
  @page{
    size:A4;
    margin:0;
  }
  @media print{
    body{zoom:.93}
  }
</style>
</head>
<body>

<!-- ══ HEADER BAND ══════════════════════════════════════════════════════ -->
<div style="background:linear-gradient(135deg,#4338ca 0%,#6d28d9 100%);padding:16px 8mm;display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:14px;margin-left:-8mm;margin-right:-8mm;">

  <!-- Left: title + meta -->
  <div style="flex:1;min-width:0">
    <div style="font-size:8px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#a5b4fc;margin-bottom:4px">CVEX AI Analyzer</div>
    <div style="font-size:18px;font-weight:800;color:#fff;line-height:1.1;margin-bottom:4px">Resume Analysis Report</div>
  </div>

  <!-- Score ring -->
  <div style="text-align:center;flex-shrink:0">
    <div style="width:72px;height:72px;border-radius:50%;border:3px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);display:flex;flex-direction:column;align-items:center;justify-content:center">
      <span style="font-size:24px;font-weight:900;color:#fff;line-height:1">${sc}</span>
      <span style="font-size:8px;color:#a5b4fc">/&nbsp;100</span>
    </div>
    <div style="font-size:10px;font-weight:700;color:#e0e7ff;margin-top:4px">Grade: ${r.grade || "—"}</div>
  </div>

</div>

<!-- ══ METRICS GRID ═══════════════════════════════════════════════════════ -->
<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:4px">
  ${metrics}
</div>

<!-- ══ TWO COLUMN LAYOUT ════════════════════════════════════════════════ -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:14px">

  <!-- LEFT COL -->
  <div>
    ${atsRows ? `${sh("ATS Checks")}${atsRows}` : ""}
    ${secRows ? `${sh("Section Scores")}${secRows}` : ""}
  </div>

  <!-- RIGHT COL -->
  <div>
    ${suggRows ? `${sh("Top Suggestions")}${suggRows}` : ""}
  </div>

</div>

<!-- ══ KEYWORDS ═══════════════════════════════════════════════════════════ -->
${matchedKws.length || missingKws.length ? `
<div style="margin-top:14px">
  ${sh("Keywords")}
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
    ${matchedKws.length ? `
    <div>
      <div style="font-size:8.5px;font-weight:700;color:#15803d;margin-bottom:5px">✓ Matched (${matchedKws.length})</div>
      <div style="line-height:1.9">${matchedKws.map(k => kwTag(k, false)).join("")}</div>
    </div>` : ""}
    ${missingKws.length ? `
    <div>
      <div style="font-size:8.5px;font-weight:700;color:#b91c1c;margin-bottom:5px">✗ Missing (${missingKws.length})</div>
      <div style="line-height:1.9">${missingKws.map(k => kwTag(k, true)).join("")}</div>
    </div>` : ""}
  </div>
</div>` : ""}

<!-- ══ FOOTER ════════════════════════════════════════════════════════════ -->
<div style="margin-top:16px;padding-top:8px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
  <span style="font-size:8.5px;color:#94a3b8">Generated by CVEX AI Analyzer — cvex.app</span>
  <span style="font-size:8.5px;color:#94a3b8">${date}</span>
</div>

</body>
</html>`;
}

/* ── What's included ─────────────────────────────────────────────────────── */
const INCLUDES = [
  "Overall score + grade",
  "5-metric breakdown",
  "ATS checks",
  "Top 5 suggestions",
  "Keyword analysis",
  "Section scores",
];

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENT
════════════════════════════════════════════════════════════════════════════ */
export default function DownloadReport({ analysisResult, showToast }) {
  const [state, setState] = useState("idle");

const handleDownload = async () => {
  if (!analysisResult) {
    showToast?.("No analysis data.", "error");
    return;
  }

  try {
    setState("loading");
    let baseName = analysisResult.meta?.cvName || "Resume";
    baseName = baseName.replace(/\.pdf$/i, "");
    baseName = baseName.replace(/[^\w\s]/g, "").trim();
    baseName = baseName.replace(/\s+/g, "_");
    const fileName = `${baseName}_Report`; 
    const html = renderAnalysisHTML(analysisResult);
    await exportCVToPDF(null, fileName, html);
    setState("done");
    showToast?.("Report downloaded!", "success");
    setTimeout(() => setState("idle"), 3000);
  } catch (err) {
    console.error(err);
    setState("error");
    showToast?.("Failed to generate report.", "error");
    setTimeout(() => setState("idle"), 3000);
  }
};

  return (
    <>
      <style>{`
        @keyframes dlFu{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
        .dl-fu{animation:dlFu .3s ease forwards;opacity:0}
        @keyframes dlSh{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
      `}</style>

      <div className="p-5">

        {/* Header */}
        <div className="dl-fu flex items-start justify-between gap-3 mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0">
              <svg width="14" height="14" fill="none" stroke="#e11d48" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[13px] font-bold text-[var(--surface-900)]">Download Report</span>
            <span className="hidden sm:inline text-[10px] text-[var(--surface-500)] bg-[var(--surface-200)] border border-[var(--surface-300)] px-2 py-0.5 rounded-full">PDF</span>
          </div>
        </div>

        <p className="dl-fu text-[11px] text-[var(--surface-500)] mt-1 mb-3 leading-relaxed" style={{ animationDelay: "0.04s" }}>
          A clean 1-page summary — score, ATS checks, top suggestions, and keywords.
        </p>

        {/* Includes grid */}
        <div className="dl-fu grid grid-cols-2 gap-1 mb-4 p-3 rounded-xl bg-[var(--surface-100)] border border-[var(--surface-200)]" style={{ animationDelay: "0.08s" }}>
          <p className="col-span-2 text-[10px] font-bold uppercase tracking-widest text-[var(--surface-400)] mb-1">Includes</p>
          {INCLUDES.map(text => (
            <div key={text} className="flex items-center gap-1.5 text-[11px] text-[var(--surface-600)]">
              <div className="w-4 h-4 rounded-md bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                <svg width="9" height="9" fill="none" stroke="#4f46e5" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {text}
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="dl-fu" style={{ animationDelay: "0.12s" }}>
          <button
            onClick={handleDownload}
            disabled={state === "loading" || !analysisResult}
            className={cn(
              "w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2",
              "transition-all duration-200 relative overflow-hidden cursor-pointer border-none",
              state === "done" ? "bg-emerald-600 text-white"
                : state === "error" ? "bg-red-500 text-white"
                  : state === "loading" || !analysisResult
                    ? "opacity-50 cursor-not-allowed bg-[var(--surface-300)] text-[var(--surface-500)]"
                    : "text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            )}
            style={state === "idle" && analysisResult
              ? { background: "linear-gradient(135deg,#e11d48 0%,#9f1239 100%)" } : {}}
          >
            {state === "idle" && analysisResult && (
              <span className="absolute inset-0 pointer-events-none" style={{
                background: "linear-gradient(105deg,transparent 40%,rgba(255,255,255,0.15) 50%,transparent 60%)",
                animation: "dlSh 2.5s infinite",
              }} />
            )}

            {state === "loading" ? <><svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" opacity="0.25" /><path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating PDF…</>
              : state === "done" ? <><svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>Downloaded!</>
                : state === "error" ? <><svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" /></svg>Failed — try again</>
                  : <><svg width="15" height="15" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" /></svg>Download PDF Report</>}
          </button>
        </div>
      </div>
    </>
  );
}