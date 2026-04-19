import React, {
    useState, useRef, useEffect,
    useCallback, useMemo, memo,
    lazy, Suspense,
} from "react";
import { useCV } from "../../../context/CVContext";
import { exportCVToPDF } from "../exportPdf";
import { renderCVHTML, CVPreview } from "../preview/CVRenderer";
import { Button, Toggle } from "../../../shared/ui/UIComponents";
import { cn } from "../../../utils/helper";
import { useNavigate } from "react-router-dom";
import { SECTION_META } from "../../../data/templates";
import { useAuth } from "../../../context/AuthContext";
import { useCVDatabase } from "../../auth/hooks/useCVDatabase";
import { useUserLimits } from "../../auth/hooks/useUserLimits";
import { cvSession } from '../../../utils/cvSession';

const DesignPanel = lazy(() => import("../components/DesignPanel"));
const SectionFormRouter = lazy(() => import("../components/SectionFormRouter"));

import {
    FaArrowLeft, FaFloppyDisk, FaArrowRotateLeft, FaArrowRotateRight,
    FaPalette, FaMoon, FaSun, FaExpand, FaChartLine, FaDownload,
    FaMinus, FaPlus, FaChevronDown, FaChevronUp, FaPen, FaEye,
    FaSpinner, FaClockRotateLeft, FaTrash, FaXmark,
} from "react-icons/fa6";
import { FaGripLines } from "react-icons/fa";

function useDebounce(value, delay = 0) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        if (delay === 0) {
            const id = requestAnimationFrame(() => setDebounced(value));
            return () => cancelAnimationFrame(id);
        }
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export async function compressImage(file, maxPx = 800, quality = 0.75) {
    return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(img.width * ratio);
            canvas.height = Math.round(img.height * ratio);
            canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };
        img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
        img.src = url;
    });
}

const DebouncedPreview = memo(function DebouncedPreview({ snapshot }) {
    return <CVPreview snapshot={snapshot} />;
});

const SectionCard = memo(function SectionCard({
    sec, idx, meta, isEnabled, isActive,
    onToggle, onSetActive, onDragStart, onDragOver, onDrop, onDragEnd,
}) {
    return (
        <div
            className={cn(
                "border-[1px] border-[var(--surface-300)] rounded-xl overflow-hidden transition-all",
                isActive ? "border-[var(--surface-300)] bg-[var(--surface-100)]"
                    : "border-[var(--surface-200)] hover:border-[var(--surface-200)]"
            )}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, idx)}
        >
            <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-[var(--surface-100)] transition-colors"
                onClick={() => onSetActive(isActive ? null : sec)}
            >
                <div className="flex items-center gap-3">
                    <div
                        draggable
                        onDragStart={(e) => { e.stopPropagation(); onDragStart(idx, e); }}
                        onDragEnd={(e) => { e.stopPropagation(); onDragEnd(e); }}
                        onClick={(e) => e.stopPropagation()}
                        className="cursor-grab active:cursor-grabbing p-1 -m-1"
                    >
                        <FaGripLines className="text-[var(--surface-900)] hover:text-[var(--surface-600)]" />
                    </div>
                    {meta.icon && (() => {
                        const Icon = meta.icon;
                        return <Icon className={cn("text-sm", isActive ? "text-[var(--brand-500)]" : "text-[var(--surface-900)]")} />;
                    })()}
                    <span className="font-semibold text-sm text-[var(--surface-900)]">{meta.label}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--surface-900)]">
                    {!meta.mandatory
                        ? <Toggle active={isEnabled} onChange={onToggle} />
                        : <span className="text-[10px] font-medium text-[var(--surface-900)] uppercase">Required</span>
                    }
                    {isActive ? <FaChevronUp /> : <FaChevronDown />}
                </div>
            </div>
            <div className={cn(
                "overflow-hidden transition-all duration-500 ease-in-out",
                isActive ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            )}>
                <div className="p-4 border-t border-[var(--surface-300)] page-break-safe">
                    <Suspense fallback={
                        <div className="flex items-center justify-center py-6">
                            <FaSpinner className="animate-spin text-[var(--surface-400)]" />
                        </div>
                    }>
                        <SectionFormRouter section={sec} />
                    </Suspense>
                </div>
            </div>
        </div>
    );
});

