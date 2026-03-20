import React, { useState, useEffect, useRef, useCallback } from "react";
import { useCV } from "../../../context/CVContext";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../utils/helper";
import { Button } from "../../../shared/ui/UIComponents";
import ATSScore from "../components/ATSScore";
import KeywordMatch from "../components/KeywordMatch";
import ImpactMetrics from "../components/ImpactMetrics";
import SectionAnalysis from "../components/SectionAnalysis";
import SkillsGapRadar from "../components/SkillsGapRadar";
import SuggestionsPanel from "../components/SuggestionsPanel";
import DownloadReport from "../components/DownloadReport";
import { AnalyzerEngine } from "../analyzerEngine";
import {
  FaBrain, FaBolt, FaChartPie, FaSlidersH, FaSpinner,
  FaFilePdf, FaCloudUploadAlt, FaIndustry, FaBullseye,
  FaChartBar, FaShieldAlt, FaKey, FaPalette, FaFeather,
  FaMoon, FaSun, FaCheckCircle, FaTimes, FaPen, FaArrowLeft,
  FaExclamationCircle, FaRegFileAlt, FaLaptopCode, FaHeartbeat,
  FaGraduationCap, FaChartLine, FaDollarSign, FaHardHat,
  FaFlask, FaUsers, FaGlobe, FaStore, FaClipboardList,
  FaLightbulb, FaPaste, FaTimesCircle,
} from "react-icons/fa";
import {
  FaClockRotateLeft, FaTrash, FaXmark, FaArrowRotateLeft,
} from "react-icons/fa6";

/* ─── PDF.js ─────────────────────────────────────────────────────────────── */
const PDFJS_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = PDFJS_CDN; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  return window.pdfjsLib;
}

async function extractPdfText(file) {
  const lib = await loadPdfJs();
  const pdf = await lib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    pages.push(content.items.map(item => item.str).join(" "));
  }
  return pages.join("\n\n");
}