function useSwipeToClose({ onClose, isOpen, threshold = 80 }) {
    const drawerRef = useRef(null);
    const handleRef = useRef(null);
    const startY = useRef(null);
    const startX = useRef(null);
    const currentY = useRef(null);
    const isDragging = useRef(false);
    const isLocked = useRef(false);
    const animFrameId = useRef(null);
    const onCloseRef = useRef(onClose);
    const isOpenRef = useRef(isOpen);

    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    useEffect(() => {
        const drawer = drawerRef.current;
        if (!drawer) return;
        const onTouchStart = (e) => {
            if (!isOpenRef.current) return;
            if (e.target.closest("[data-swipe-ignore]")) return;
            startY.current = e.touches[0].clientY; startX.current = e.touches[0].clientX;
            currentY.current = startY.current; isDragging.current = false; isLocked.current = false;
        };
        const onTouchMove = (e) => {
            if (!isOpenRef.current || startY.current === null) return;
            const dy = e.touches[0].clientY - startY.current;
            const dx = Math.abs(e.touches[0].clientX - startX.current);
            if (!isDragging.current && !isLocked.current) {
                if (Math.abs(dy) < 5 && dx < 5) return;
                if (dx > Math.abs(dy) || dy < 0) { isLocked.current = true; return; }
                isDragging.current = true; drawer.style.transition = "none";
            }
            if (isLocked.current || !isDragging.current) return;
            currentY.current = e.touches[0].clientY; e.preventDefault();
            if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
            animFrameId.current = requestAnimationFrame(() => {
                if (drawer) drawer.style.transform = `translateY(${Math.max(0, dy)}px)`;
            });
        };
        const onTouchEnd = () => {
            if (!isDragging.current) { startY.current = null; return; }
            isDragging.current = false; isLocked.current = false;
            const diff = Math.max(0, (currentY.current ?? 0) - (startY.current ?? 0));
            drawer.style.transition = "transform 0.3s cubic-bezier(0.32,0.72,0,1)";
            if (diff > threshold) {
                drawer.style.transform = "translateY(100%)";
                setTimeout(() => { drawer.style.transform = ""; drawer.style.transition = ""; onCloseRef.current(); }, 280);
            } else { drawer.style.transform = ""; setTimeout(() => { drawer.style.transition = ""; }, 320); }
            startY.current = currentY.current = null;
        };
        drawer.addEventListener("touchstart", onTouchStart, { passive: true });
        drawer.addEventListener("touchmove", onTouchMove, { passive: false });
        drawer.addEventListener("touchend", onTouchEnd, { passive: true });
        return () => {
            drawer.removeEventListener("touchstart", onTouchStart);
            drawer.removeEventListener("touchmove", onTouchMove);
            drawer.removeEventListener("touchend", onTouchEnd);
            if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
            if (drawer) { drawer.style.transform = ""; drawer.style.transition = ""; }
        };
    }, [threshold]);
    return { drawerRef, handleRef };
}

function DesktopLimitBadge({ used, total, getResetTime }) {
    const remaining = Math.max(0, total - used);
    const isLimit = remaining === 0;
    const barColor = isLimit ? "#ef4444" : used === total - 1 ? "#f59e0b" : "#10b981";
    return (
        <div className={cn("hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] transition-all",
            isLimit ? "bg-red-50 border-red-200" : "bg-[var(--surface-100)] border-[var(--surface-200)]")}>
            <FaDownload className={cn("text-[9px]", isLimit ? "text-red-500" : "text-[var(--surface-400)]")} />
            <span className={cn("font-semibold", isLimit ? "text-red-600" : "text-[var(--surface-600)]")}>PDF</span>
            <div className="flex items-center gap-[3px]">
                {Array.from({ length: total }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full transition-all"
                        style={{ background: i < used ? "var(--surface-300)" : barColor }} />
                ))}
            </div>
            <span className={cn("font-bold", isLimit ? "text-red-600" : "text-[var(--surface-700)]")}>{used}/{total}</span>
            <span className={cn("hidden lg:inline", isLimit ? "text-red-400" : "text-[var(--surface-400)]")}>
                · {isLimit ? `resets in ${getResetTime?.() || "24h"}` : "resets in 24h"}
            </span>
        </div>
    );
}

function MobileLimitStrip({ used, total, getResetTime }) {
    const remaining = Math.max(0, total - used);
    const isLimit = remaining === 0;
    const barColor = isLimit ? "#ef4444" : used === total - 1 ? "#f59e0b" : "#10b981";
    return (
        <div className={cn("lg:hidden flex items-center justify-between px-4 py-1.5 border-b text-[11px]",
            isLimit ? "bg-red-50 border-red-200" : "bg-[var(--surface-100)] border-[var(--surface-200)]")}>
            <div className="flex items-center gap-2">
                <FaDownload className={cn("text-[9px]", isLimit ? "text-red-500" : "text-[var(--surface-400)]")} />
                <div className="flex items-center gap-[3px]">
                    {Array.from({ length: total }).map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full transition-all"
                            style={{ background: i < used ? "var(--surface-300)" : barColor }} />
                    ))}
                </div>
                <span className={cn("font-bold", isLimit ? "text-red-700" : "text-[var(--surface-700)]")}>
                    {used}/{total} PDF downloads today
                </span>
            </div>
            <span className={cn("font-medium", isLimit ? "text-red-500" : "text-[var(--surface-400)]")}>
                {isLimit ? `resets in ${getResetTime?.() || "24h"}` : "resets in 24h"}
            </span>
        </div>
    );
}

function HistorySkeleton() {
    return (
        <div className="space-y-2 pt-1">
            {[1, 0.7, 0.45].map((opacity, i) => (
                <div key={i} style={{ opacity }}
                    className="p-3.5 rounded-xl border border-[var(--surface-200)] bg-[var(--surface-100)]">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[var(--surface-200)] animate-pulse shrink-0" />
                        <div className="h-3 flex-1 rounded bg-[var(--surface-200)] animate-pulse" />
                        {i === 0 && <div className="w-10 h-4 rounded-full bg-[var(--surface-200)] animate-pulse" />}
                    </div>
                    <div className="h-2.5 w-2/5 rounded bg-[var(--surface-200)] animate-pulse mb-3" />
                    {i < 2 && (
                        <div className="grid grid-cols-3 gap-1.5 mb-3">
                            {[0, 1, 2].map(j => (
                                <div key={j} className="h-9 rounded-lg bg-[var(--surface-200)] animate-pulse" />
                            ))}
                        </div>
                    )}
                    <div className="flex gap-2">
                        <div className="flex-1 h-8 rounded-lg bg-[var(--surface-200)] animate-pulse" />
                        <div className="w-9 h-8 rounded-lg bg-[var(--surface-200)] animate-pulse" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EditorPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { savedCVs, saveCV, autosave, loadVersion, deleteVersion, clearAllCVs, fetchLatestCV } = useCVDatabase();
    const { canBuildCV, remainingCV, dailyCVLimit, usage, incrementCV, getCVResetTime } = useUserLimits();
    const { cvData, dispatch, darkMode, setDarkMode, undo, redo, canUndo, canRedo, showToast, activeSection, setActiveSection } = useCV();

    const cvLoadedRef = useRef(false);
    const isNewCVRef = useRef(false);

    const [sidebarTab, setSidebarTab] = useState("sections");
    const [mobileView, setMobileView] = useState("edit");
    const [fullPreview, setFullPreview] = useState(false);
    const [previewScale, setPreviewScale] = useState(() => {
        if (window.innerWidth < 768) {
            return (window.innerWidth - 32) / 794;
        }
        return 1;
    });
    const [isExporting, setIsExporting] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [clearAllConfirm, setClearAllConfirm] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const previewWrapperRef = useRef(null);
    const previewContentRef = useRef(null);
    const [actualContentHeight, setActualContentHeight] = useState(1123);
    const dragRef = useRef(null);
    const debouncedCvData = useDebounce(cvData, 0);

    useEffect(() => {
        if (!user || cvLoadedRef.current) return;
        cvLoadedRef.current = true;

        if (cvSession.consumeFreshTemplate()) {
            isNewCVRef.current = true;
            return;
        }

        const localKey = `cvex_cvData_${user.id}`;
        const local = localStorage.getItem(localKey);
        if (local) {
            try { dispatch({ type: "LOAD_CV", payload: JSON.parse(local) }); } catch { }
        }

        fetchLatestCV().then((result) => {
            if (result?.cvData) {
                dispatch({ type: "LOAD_CV", payload: result.cvData });
                localStorage.setItem(localKey, JSON.stringify(result.cvData));
            }
        });
    }, [user?.id]);

    useEffect(() => {
        if (!user) {
            cvLoadedRef.current = false;
            isNewCVRef.current = false;
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user || !cvLoadedRef.current) return;

        const { firstName, lastName, title } = cvData.personal;
        const clean = (s) => (s || "").trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "");
        const name = [clean(firstName), clean(lastName), clean(title), "CV"]
            .filter(Boolean).join("_") || "Untitled_CV";

        autosave(cvData, name, isNewCVRef.current);
    }, [cvData]);

    const closeHistory = useCallback(() => setHistoryOpen(false), []);
    const { drawerRef: historyDrawerRef, handleRef: historyHandleRef } = useSwipeToClose({
        onClose: closeHistory, isOpen: historyOpen, threshold: 80,
    });

    useEffect(() => {
        if (historyOpen) {
            setHistoryLoading(true);
            const t = setTimeout(() => setHistoryLoading(false), 500);
            return () => clearTimeout(t);
        }
    }, [historyOpen]);

    const generateCVName = useCallback(() => {
        const { firstName, lastName, title } = cvData.personal;
        const clean = (s) => (s || "").trim()
            .replace(/\s+/g, "_")
            .replace(/[^a-zA-Z0-9_]/g, "");
        return [clean(firstName), clean(lastName), clean(title), "CV"]
            .filter(Boolean).join("_") || "Untitled_CV";
    }, [cvData.personal]);

    const handleSave = useCallback(async () => {
        if (!user) { showToast("Please login to save.", "error"); return; }
        const name = generateCVName();
        dispatch({ type: "UPDATE_META", payload: { cvName: name } });
        const { error } = await saveCV(cvData, name);
        if (error) { showToast(error, "error"); return; }
        isNewCVRef.current = false;
        showToast("CV saved!", "success");
    }, [user, generateCVName, dispatch, saveCV, cvData, showToast]);

    const handleExport = useCallback(async () => {
        if (!user) { showToast("Please login to export.", "error"); return; }
        if (!canBuildCV) {
            showToast(`PDF limit reached (${dailyCVLimit}/day). Resets in ${getCVResetTime() || "24h"}.`, "error");
            return;
        }
        if (isExporting) return;
        setIsExporting(true);
        showToast("Generating PDF...", "info");
        try {
            const name = generateCVName();
            dispatch({ type: "UPDATE_META", payload: { cvName: name } });
            const cvHTML = await new Promise((resolve) => {
                const build = () => resolve(renderCVHTML(cvData, name));
                if (typeof requestIdleCallback !== "undefined") requestIdleCallback(build, { timeout: 2000 });
                else setTimeout(build, 0);
            });
            const ok = await exportCVToPDF(null, name, cvHTML);
            if (ok) {
                await incrementCV();
                await saveCV(cvData, name);
                isNewCVRef.current = false;
            }
            showToast(ok ? "PDF exported!" : "Export failed.", ok ? "success" : "error");
        } catch (err) {
            console.error(err);
            showToast("Export failed.", "error");
        } finally {
            setIsExporting(false);
        }
    }, [user, canBuildCV, dailyCVLimit, getCVResetTime, isExporting, generateCVName, dispatch, cvData, incrementCV, showToast]);

    const handleRestore = useCallback(async (id) => {
        const data = await loadVersion(id);
        if (!data) { showToast("Could not load version.", "error"); return; }
        dispatch({ type: "LOAD_CV", payload: data });
        showToast("Version restored!", "success");
        setHistoryOpen(false);
    }, [loadVersion, dispatch, showToast]);

    const handleDeleteVersion = useCallback(async () => {
        if (!deleteConfirm) return;
        await deleteVersion(deleteConfirm.id);
        showToast("Version deleted", "success");
        setDeleteConfirm(null);
        setTimeout(() => setHistoryOpen(false), 200);
    }, [deleteConfirm, deleteVersion, showToast]);

    const handleClearAll = useCallback(async () => {
        await clearAllCVs();
        showToast("All versions deleted!", "success");
        setClearAllConfirm(false);
        setTimeout(() => setHistoryOpen(false), 200);
    }, [clearAllCVs, showToast]);

    useEffect(() => {
        const update = () => {
            if (window.innerWidth < 768) {
                const w = window.innerWidth - 32;
                setPreviewScale(w / 794);
            }
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    useEffect(() => {
        const el = previewContentRef.current;
        if (!el) return;
        const ro = new ResizeObserver(entries => {
            const h = entries[0]?.contentRect?.height;
            if (h && h > 100) setActualContentHeight(h);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (mobileView === "preview" && previewContentRef.current) {
            const id = requestAnimationFrame(() => {
                const h = previewContentRef.current?.offsetHeight;
                if (h && h > 100) setActualContentHeight(h);
            });
            return () => cancelAnimationFrame(id);
        }
    }, [mobileView]);

    const adjustScale = useCallback((delta) => {
        if (window.innerWidth < 768) setPreviewScale(s => Math.max(0.25, Math.min(0.45, s + delta)));
        else setPreviewScale(s => Math.max(0.2, Math.min(1.20, s + delta)));
    }, []);

    const fitScale = useCallback(() => {
        if (window.innerWidth < 768) {
            setPreviewScale(Math.min(0.45, (window.innerWidth - 32) / 794));
        } else {
            setPreviewScale(1);
        }
    }, []);

    const onDragStart = useCallback((idx, e) => {
        dragRef.current = idx;
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", idx);
        e.currentTarget.classList.add("dragging");
    }, []);

    const onDragOver = useCallback((e) => { e.preventDefault(); }, []);

    const onDrop = useCallback((e, toIdx) => {
        e.preventDefault();
        const fromIdx = dragRef.current ?? parseInt(e.dataTransfer.getData("text/plain"));
        if (fromIdx === null || fromIdx === toIdx) return;
        const newOrder = [...cvData.sectionOrder];
        const [moved] = newOrder.splice(fromIdx, 1);
        newOrder.splice(toIdx, 0, moved);
        dispatch({ type: "SET_SECTION_ORDER", payload: newOrder });
        dragRef.current = null;
    }, [cvData.sectionOrder, dispatch]);

    const onDragEnd = useCallback((e) => {
        e.currentTarget.classList.remove("dragging");
        dragRef.current = null;
    }, []);

    const handleToggleSection = useCallback((sec, v) =>
        dispatch({ type: "UPDATE_ENABLED", payload: { [sec]: v } }), [dispatch]);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
            if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); handleSave(); }
            if (e.key === "Escape") { setHistoryOpen(false); setFullPreview(false); }
            if (e.key === "h" && !e.ctrlKey && !e.metaKey &&
                e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA")
                setHistoryOpen(v => !v);
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [undo, redo, handleSave]);

    const manualSaves = savedCVs;

    const sectionCards = useMemo(() => (
        cvData.sectionOrder.map((sec) => {
            const meta = SECTION_META[sec] || (sec.startsWith("custom_") ? {
                icon: null,
                label: (cvData.customSections.find(c => c.id === sec) || {}).name || "Custom",
                mandatory: false,
            } : null);
            return meta ? { sec, meta } : null;
        }).filter(Boolean)
    ), [cvData.sectionOrder, cvData.customSections]);

    const scaledHeight = useMemo(() =>
        actualContentHeight * previewScale, [actualContentHeight, previewScale]);

    const sidebarTabs = useMemo(() => [
        ["sections", <FaPen />, "Sections"],
        ["design", <FaPalette />, "Design"],
    ], []);

    const mobileNavItems = useMemo(() => [
        ["edit", FaPen, "Edit"],
        ["design", FaPalette, "Design"],
        ["preview", FaEye, "Preview"],
        ["export", FaDownload, "Export"],
    ], []);

    return (
        <div className="animate-fadeIn h-screen flex flex-col">
            {!fullPreview && (
                <div className="sticky top-0 z-50 bg-[var(--surface-50)] backdrop-blur-xl border-b border-[var(--surface-400)]/30 flex items-center justify-between h-14 px-3 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <Button variant="ghost" size="sm" onClick={() => navigate("/templates")}><FaArrowLeft /></Button>
                        <div className="flex items-center gap-2 cursor-pointer shrink-0" onClick={() => navigate("/")}>
                            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center overflow-hidden">
                                <img src="/CVEX Logo Design.png" alt="CVEX Logo" className="w-full h-full object-cover rounded-full" />
                            </div>
                        </div>
                        <span className="hidden sm:inline text-gray-300">|</span>
                        <span className="hidden sm:inline font-semibold text-sm text-[var(--surface-900)] truncate max-w-[140px] lg:max-w-[180px]">
                            {cvData.personal.firstName || cvData.personal.lastName
                                ? `${cvData.personal.firstName || ""} ${cvData.personal.lastName || ""}`.trim()
                                : "Untitled CV"}
                        </span>
                        {user && <DesktopLimitBadge used={usage.cv_builds || 0} total={dailyCVLimit} getResetTime={getCVResetTime} />}
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                        <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo}><FaArrowRotateLeft /></Button>
                        <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo}><FaArrowRotateRight /></Button>
                        <Button variant="ghost" size="sm" onClick={setDarkMode}>{darkMode ? <FaSun /> : <FaMoon />}</Button>
                        <Button variant="ghost" size="sm" onClick={() => setHistoryOpen(v => !v)}
                            className={cn("relative", historyOpen && "bg-[var(--brand-500)]/10 text-[var(--brand-600)]")}>
                            <FaClockRotateLeft className={historyOpen ? "text-[var(--brand-500)]" : ""} />
                            <span className="hidden sm:inline ml-1">History</span>
                            {manualSaves.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-[4px] rounded-full bg-[var(--brand-500)] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                                    {manualSaves.length > 9 ? "9+" : manualSaves.length}
                                </span>
                            )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setFullPreview(true)}>
                            <FaExpand /><span className="hidden sm:inline ml-1">Preview</span>
                        </Button>
                        <Button variant="ghost" size="sm"
                            onClick={() => { window.__cvexAutoAnalyze = true; navigate("/analyzer"); showToast("Opening Analyzer...", "info"); }}>
                            <FaChartLine className="text-[var(--brand-500)]" />
                            <span className="hidden sm:inline ml-1">Analyze</span>
                        </Button>
                        <div className="hidden sm:block">
                            <Button variant="primary" size="sm" onClick={handleExport} disabled={isExporting || !canBuildCV}>
                                {isExporting ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                                <span className="ml-1">{isExporting ? "Exporting..." : "Export PDF"}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {!fullPreview && user && (
                <MobileLimitStrip used={usage.cv_builds || 0} total={dailyCVLimit} getResetTime={getCVResetTime} />
            )}

            {fullPreview ? (
                <div className="flex flex-col h-full bg-[var(--surface-100)]">
                    <div className="flex items-center md:justify-around justify-between h-14 px-4 border-b border-[var(--surface-200)] bg-[var(--surface-50)]">
                        <h2 className="font-semibold text-base text-[var(--surface-900)]">Full Preview</h2>
                        <div className="flex items-center gap-2">
                            <Button variant="primary" size="sm" onClick={handleExport} disabled={isExporting || !canBuildCV}>
                                {isExporting ? <><FaSpinner className="animate-spin mr-1" />Exporting…</> : <><FaDownload className="mr-1" />Export PDF</>}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setFullPreview(false)}>✕</Button>
                        </div>
                    </div>
                    <div ref={previewWrapperRef} className="flex-1 overflow-auto flex flex-col items-center py-6 px-2 sm:px-4 gap-6">
                        <div ref={previewContentRef} className="bg-white shadow-xl rounded-md overflow-visible border border-[var(--surface-200)]"
                            style={{ width: "794px", transform: `scale(${previewScale})`, transformOrigin: "top center" }}>
                            <DebouncedPreview snapshot={debouncedCvData} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden relative">
                    <div className={cn(
                        "w-full lg:w-[380px] shrink-0 border-r border-[var(--surface-200)] flex flex-col overflow-hidden bg-[var(--surface-50)] transition-transform duration-300",
                        mobileView !== "edit" && "hidden lg:flex"
                    )}>
                        <div className="flex border-b border-[var(--surface-200)] shrink-0">
                            {sidebarTabs.map(([tab, icon, label]) => (
                                <button key={tab}
                                    className={cn("flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1",
                                        sidebarTab === tab ? "border-[var(--brand-900)] text-[var(--brand-600)]" : "border-transparent text-[var(--surface-500)] hover:text-[var(--surface-700)]")}
                                    onClick={() => setSidebarTab(tab)}>
                                    {icon}<span>{label}</span>
                                </button>
                            ))}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20 md:pb-4">
                            {sidebarTab === "sections" ? (
                                sectionCards.map(({ sec, meta }, idx) => (
                                    <SectionCard key={sec} sec={sec} idx={idx} meta={meta}
                                        isEnabled={cvData.enabledSections[sec]} isActive={activeSection === sec}
                                        onToggle={(v) => handleToggleSection(sec, v)} onSetActive={setActiveSection}
                                        onDragStart={onDragStart} onDragOver={onDragOver} onDrop={onDrop} onDragEnd={onDragEnd} />
                                ))
                            ) : (
                                <Suspense fallback={<div className="flex items-center justify-center py-12"><FaSpinner className="animate-spin text-[var(--surface-400)] text-xl" /></div>}>
                                    <DesignPanel />
                                </Suspense>
                            )}
                        </div>
                    </div>

                    <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-[var(--surface-200)] bg-[var(--surface-50)] flex h-16">
                        {mobileNavItems.map(([view, Icon, label]) => {
                            const isActive =
                                (view === "edit" && sidebarTab === "sections" && mobileView === "edit") ||
                                (view === "design" && sidebarTab === "design" && mobileView === "edit") ||
                                (view === mobileView && view !== "edit" && view !== "design");
                            return (
                                <button key={view}
                                    className={cn("flex-1 flex flex-col items-center justify-center gap-1 transition-colors rounded-none",
                                        isActive ? "text-[var(--brand-600)] bg-[var(--surface-100)] shadow-inner" : "text-[var(--surface-500)] hover:text-[var(--surface-700)]",
                                        view === "export" && (isExporting || !canBuildCV) && "opacity-60")}
                                    onClick={() => {
                                        if (view === "export") { handleExport(); return; }
                                        if (view === "design") { setMobileView("edit"); setSidebarTab("design"); return; }
                                        if (view === "edit") { setMobileView("edit"); setSidebarTab("sections"); return; }
                                        if (view === "preview") { setMobileView("preview"); return; }
                                    }}>
                                    {view === "export" && isExporting ? <FaSpinner className="text-xl animate-spin" /> : <Icon className="text-xl" />}
                                    <span className="text-xs font-medium">{view === "export" && isExporting ? "Exporting..." : label}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div
                        ref={previewWrapperRef}
                        className={cn(
                            "flex-1 flex flex-col bg-[var(--surface-100)]",
                            "overflow-y-auto overflow-x-hidden",
                            mobileView === "preview"
                                ? "visible pointer-events-auto"
                                : "invisible pointer-events-none absolute inset-0 lg:visible lg:pointer-events-auto lg:relative lg:inset-auto"
                        )}
                    >
                        <div className="flex items-center justify-center gap-3 my-4 px-4">
                            <div className="flex items-center gap-3 p-2 bg-[var(--surface-50)] rounded-md shadow-sm border border-[var(--surface-200)]">
                                <Button variant="ghost" size="sm" onClick={() => adjustScale(-0.05)}><FaMinus /></Button>
                                <span className="text-sm font-medium text-[var(--surface-900)] w-12 text-center">
                                    {Math.round(previewScale * 100)}%
                                </span>
                                <Button variant="ghost" size="sm" onClick={() => adjustScale(0.05)}><FaPlus /></Button>
                                <Button variant="ghost" size="sm" onClick={fitScale}>Fit</Button>
                            </div>
                        </div>

                        <div className="flex justify-center w-full px-2">
                            <div style={{
                                position: "relative",
                                width: `${794 * previewScale}px`,
                                maxWidth: "calc(100vw - 16px)",
                                height: `${scaledHeight}px`,
                                flexShrink: 0,
                            }}>
                                <div
                                    ref={previewContentRef}
                                    className="bg-white shadow-xl rounded-md border border-[var(--surface-200)]"
                                    style={{
                                        position: "absolute",
                                        top: 0, left: 0,
                                        width: "794px",
                                        transform: `scale(${previewScale})`,
                                        transformOrigin: "top left",
                                    }}
                                >
                                    <DebouncedPreview snapshot={debouncedCvData} />
                                </div>
                            </div>
                        </div>
                        <div className="h-20 lg:h-4 shrink-0" />
                    </div>
                </div>
            )}

            {historyOpen && (
                <div className="fixed inset-0 z-[60] bg-black/50 animate-fadeIn" onClick={() => setHistoryOpen(false)} />
            )}

            <div ref={historyDrawerRef} className={cn(
                "fixed z-[70] flex flex-col md:min-h-screen bg-[var(--surface-50)] border-[var(--surface-200)]",
                "sm:inset-y-0 sm:right-0 sm:w-[380px] sm:border-l sm:rounded-none sm:shadow-2xl",
                "bottom-0 left-0 right-0 max-h-[88vh] rounded-t-3xl border-t sm:bottom-auto sm:left-auto sm:top-0",
                "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                historyOpen ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-y-0 sm:translate-x-full"
            )}>
                <div ref={historyHandleRef} className="sm:hidden flex justify-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing touch-none select-none">
                    <div className="w-10 h-1.5 rounded-full bg-[var(--surface-300)] pointer-events-none" />
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--surface-200)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand-500)]/20 to-[var(--brand-500)]/5 flex items-center justify-center border border-[var(--brand-500)]/15">
                            <FaClockRotateLeft className="text-[var(--brand-500)]" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-[var(--surface-900)] leading-none">CV History</h2>
                            <p className="text-[11px] text-[var(--surface-500)] mt-0.5">
                                {manualSaves.length === 0 ? "No versions saved" : `${manualSaves.length} version${manualSaves.length > 1 ? "s" : ""} saved`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {manualSaves.length > 0 && (
                            <button onClick={() => setClearAllConfirm(true)}
                                className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 border border-red-200 cursor-pointer">
                                <FaTrash className="text-[10px]" />Clear All
                            </button>
                        )}
                        <button onClick={() => setHistoryOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--surface-500)] hover:text-[var(--surface-900)] hover:bg-[var(--surface-200)] transition-colors cursor-pointer">
                            <FaXmark />
                        </button>
                    </div>
                </div>

                {user && (
                    <div className={cn("mx-4 mt-4 mb-2 rounded-xl border overflow-hidden",
                        (usage.cv_builds || 0) >= dailyCVLimit ? "border-red-200" : "border-[var(--surface-200)]")}>
                        <div className={cn("px-3 py-2.5", (usage.cv_builds || 0) >= dailyCVLimit ? "bg-red-50" : "bg-[var(--surface-100)]")}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-1.5">
                                    <FaDownload className={cn("text-[10px]", (usage.cv_builds || 0) >= dailyCVLimit ? "text-red-500" : "text-[var(--surface-400)]")} />
                                    <span className={cn("text-[11px] font-bold", (usage.cv_builds || 0) >= dailyCVLimit ? "text-red-700" : "text-[var(--surface-700)]")}>PDF Downloads</span>
                                </div>
                                <span className={cn("text-[11px] font-semibold", (usage.cv_builds || 0) >= dailyCVLimit ? "text-red-600" : "text-[var(--surface-500)]")}>
                                    {usage.cv_builds || 0}/{dailyCVLimit} today
                                </span>
                            </div>
                            <div className="flex gap-1 mb-1.5">
                                {Array.from({ length: dailyCVLimit }).map((_, i) => (
                                    <div key={i} className={cn("flex-1 h-1.5 rounded-full transition-all",
                                        i < (usage.cv_builds || 0) ? (usage.cv_builds || 0) >= dailyCVLimit ? "bg-red-400" : "bg-[var(--brand-500)]" : "bg-[var(--surface-200)]")} />
                                ))}
                            </div>
                            <p className={cn("text-[10px]", (usage.cv_builds || 0) >= dailyCVLimit ? "text-red-600 font-semibold" : "text-[var(--surface-400)]")}>
                                {(usage.cv_builds || 0) >= dailyCVLimit
                                    ? `Limit reached — resets in ${getCVResetTime() || "24h"}`
                                    : `${remainingCV} download${remainingCV !== 1 ? "s" : ""} left · resets in 24h`}
                            </p>
                        </div>
                    </div>
                )}

                <div className="px-4 pt-2 pb-3 shrink-0">
                    <button onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--brand-500)] hover:bg-[var(--brand-600)] active:scale-[0.98] text-white font-semibold text-sm transition-all shadow-sm cursor-pointer">
                        <FaFloppyDisk />Save Current Version
                    </button>
                </div>

                {manualSaves.length > 0 && (
                    <div className="flex items-center gap-3 px-4 pb-2 shrink-0">
                        <div className="flex-1 h-px bg-[var(--surface-200)]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--surface-400)]">Saved Versions</span>
                        <div className="flex-1 h-px bg-[var(--surface-200)]" />
                    </div>
                )}

                <div data-swipe-ignore className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 min-h-0">
                    {historyLoading ? (
                        <HistorySkeleton />
                    ) : manualSaves.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--surface-100)] border-2 border-dashed border-[var(--surface-300)] flex items-center justify-center">
                                <FaClockRotateLeft className="text-3xl text-[var(--surface-300)]" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-[var(--surface-700)]">No versions yet</p>
                                <p className="text-xs text-[var(--surface-400)] mt-1 max-w-[200px] leading-relaxed">Save your CV to track versions and restore anytime</p>
                            </div>
                            <button onClick={handleSave}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--brand-500)]/30 text-[var(--brand-600)] text-xs font-semibold hover:bg-[var(--brand-500)]/5 transition-colors cursor-pointer">
                                <FaFloppyDisk className="text-[10px]" />Save first version
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2 pt-1">
                            {[...manualSaves].reverse().map((cv, idx) => {
                                const isLatest = idx === 0;
                                const savedDate = new Date(cv.savedAt);
                                const diffMs = Date.now() - savedDate;
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMs / 3600000);
                                const diffDays = Math.floor(diffMs / 86400000);
                                const relativeTime = diffMins < 1 ? "Just now" : diffMins < 60 ? `${diffMins}m ago` : diffHours < 24 ? `${diffHours}h ago` : diffDays < 7 ? `${diffDays}d ago` : savedDate.toLocaleDateString(undefined, { day: "numeric", month: "short" });
                                const fullTime = savedDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
                                const accentColor = cv.data?.design?.primaryColor || "var(--brand-500)";
                                const layout = cv.data?.design?.layout || cv.layout || "single";
                                return (
                                    <div key={cv.id} className={cn("p-3.5 rounded-xl border transition-all duration-200",
                                        isLatest ? "border-[var(--brand-500)]/30 bg-[var(--brand-500)]/[0.04] shadow-sm"
                                            : "border-[var(--surface-200)] bg-[var(--surface-100)] hover:border-[var(--surface-300)] hover:bg-[var(--surface-50)]")}>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="w-3 h-3 rounded-full shrink-0 border border-black/10 shadow-sm" style={{ background: accentColor }} />
                                            <span className="font-semibold text-sm text-[var(--surface-900)] truncate flex-1">{cv.name || "Untitled CV"}</span>
                                            {isLatest && <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-[var(--brand-500)] text-white text-[9px] font-bold uppercase tracking-wide">Latest</span>}
                                        </div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[11px] text-[var(--surface-500)]" title={fullTime}>{relativeTime} · {fullTime.split(",").slice(0, 2).join(",")}</span>
                                            <span className="w-1 h-1 rounded-full bg-[var(--surface-300)]" />
                                            <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                                                layout === "sidebar" ? "bg-purple-500/10 text-purple-600" : "bg-blue-500/10 text-blue-600")}>
                                                {layout === "sidebar" ? "Professional" : "Modern Edge"}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleRestore(cv.id)}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--brand-500)] hover:bg-[var(--brand-600)] active:scale-[0.97] text-white text-xs font-semibold transition-all cursor-pointer">
                                                <FaArrowRotateLeft className="text-[10px]" />Restore
                                            </button>
                                            <button onClick={async () => {
                                                setDownloadingId(cv.id);
                                                try {
                                                    const { exportCVToPDF } = await import("../exportPdf");
                                                    const { renderCVHTML } = await import("../preview/CVRenderer");
                                                    const html = renderCVHTML(cv.data, cv.name);
                                                    const ok = await exportCVToPDF(null, cv.name, html);
                                                    if (ok) await incrementCV();
                                                    showToast(ok ? "PDF exported!" : "Export failed.", ok ? "success" : "error");
                                                } catch { showToast("Export failed.", "error"); }
                                                finally { setDownloadingId(null); }
                                            }} disabled={downloadingId === cv.id}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--surface-500)] hover:text-[var(--brand-600)] hover:bg-[var(--brand-500)]/10 border border-[var(--surface-200)] hover:border-[var(--brand-500)]/30 transition-all disabled:opacity-60">
                                                {downloadingId === cv.id ? <FaSpinner className="text-[11px] animate-spin text-[var(--brand-500)]" /> : <FaDownload className="text-[11px]" />}
                                            </button>
                                            <button onClick={() => setDeleteConfirm({ id: cv.id, name: cv.name || "this version" })}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--surface-500)] hover:text-red-500 hover:bg-red-50 border border-[var(--surface-200)] hover:border-red-200 transition-all cursor-pointer">
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

            {(deleteConfirm || clearAllConfirm) && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="absolute inset-0 bg-black/60 animate-fadeIn" onClick={() => { setDeleteConfirm(null); setClearAllConfirm(false); }} />
                    <div className="relative z-10 w-full sm:max-w-[400px] bg-[var(--surface-50)] sm:rounded-2xl rounded-t-3xl shadow-2xl border border-[var(--surface-200)] overflow-hidden animate-scaleIn">
                        <div className="sm:hidden flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-[var(--surface-300)]" /></div>
                        <div className="px-6 pt-4 pb-6 sm:pt-6">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-red-50 border border-red-100">
                                    <FaTrash className="text-red-500 text-lg" />
                                </div>
                                <div className="pt-0.5">
                                    <h3 className="font-bold text-[15px] text-[var(--surface-900)] leading-tight">
                                        {deleteConfirm ? "Delete this version?" : "Clear All Versions?"}
                                    </h3>
                                    <p className="text-[13px] text-[var(--surface-500)] mt-1 leading-relaxed">
                                        {deleteConfirm ? "Permanently delete this CV version." : "Permanently delete all saved CV versions."}
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
                                    className="flex-1 py-2.5 rounded-xl border border-[var(--surface-300)] text-sm font-semibold text-[var(--surface-700)] hover:bg-[var(--surface-100)] transition cursor-pointer">
                                    Cancel
                                </button>
                                <button onClick={deleteConfirm ? handleDeleteVersion : handleClearAll}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 transition cursor-pointer">
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

export default EditorPage;