/* ─── Score colour helper ────────────────────────────────────────────────── */
function scoreColor(s) {
  if (s >= 80) return { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", hex: "#10b981" };
  if (s >= 65) return { text: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", hex: "#3b82f6" };
  if (s >= 50) return { text: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", hex: "#f59e0b" };
  return { text: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", hex: "#ef4444" };
}

function gradeHex(score) {
  if (score >= 80) return "#10b981";
  if (score >= 65) return "#3b82f6";
  if (score >= 50) return "#f59e0b";
  return "#ef4444";
}

/* ─── Circular progress ──────────────────────────────────────────────────── */
function CircleScore({ score = 0, size = 80, stroke = 7 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const col = scoreColor(pct);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-200)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col.hex} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

function MiniBar({ score = 0, label, weight, icon: Icon }) {
  const col = scoreColor(score);
  return (
    <div className="flex items-center gap-3">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", col.bg, col.border, "border")}>
        <Icon className={cn("text-xs", col.text)} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[var(--surface-700)]">{label}</span>
          <div className="flex items-center gap-1.5">
            <span className={cn("text-xs font-bold tabular-nums", col.text)}>{score}</span>
            <span className="text-[10px] text-[var(--surface-400)]">{weight}</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--surface-200)] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${score}%`, backgroundColor: col.hex }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Swipe-to-close hook ────────────────────────────────────────────────── */
function useSwipeToClose({ onClose, isOpen, threshold = 80 }) {
  const drawerRef = useRef(null);
  const handleRef = useRef(null);
  const startY = useRef(null);
  const currentY = useRef(null);
  const isDragging = useRef(false);
  const animFrameId = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const handle = handleRef.current;
    const drawer = drawerRef.current;
    if (!handle || !drawer) return;
    const onTouchStart = (e) => {
      if (!isOpen) return;
      startY.current = e.touches[0].clientY;
      currentY.current = e.touches[0].clientY;
      isDragging.current = true;
      drawer.style.transition = "none";
    };
    const onTouchMove = (e) => {
      if (!isDragging.current) return;
      currentY.current = e.touches[0].clientY;
      const diff = Math.max(0, currentY.current - startY.current);
      if (diff > 0) {
        e.preventDefault();
        if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
        animFrameId.current = requestAnimationFrame(() => {
          if (drawer) drawer.style.transform = `translateY(${diff}px)`;
        });
      }
    };
    const onTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const diff = Math.max(0, (currentY.current ?? 0) - (startY.current ?? 0));
      drawer.style.transition = "";
      drawer.style.transform = "";
      if (diff > threshold) onCloseRef.current();
      startY.current = null;
      currentY.current = null;
    };
    handle.addEventListener("touchstart", onTouchStart, { passive: true });
    handle.addEventListener("touchmove", onTouchMove, { passive: false });
    handle.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      handle.removeEventListener("touchstart", onTouchStart);
      handle.removeEventListener("touchmove", onTouchMove);
      handle.removeEventListener("touchend", onTouchEnd);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      if (drawer) { drawer.style.transform = ""; drawer.style.transition = ""; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold]);

  return { drawerRef, handleRef };
}

/* ─── Industry config ────────────────────────────────────────────────────── */
const INDUSTRY_OPTIONS = [
  { id: "technology", label: "Technology", icon: FaLaptopCode, color: "text-blue-500", bg: "bg-blue-500/10" },
  { id: "healthcare", label: "Healthcare", icon: FaHeartbeat, color: "text-rose-500", bg: "bg-rose-500/10" },
  { id: "finance", label: "Finance", icon: FaDollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { id: "education", label: "Education", icon: FaGraduationCap, color: "text-amber-500", bg: "bg-amber-500/10" },
  { id: "marketing", label: "Marketing", icon: FaChartLine, color: "text-purple-500", bg: "bg-purple-500/10" },
  { id: "engineering", label: "Engineering", icon: FaHardHat, color: "text-orange-500", bg: "bg-orange-500/10" },
  { id: "science", label: "Science", icon: FaFlask, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  { id: "hr", label: "HR", icon: FaUsers, color: "text-pink-500", bg: "bg-pink-500/10" },
  { id: "legal", label: "Legal", icon: FaClipboardList, color: "text-slate-500", bg: "bg-slate-500/10" },
  { id: "retail", label: "Retail", icon: FaStore, color: "text-yellow-500", bg: "bg-yellow-500/10" },
];

/* ─── CV completion calc ─────────────────────────────────────────────────── */
function calcCompletion(cvData) {
  const checks = [
    !!(cvData.personal?.firstName),
    !!(cvData.personal?.email),
    !!(cvData.personal?.phone),
    !!(cvData.personal?.title),
    (cvData.experience || []).length > 0,
    (cvData.skills || []).length > 0,
    !!(cvData.summary?.text),
    (cvData.education || []).length > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function AnalyzerPage() {
  const navigate = useNavigate();
  const { cvData, darkMode, setDarkMode, showToast } = useCV();
  const fileInputRef = useRef(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [jd, setJd] = useState("");
  const [industry, setIndustry] = useState("technology");
  const [source, setSource] = useState("builder");
  const [mobileTab, setMobileTab] = useState("input");
  const [dragging, setDragging] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfText, setPdfText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);

  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cvex_analyzerHistory") || "[]"); }
    catch { return []; }
  });

  // Add this after the history state initialization (around line where scanData is)

  const [result, setResult] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cvex_currentAnalysis"));
      if (stored) return stored;
    } catch { }
    return null;
  });

  // Add this useEffect to persist result whenever it changes
  useEffect(() => {
    try {
      if (result) {
        localStorage.setItem("cvex_currentAnalysis", JSON.stringify(result));
      } else {
        localStorage.removeItem("cvex_currentAnalysis");
      }
    } catch { }
  }, [result]);

  const DAILY_LIMIT = 300;
  const isPro = false;

  const [scanData, setScanData] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("cvex_scanData"));
      const today = new Date().toDateString();
      if (stored?.date === today) return stored;
      return { count: 0, date: today };
    } catch {
      return { count: 0, date: new Date().toDateString() };
    }
  });

  const remainingScans = DAILY_LIMIT - scanData.count;

  useEffect(() => {
    try { localStorage.setItem("cvex_analyzerHistory", JSON.stringify(history.slice(0, 20))); }
    catch { }
  }, [history]);

  useEffect(() => { localStorage.setItem("cvex_scanData", JSON.stringify(scanData)); }, [scanData]);

  const closeHistory = useCallback(() => setHistoryOpen(false), []);
  const { drawerRef: historyDrawerRef, handleRef: historyHandleRef } = useSwipeToClose({
    onClose: closeHistory, isOpen: historyOpen, threshold: 80,
  });

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { setHistoryOpen(false); setDeleteConfirm(null); setClearAllConfirm(false); }
      if (e.key === "h" && !e.ctrlKey && !e.metaKey && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        setHistoryOpen(v => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handlePdf = async (file) => {
    if (!file || file.type !== "application/pdf") { setPdfError("Only PDF files are supported."); return; }
    if (file.size > 10 * 1024 * 1024) { setPdfError("File too large. Max 10MB."); return; }
    setPdfError(""); setParsing(true); setPdfFile(file); setPdfText("");
    try {
      const text = await extractPdfText(file);
      if (!text || text.trim().length < 50) {
        setPdfError("Could not extract text. Use a text-based PDF.");
        setPdfFile(null); return;
      }
      setPdfText(text);
      showToast(`PDF parsed — ${text.split(" ").filter(Boolean).length} words`, "success");
    } catch { setPdfError("Failed to parse PDF."); setPdfFile(null); }
    finally { setParsing(false); }
  };

  const runAnalysis = async () => {
    if (!isPro && scanData.count >= DAILY_LIMIT) {
      showToast("Daily limit reached (3 scans/day)", "error"); return;
    }
    const cv = source === "upload"
      ? (pdfText ? { _pdfText: pdfText, _pdfName: pdfFile?.name } : null) : cvData;
    if (!cv) { showToast(source === "upload" ? "Upload a PDF first." : "No CV data found.", "error"); return; }
    try {
      setAnalyzing(true);
      showToast("Analyzing with Gemini AI…", "info");
      const r = await AnalyzerEngine.analyze(cv, { jobDescription: jd, industry });
      setResult(r);
      setHistory(prev => [r, ...prev.slice(0, 19)]);
      setScanData(prev => ({ ...prev, count: prev.count + 1 }));
      setMobileTab("results");
      showToast(`Done! Score: ${r.overallScore}/100`, "success");
    } catch (e) {
      console.error(e);
      showToast("Analysis failed. Please try again.", "error");
    } finally { setAnalyzing(false); }
  };

  const canAnalyze = analyzing || parsing || (source === "upload" && !pdfText);

  /* ── Derived sidebar values ──────────────────────────────────────────── */
  const wordCount = jd.trim() ? jd.trim().split(/\s+/).length : 0;
  const completion = source === "builder" ? calcCompletion(cvData) : null;
  const completionColor = completion >= 80 ? "#10b981" : completion >= 60 ? "#f59e0b" : "#ef4444";

  const handlePaste = useCallback(async () => {
    try { const text = await navigator.clipboard.readText(); setJd(text); }
    catch { }
  }, []);

  /* ── Missing fields hint ─────────────────────────────────────────────── */
  const missingFields = [];

  if (source === "builder") {
    // Email & Phone
    if (!cvData.personal?.email || cvData.personal.email.trim() === "") missingFields.push("Email");
    if (!cvData.personal?.phone || cvData.personal.phone.trim() === "") missingFields.push("Phone");

    // Summary
    const summaryText = cvData.personal?.summary;
    if (!summaryText || summaryText.trim() === "") missingFields.push("Summary");

    // Education
    if ((cvData.education || []).length === 0) missingFields.push("Education");
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--surface-50)] overflow-hidden">

      {/* ══ TOPBAR ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 bg-[var(--surface-50)] backdrop-blur-xl border-b border-[var(--surface-400)]/30 flex items-center justify-between h-14 px-3 sm:px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/templates")}>
            <FaArrowLeft />
          </Button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
              <img src="/CVEX Logo Design.png" alt="CVEX Logo" className="w-full h-full object-cover rounded-full" />
            </div>
          </div>
          <span className="hidden sm:inline text-gray-300">|</span>
          <span className="hidden sm:inline font-semibold text-sm text-[var(--surface-900)] truncate max-w-[200px]">
            AI Analyzer
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={setDarkMode}>{darkMode ? <FaSun /> : <FaMoon />}</Button>

          <Button variant="ghost" size="sm"
            className={cn("relative flex items-center gap-1", historyOpen && "bg-[var(--brand-500)]/10 text-[var(--brand-600)]")}
            onClick={() => setHistoryOpen(v => !v)}>
            <FaClockRotateLeft className={historyOpen ? "text-[var(--brand-500)]" : ""} />
            <span className="hidden sm:inline ml-1">History</span>
            {history.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-[4px] rounded-full bg-[var(--brand-500)] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {history.length > 9 ? "9+" : history.length}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="sm"
            onClick={() => { window.__cvexAutoAnalyze = true; navigate("/editor"); showToast("Opening Editor...", "info"); }}>
            <FaPen className="text-[var(--brand-500)]" />
            <span className="hidden sm:inline ml-1">CV Builder</span>
          </Button>

          <Button variant="primary" size="sm"
            className={cn("flex items-center gap-1",
              canAnalyze ? "opacity-50 cursor-not-allowed" : "text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
            )}
            style={!canAnalyze ? {} : { background: "linear-gradient(135deg, var(--brand-500), #8b5cf6)" }}
            onClick={runAnalysis} disabled={canAnalyze}>
            {analyzing ? <FaSpinner className="animate-spin" /> : <FaBrain />}
            <span className="hidden sm:inline">
              {analyzing ? "Analyzing…" : parsing ? "Parsing…" : source === "upload" && !pdfText ? "Upload PDF First" : "Analyze CV"}
            </span>
          </Button>
        </div>
      </header>

      {/* ══ MOBILE TABS ═════════════════════════════════════════════════════ */}
      <div className="lg:hidden flex border-b border-[var(--surface-200)] bg-[var(--surface-50)]">
        {[["input", <FaSlidersH />, "Configure"], ["results", <FaChartPie />, "Results"]].map(([tab, icon, label]) => (
          <button key={tab} onClick={() => setMobileTab(tab)}
            className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold border-b-2 transition-colors",
              mobileTab === tab ? "border-[var(--surface-800)] text-[var(--brand-600)]" : "border-[var(--surface-100)] text-[var(--surface-500)] hover:text-[var(--surface-700)]")}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* ══ BODY ════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ══ ENHANCED SIDEBAR ════════════════════════════════════════════ */}
        <aside className={cn(
          "w-full lg:w-[330px] xl:w-[350px] shrink-0 flex flex-col",
          "bg-[var(--surface-50)] border-r border-[var(--surface-200)] overflow-y-auto",
          mobileTab !== "input" && "hidden lg:flex"
        )}>

          {/* ── SCAN QUOTA ────────────────────────────────────────────── */}
          {!isPro && (
            <div className="mx-4 mt-4 rounded-xl overflow-hidden bg-[var(--surface-100)]">
              <div className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <FaBolt className="text-amber-500 text-[10px]" />
                  <span className="text-[11px] font-bold text-[var(--surface-800)]">Daily Scans</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: DAILY_LIMIT }).map((_, i) => (
                    <div key={i} className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold border transition-all",
                      i < scanData.count
                        ? "bg-[var(--surface-300)] border-[var(--surface-300)] text-[var(--surface-400)]"
                        : "bg-[var(--brand-500)]/10 border-[var(--brand-500)]/25 text-[var(--brand-600)]"
                    )}>
                      {i < scanData.count ? "✓" : i + 1}
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-[3px] bg-[var(--surface-200)]">
                <div className="h-full transition-all duration-700 ease-out" style={{
                  width: `${(scanData.count / DAILY_LIMIT) * 100}%`,
                  background: remainingScans === 0
                    ? "linear-gradient(90deg,#ef4444,#f87171)"
                    : "linear-gradient(90deg,var(--brand-500),#8b5cf6)"
                }} />
              </div>
              <p className="px-3 py-1.5 text-[10px] text-[var(--surface-400)]">
                {remainingScans === 0 ? "⚠ Limit reached · Resets at midnight"
                  : `${remainingScans} scan${remainingScans > 1 ? "s" : ""} remaining today`}
              </p>
            </div>
          )}

          {/* ── SOURCE TOGGLE ─────────────────────────────────────────── */}
          <div className="p-4 pb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--surface-400)] mb-2.5">CV Source</p>
            <div className="relative flex bg-[var(--surface-200)] rounded-xl p-1">
              <div
                className="absolute top-1 bottom-1 rounded-[10px] bg-[var(--surface-50)] shadow-sm border border-[var(--surface-300)] transition-all duration-300 ease-out"
                style={{ width: "calc(50% - 4px)", left: source === "builder" ? "4px" : "calc(50%)" }}
              />
              {[
                ["builder", FaRegFileAlt, "From Builder"],
                ["upload", FaFilePdf, "Upload PDF"],
              ].map(([s, Icon, lbl]) => (
                <button key={s} onClick={() => setSource(s)}
                  className={cn(
                    "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[10px] text-xs font-semibold transition-colors duration-200 cursor-pointer",
                    source === s ? "text-[var(--brand-600)]" : "text-[var(--surface-500)] hover:text-[var(--surface-700)]"
                  )}>
                  <Icon className={cn("text-[10px]", source === s && "text-[var(--brand-500)]")} />
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[var(--surface-200)] mx-4" />

          {/* ── CV INFO / PDF UPLOAD ───────────────────────────────────── */}
          <div className="p-4 pb-3">
            {source === "builder" ? (
              <div className="rounded-xl bg-[var(--surface-100)] border border-[var(--surface-200)] overflow-hidden">
                <div className="px-3 pt-3 pb-3">
                  {/* Header row */}
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        background: `linear-gradient(135deg, ${completionColor}20, ${completionColor}08)`,
                        borderColor: `${completionColor}30`,
                      }}>
                      <FaRegFileAlt style={{ color: completionColor }} className="text-xs" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--surface-900)] truncate">
                        {cvData.meta?.cvName && cvData.meta.cvName !== "Untitled CV"
                          ? cvData.meta.cvName
                          : `${cvData.personal?.firstName || ""} ${cvData.personal?.lastName || ""}`.trim() || "Untitled CV"}
                      </p>
                      <p className="text-[10px] text-[var(--surface-400)] mt-0.5">{completion}% complete</p>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                      completion >= 80 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : completion >= 60 ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : "bg-red-500/10 text-red-600 border-red-500/20"
                    )}>
                      {completion >= 80 ? "Strong" : completion >= 60 ? "Fair" : "Weak"}
                    </span>
                  </div>

                  {/* Completion bar */}
                  <div className="h-1.5 rounded-full bg-[var(--surface-200)] overflow-hidden mb-3">
                    <div className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${completion}%`, backgroundColor: completionColor }} />
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      ["Name", `${cvData.personal?.firstName || ""} ${cvData.personal?.lastName || ""}`.trim() || "—"],
                      ["Title", cvData.personal?.title || "—"],
                      ["Experience", `${(cvData.experience || []).length} entr${(cvData.experience || []).length === 1 ? "y" : "ies"}`],
                      ["Skills", `${(cvData.skills || []).length} group${(cvData.skills || []).length === 1 ? "" : "s"}`],
                    ].map(([key, val]) => (
                      <div key={key} className="bg-[var(--surface-50)] rounded-lg px-2.5 py-1.5">
                        <p className="text-[9px] text-[var(--surface-400)] uppercase tracking-wide">{key}</p>
                        <p className="text-[11px] font-semibold text-[var(--surface-700)] truncate mt-0.5">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing fields hint */}
                {missingFields.length > 0 && (
                  <div className="border-t border-[var(--surface-200)] px-3 py-2 bg-amber-500/[0.03]">
                    <p className="text-[10px] text-amber-600 font-medium flex items-start gap-1.5">
                      <FaLightbulb className="shrink-0 mt-0.5 text-[9px]" />
                      Add {missingFields.slice(0, 2).join(", ")}{missingFields.length > 2 ? ` +${missingFields.length - 2} more` : ""} to improve score
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden"
                  onChange={e => { handlePdf(e.target.files?.[0]); e.target.value = ""; }} />
                {pdfFile && pdfText ? (
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                    <div className="flex items-start gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0 border border-red-100">
                        <FaFilePdf className="text-red-500 text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[var(--surface-800)] truncate">{pdfFile.name}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 mt-0.5">
                          <FaCheckCircle className="text-[9px]" />
                          {pdfText.split(" ").filter(Boolean).length.toLocaleString()} words extracted
                        </p>
                        <p className="text-[10px] text-[var(--surface-400)] mt-0.5">
                          {(pdfFile.size / 1024).toFixed(0)} KB · PDF
                        </p>
                      </div>
                      <button onClick={() => { setPdfFile(null); setPdfText(""); setPdfError(""); }}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-100 text-[var(--surface-400)] hover:text-red-500 transition-all cursor-pointer">
                        <FaTimes className="text-[9px]" />
                      </button>
                    </div>
                    <button onClick={() => fileInputRef.current?.click()}
                      className="mt-2.5 w-full py-1.5 rounded-lg text-[11px] font-semibold text-[var(--brand-500)] border border-[var(--brand-500)]/20 hover:bg-[var(--brand-500)]/5 transition-colors cursor-pointer">
                      Replace file
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={e => { e.preventDefault(); setDragging(false); handlePdf(e.dataTransfer.files?.[0]); }}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    className={cn(
                      "rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200",
                      dragging ? "border-[var(--brand-500)] bg-[var(--brand-500)]/5 scale-[1.01]"
                        : pdfError ? "border-red-300 bg-red-50/50"
                          : "border-[var(--surface-300)] hover:border-[var(--brand-400)] hover:bg-[var(--surface-100)]"
                    )}>
                    {parsing ? (
                      <div className="flex flex-col items-center gap-2.5">
                        <div className="w-12 h-12 rounded-xl bg-[var(--brand-500)]/10 flex items-center justify-center">
                          <FaSpinner className="text-xl text-[var(--brand-500)] animate-spin" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--surface-700)]">Extracting text…</p>
                          <p className="text-[10px] text-[var(--surface-400)] mt-0.5">Please wait</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                          dragging ? "bg-[var(--brand-500)]/15 scale-110"
                            : pdfError ? "bg-red-100" : "bg-[var(--surface-200)]"
                        )}>
                          <FaCloudUploadAlt className={cn("text-xl transition-all",
                            dragging ? "text-[var(--brand-500)]"
                              : pdfError ? "text-red-400" : "text-[var(--surface-400)]")} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--surface-700)]">
                            {dragging ? "Drop to upload!" : "Drop PDF here"}
                          </p>
                          <p className="text-[10px] text-[var(--surface-400)] mt-0.5">or click to browse · Max 10MB</p>
                        </div>
                        {pdfError ? (
                          <p className="text-[10px] text-red-500 font-semibold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg">
                            <FaExclamationCircle />{pdfError}
                          </p>
                        ) : (
                          <p className="text-[10px] text-[var(--surface-400)]">Text-based PDFs only</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-[var(--surface-200)] mx-4" />

          {/* ── INDUSTRY CHIPS ────────────────────────────────────────── */}
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--surface-400)] flex items-center gap-1.5">
                <FaIndustry className="text-[9px]" /> Target Industry
              </p>
              {industry && (
                <span className="text-[10px] font-semibold text-[var(--brand-600)] bg-[var(--brand-500)]/8 px-1.5 py-0.5 rounded-md">
                  {INDUSTRY_OPTIONS.find(i => i.id === industry)?.label || industry}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {INDUSTRY_OPTIONS.map(({ id, label, icon: Icon, color, bg }) => (
                <button key={id} onClick={() => setIndustry(id)}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-2 rounded-xl border text-left transition-all duration-150 cursor-pointer",
                    industry === id
                      ? `${bg} border-[var(--brand-500)]/25 shadow-sm`
                      : "border-[var(--surface-200)] hover:border-[var(--surface-300)] hover:bg-[var(--surface-100)] bg-transparent"
                  )}>
                  <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all",
                    industry === id ? bg : "bg-[var(--surface-200)]")}>
                    <Icon className={cn("text-[10px]", industry === id ? color : "text-[var(--surface-400)]")} />
                  </div>
                  <span className={cn("text-[11px] font-semibold truncate transition-colors",
                    industry === id ? "text-[var(--surface-900)]" : "text-[var(--surface-600)]")}>
                    {label}
                  </span>
                  {industry === id && <FaCheckCircle className={cn("text-[9px] ml-auto shrink-0", color)} />}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-[var(--surface-200)] mx-4" />

          {/* ── JOB DESCRIPTION ───────────────────────────────────────── */}
          <div className="p-4 pb-3">
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--surface-400)] flex items-center gap-1.5">
                <FaBullseye className="text-[9px]" /> Job Description
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-medium text-[var(--surface-600)] bg-[var(--surface-200)] px-1.5 py-0.5 rounded-md">Optional</span>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={jd}
                onChange={e => setJd(e.target.value)}
                rows={5}
                placeholder="Paste job description for tailored keyword analysis, ATS scoring, and role-specific suggestions…"
                className="w-full px-3 py-2.5 pr-8 rounded-xl text-xs leading-relaxed resize-none
                 border border-[var(--surface-300)] bg-[var(--surface-50)]
                 text-[var(--surface-800)] placeholder-[var(--surface-400)]
                 focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]/20
                 focus:border-[var(--brand-500)] transition-colors"
              />
              {jd.trim() && (
                <button
                  onClick={() => setJd("")}
                  className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center text-[var(--surface-400)] hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <FaTimesCircle className="text-[10px]" />
                </button>
              )}
            </div>
            {jd.trim() ? (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
                <FaCheckCircle className="text-[9px]" />Role-specific analysis enabled · {wordCount} words
              </div>
            ) : (
              <p className="mt-2 text-[10px] text-[var(--surface-400)] leading-relaxed">
                Adding a JD improves keyword matching accuracy by up to 30%
              </p>
            )}
          </div>

          <div className="h-px bg-[var(--surface-200)] mx-4" />

          {/* ── ANALYZE BUTTON ────────────────────────────────────────── */}
          <div className="p-4">
            <button onClick={runAnalysis} disabled={canAnalyze}
              className={cn(
                "w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 relative overflow-hidden cursor-pointer",
                canAnalyze
                  ? "opacity-50 cursor-not-allowed bg-[var(--surface-300)] text-[var(--surface-500)]"
                  : "text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md"
              )}
              style={canAnalyze ? {} : { background: "linear-gradient(135deg, var(--brand-500) 0%, #8b5cf6 100%)" }}>
              {/* Shimmer */}
              {!canAnalyze && (
                <span className="absolute inset-0 pointer-events-none" style={{
                  background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)",
                  animation: "analyzerShimmer 2.5s infinite",
                }} />
              )}
              <style>{`@keyframes analyzerShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
              {analyzing ? <><FaSpinner className="animate-spin text-base" />Analyzing…</>
                : parsing ? <><FaSpinner className="animate-spin text-base" />Parsing PDF…</>
                  : source === "upload" && !pdfText ? <><FaCloudUploadAlt className="text-base" />Upload PDF First</>
                    : <><FaBrain className="text-base" />Analyze CV</>}
            </button>

            {!isPro && remainingScans === 0 && (
              <div className="mt-2.5 flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
                <FaBolt className="text-amber-500 text-xs shrink-0" />
                <p className="text-[10px] text-amber-700 font-medium leading-snug">
                  Daily limit reached. Upgrade to Pro for unlimited scans.
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* ── HISTORY BACKDROP ──────────────────────────────────────────── */}
        {historyOpen && (
          <div className="fixed inset-0 z-[60] bg-black/50 animate-fadeIn" onClick={() => setHistoryOpen(false)} />
        )}

        {/* ══ HISTORY DRAWER ══════════════════════════════════════════════ */}
        <div
          ref={historyDrawerRef}
          className={cn(
            "fixed z-[70] flex flex-col md:min-h-screen",
            "bg-[var(--surface-50)] border-[var(--surface-200)]",
            "sm:inset-y-0 sm:right-0 sm:w-[380px] sm:border-l sm:rounded-none sm:shadow-2xl",
            "bottom-0 left-0 right-0 max-h-[88vh] rounded-t-3xl border-t sm:bottom-auto sm:left-auto sm:top-0",
            "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            historyOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
          )}
        >
          <div ref={historyHandleRef}
            className="sm:hidden flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none select-none">
            <div className="w-10 h-1.5 rounded-full bg-[var(--surface-300)] pointer-events-none" />
          </div>

          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--surface-200)] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand-500)]/20 to-[var(--brand-500)]/5 flex items-center justify-center border border-[var(--brand-500)]/15">
                <FaClockRotateLeft className="text-[var(--brand-500)]" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-[var(--surface-900)] leading-none">Analysis History</h2>
                <p className="text-[11px] text-[var(--surface-500)] mt-0.5">
                  {history.length === 0 ? "No analyses yet" : `${history.length} scan${history.length > 1 ? "s" : ""} saved`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button onClick={() => setClearAllConfirm(true)}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 hover:shadow-md transition-all duration-200 shadow-sm border border-red-200 cursor-pointer">
                  <FaTrash className="text-[10px]" />Clear All
                </button>
              )}
              <button onClick={() => setHistoryOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--surface-500)] hover:text-[var(--surface-900)] hover:bg-[var(--surface-200)] transition-colors cursor-pointer">
                <FaXmark />
              </button>
            </div>
          </div>

          {history.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 shrink-0">
              <div className="flex-1 h-px bg-[var(--surface-200)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--surface-400)]">Saved Scans</span>
              <div className="flex-1 h-px bg-[var(--surface-200)]" />
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 min-h-0">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
                <div className="w-20 h-20 rounded-2xl bg-[var(--surface-100)] border-2 border-dashed border-[var(--surface-300)] flex items-center justify-center">
                  <FaClockRotateLeft className="text-3xl text-[var(--surface-300)]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[var(--surface-700)]">No scans yet</p>
                  <p className="text-xs text-[var(--surface-400)] mt-1 max-w-[200px] leading-relaxed">Run your first analysis to see results saved here</p>
                </div>
                <button onClick={() => setHistoryOpen(false)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--brand-500)]/30 text-[var(--brand-600)] text-xs font-semibold hover:bg-[var(--brand-500)]/5 transition-colors cursor-pointer">
                  <FaBrain className="text-[10px]" />Analyze now
                </button>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                {history.map((scan, idx) => {
                  const isLatest = idx === 0;
                  const savedDate = new Date(scan.analyzedAt || scan.timestamp || Date.now());
                  const diffMs = Date.now() - savedDate;
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);
                  const relativeTime = diffMins < 1 ? "Just now"
                    : diffMins < 60 ? `${diffMins}m ago`
                      : diffHours < 24 ? `${diffHours}h ago`
                        : diffDays < 7 ? `${diffDays}d ago`
                          : savedDate.toLocaleDateString(undefined, { day: "numeric", month: "short" });
                  const fullTime = savedDate.toLocaleDateString(undefined, {
                    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                  });
                  const accentHex = gradeHex(scan.overallScore || 0);
                  const col = scoreColor(scan.overallScore || 0);

                  return (
                    <div key={scan.scanId || idx} className={cn(
                      "p-3.5 rounded-xl border transition-all duration-200",
                      isLatest
                        ? "border-[var(--brand-500)]/30 bg-[var(--brand-500)]/[0.04] shadow-sm"
                        : "border-[var(--surface-200)] bg-[var(--surface-100)] hover:border-[var(--surface-300)] hover:bg-[var(--surface-50)]"
                    )}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-3 h-3 rounded-full shrink-0 border border-black/10 shadow-sm" style={{ background: accentHex }} />
                        <span className="font-semibold text-sm text-[var(--surface-900)] truncate flex-1">
                          {scan.meta?.cvName || scan.cvName || "CV Analysis"}
                        </span>
                        {isLatest && (
                          <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-[var(--brand-500)] text-white text-[9px] font-bold uppercase tracking-wide">Latest</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[11px] text-[var(--surface-500)]" title={fullTime}>
                          {relativeTime} · {fullTime.split(",").slice(0, 2).join(",")}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-[var(--surface-300)]" />
                        <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded", col.bg, col.text)}>
                          {scan.grade || "—"} · {scan.overallScore || 0}/100
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 mb-3">
                        {[["ATS", scan.atsScore], ["Keywords", scan.keywordScore], ["Content", scan.contentScore]].map(([lbl, sc]) => {
                          const c = scoreColor(sc || 0);
                          return (
                            <div key={lbl} className={cn("rounded-lg px-2 py-1.5 text-center", c.bg)}>
                              <p className={cn("text-[11px] font-bold tabular-nums", c.text)}>{sc || 0}</p>
                              <p className="text-[9px] text-[var(--surface-400)] mt-0.5">{lbl}</p>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setResult(scan); setMobileTab("results"); setHistoryOpen(false); showToast("Loaded previous analysis", "info"); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--brand-500)] hover:bg-[var(--brand-600)] active:scale-[0.97] text-white text-xs font-semibold transition-all duration-150 cursor-pointer">
                          <FaArrowRotateLeft className="text-[10px]" />Load Results
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ id: scan.scanId || idx, name: scan.meta?.cvName || "this scan" })}
                          className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--surface-500)] hover:text-red-500 hover:bg-red-50 border border-[var(--surface-200)] hover:border-red-200 transition-all duration-150 cursor-pointer">
                          <FaTrash className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── MAIN RESULTS PANEL ──────────────────────────────────────────── */}
        <main className={cn("flex-1 overflow-y-auto bg-[var(--surface-100)]", mobileTab !== "results" && "hidden lg:block")}>
          {!result ? (
            <div className="flex items-center justify-center min-h-full p-8">
              <div className="text-center max-w-sm">
                <div className="w-20 h-20 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, var(--brand-500)/10, #8b5cf6/10)" }}>
                  <FaBrain className="text-3xl text-[var(--brand-500)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--surface-900)] mb-2">Ready to Analyze</h3>
                <p className="text-sm text-[var(--surface-500)] leading-relaxed">
                  Configure your options on the left and click "Analyze CV" to get a comprehensive AI-powered breakdown.
                </p>
                <div className="flex items-center justify-center gap-5 mt-6">
                  {[[FaShieldAlt, "ATS Check"], [FaKey, "Keywords"], [FaChartBar, "Impact Score"]].map(([Icon, label]) => (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <div className="w-9 h-9 rounded-xl bg-[var(--surface-200)] flex items-center justify-center">
                        <Icon className="text-[var(--surface-500)] text-sm" />
                      </div>
                      <span className="text-[10px] text-[var(--surface-400)] font-medium">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 space-y-4 pb-24 lg:pb-5">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2 rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] p-5 flex flex-col items-center justify-center gap-3">
                  <div className="relative">
                    <CircleScore score={result.overallScore} size={100} stroke={8} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={cn("text-2xl font-black tabular-nums", scoreColor(result.overallScore).text)}>{result.overallScore}</span>
                      <span className="text-[9px] text-[var(--surface-400)] font-medium">/ 100</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={cn("inline-flex px-3 py-1 rounded-full text-xs font-bold mb-1", scoreColor(result.overallScore).bg, scoreColor(result.overallScore).text)}>
                      Grade: {result.grade}
                    </div>
                    <p className="text-xs text-[var(--surface-500)]">Overall Resume Score</p>
                    {result.meta?.source === "pdf_upload" && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium bg-[var(--surface-300)]/20 text-[var(--surface-800)] px-2 py-0.5 rounded-full">
                        <FaFilePdf />PDF Upload
                      </span>
                    )}
                  </div>
                </div>
                <div className="lg:col-span-3 rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--surface-500)] mb-4">Score Breakdown</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Content Quality", score: result.contentScore, weight: "30%", icon: FaFeather },
                      { label: "ATS Compatibility", score: result.atsScore, weight: "25%", icon: FaShieldAlt },
                      { label: "Keyword Match", score: result.keywordScore, weight: "20%", icon: FaKey },
                      { label: "Formatting", score: result.formattingScore, weight: "15%", icon: FaPalette },
                      { label: "Writing Quality", score: result.grammarScore, weight: "10%", icon: FaFeather },
                    ].map(p => <MiniBar key={p.label} {...p} />)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <div className="rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] overflow-hidden flex flex-col">
                  <ATSScore atsScore={result.atsScore} atsDetails={result.atsDetails} />
                </div>
                <div className="rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] overflow-hidden flex flex-col">
                  <KeywordMatch keywordScore={result.keywordScore} matchedKeywords={result.matchedKeywords} missingKeywords={result.missingKeywords} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <div className="rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] overflow-hidden flex flex-col">
                  <ImpactMetrics impactMetrics={result.impactMetrics} />
                </div>
                <div className="rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] overflow-hidden flex flex-col">
                  <SectionAnalysis sectionBreakdown={result.sectionBreakdown} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                <div className="rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] overflow-hidden flex flex-col">
                  <SkillsGapRadar radarData={result.skillsGapRadar} />
                </div>
                <div className="rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] overflow-hidden flex flex-col">
                  <SuggestionsPanel suggestions={result.suggestions} />
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--surface-200)] bg-[var(--surface-50)] overflow-hidden flex flex-col">
                <DownloadReport analysisResult={result} showToast={showToast} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ══ DELETE / CLEAR-ALL MODAL ═════════════════════════════════════ */}
      {(deleteConfirm || clearAllConfirm) && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/60 animate-fadeIn"
            onClick={() => { setDeleteConfirm(null); setClearAllConfirm(false); }} />
          <div className="relative z-10 w-full sm:max-w-[400px] bg-[var(--surface-50)] sm:rounded-2xl rounded-t-3xl shadow-2xl border border-[var(--surface-200)] overflow-hidden animate-scaleIn">
            <div className="sm:hidden flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[var(--surface-300)]" />
            </div>
            <div className="px-6 pt-4 pb-6 sm:pt-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-50 border border-red-100">
                  <FaTrash className="text-red-500 text-lg" />
                </div>
                <div className="pt-0.5">
                  <h3 className="font-bold text-[15px] text-[var(--surface-900)] leading-tight">
                    {deleteConfirm ? "Delete this scan?" : "Clear All Scans?"}
                  </h3>
                  <p className="text-[13px] text-[var(--surface-500)] mt-1 leading-relaxed">
                    {deleteConfirm ? "Permanently delete this analysis scan." : "Permanently delete all saved analysis scans."}
                  </p>
                </div>
              </div>
              {deleteConfirm && (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[var(--surface-100)] border border-[var(--surface-200)] mb-5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  <span className="text-sm font-semibold text-[var(--surface-800)] truncate">{deleteConfirm.name}</span>
                </div>
              )}
              <p className="text-[12px] text-[var(--surface-400)] mb-5 flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-amber-400">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                This action cannot be undone
              </p>
              <div className="flex gap-3">
                <button onClick={() => { setDeleteConfirm(null); setClearAllConfirm(false); }}
                  className="flex-1 py-2.5 rounded-xl border border-[var(--surface-300)] text-sm font-semibold text-[var(--surface-700)] hover:bg-[var(--surface-100)] active:scale-[0.97] transition cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteConfirm) {
                      setHistory(prev => prev.filter((s, i) => (s.scanId || i) !== deleteConfirm.id));
                      if (result?.scanId === deleteConfirm.id) setResult(null);
                      showToast("Scan deleted", "success");
                      setDeleteConfirm(null);
                    } else {
                      setHistory([]); setResult(null);
                      showToast("All scans deleted!", "success");
                      setClearAllConfirm(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-[0.97] transition cursor-pointer">
                  <FaTrash className="text-xs" />{deleteConfirm ? "Delete" : "Clear All"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}