import React, {
    useState, useRef, useEffect,
    useCallback, useMemo, memo,
    lazy, Suspense,
} from "react";
import { useCV } from "../../../context/CVContext";
import { exportCVToPDF } from "../../../utils/exportPdf";
import { renderCVHTML, CVPreview } from "../preview/CVRenderer";
import { Button, Toggle } from "../../../shared/ui/UIComponents";
import { cn } from "../../../utils/helper";
import { useNavigate } from "react-router-dom";
import { SECTION_META } from "../../../data/templates";

const DesignPanel = lazy(() => import("../components/DesignPanel"));
const SectionFormRouter = lazy(() => import("../components/SectionFormRouter"));

import {
    FaArrowLeft,
    FaFloppyDisk,
    FaArrowRotateLeft,
    FaArrowRotateRight,
    FaPalette,
    FaMoon,
    FaSun,
    FaExpand,
    FaChartLine,
    FaDownload,
    FaMinus,
    FaPlus,
    FaChevronDown,
    FaChevronUp,
    FaPen,
    FaEye,
    FaSpinner,
    FaClockRotateLeft,
    FaTrash,
    FaFolderOpen,
    FaXmark,
} from "react-icons/fa6";
import { FaGripLines } from "react-icons/fa";

// DEBOUNCE HOOK
function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
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

// DebouncedPreview
const DebouncedPreview = memo(function DebouncedPreview({ snapshot }) {
    return <CVPreview snapshot={snapshot} />;
});

const SectionCard = memo(function SectionCard({
    sec, idx, meta, isEnabled, isActive,
    onToggle, onSetActive,
    onDragStart, onDragOver, onDrop, onDragEnd,
}) {
    return (
        <div
            key={sec}
            className={cn(
                "border-[1px] border-[var(--surface-300)] rounded-xl overflow-hidden transition-all",
                isActive
                    ? "border-[var(--surface-300)] bg-[var(--surface-100)]"
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

// EditorPage
function EditorPage() {
    const navigate = useNavigate();
    const {
        cvData,
        dispatch,
        darkMode,
        setDarkMode,
        undo,
        redo,
        canUndo,
        canRedo,
        showToast,
        saveVersion,
        savedCVs = [],
        loadVersion,
        deleteVersion,
        activeSection,
        setActiveSection,
    } = useCV();

    const [sidebarTab, setSidebarTab] = useState("sections");
    const [mobileView, setMobileView] = useState("edit");
    const [fullPreview, setFullPreview] = useState(false);
    const [previewScale, setPreviewScale] = useState(() => window.innerWidth < 768 ? 0.45 : 1);
    const [isExporting, setIsExporting] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [clearAllConfirm, setClearAllConfirm] = useState(false);

    const previewWrapperRef = useRef(null);
    const previewContentRef = useRef(null);
    const dragRef = useRef(null);
    const dragStartY = useRef(null);
    const dragCurrentY = useRef(null);
    const debouncedCvData = useDebounce(cvData, 0);

    useEffect(() => {
        const t = setTimeout(() => {
            try {
                localStorage.setItem("cvex_autosave", JSON.stringify(cvData));
                localStorage.setItem("cvex_autosave_ts", Date.now().toString());
            } catch {
            }
        }, 1000);
        return () => clearTimeout(t);
    }, [cvData]);

    const generateCVName = useCallback(() => {
        const { firstName, lastName, title } = cvData.personal;
        const clean = (s) => (s || "").trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        const parts = [clean(firstName), clean(lastName), clean(title), "CV"].filter(Boolean);
        return parts.join("_");
    }, [cvData.personal]);

    const handleSave = useCallback(() => {
        const autoName = generateCVName();
        dispatch({ type: "UPDATE_META", payload: { cvName: autoName } });
        saveVersion(autoName, { manual: true });
        showToast("CV saved successfully!", "success");
    }, [generateCVName, dispatch, saveVersion, showToast]);



    const handleExport = useCallback(async () => {
        if (isExporting) return;
        setIsExporting(true);
        showToast("Generating PDF...", "info");
        try {
            const autoName = generateCVName();
            dispatch({ type: "UPDATE_META", payload: { cvName: autoName } });
            const cvHTML = await new Promise((resolve) => {
                const build = () => resolve(renderCVHTML(cvData, autoName));
                if (typeof requestIdleCallback !== "undefined") {
                    requestIdleCallback(build, { timeout: 2000 });
                } else {
                    setTimeout(build, 0);
                }
            });
            const ok = await exportCVToPDF(null, autoName, cvHTML);
            if (ok) saveVersion(autoName);
            showToast(
                ok ? "PDF exported successfully!" : "Export failed. Please try again.",
                ok ? "success" : "error"
            );
        } catch (err) {
            console.error(err);
            showToast("Export failed. Please try again.", "error");
        } finally {
            setIsExporting(false);
        }
    }, [isExporting, generateCVName, dispatch, cvData, showToast, saveVersion]);

    useEffect(() => {
        const updateScale = () => {
            if (!previewContentRef.current || !previewWrapperRef.current) return;
            if (window.innerWidth < 768) {
                const w = previewWrapperRef.current.offsetWidth;
                const h = previewWrapperRef.current.offsetHeight;
                setPreviewScale(Math.max(0.45, Math.min(Math.min(w / 794, h / 1123), 0.5)));
            }
        };
        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    const adjustScale = useCallback((delta) => {
        if (window.innerWidth < 768) {
            setPreviewScale((s) => Math.max(0.25, Math.min(0.5, s + delta)));
        } else {
            setPreviewScale((s) => Math.max(0.2, Math.min(1.20, s + delta)));
        }
    }, []);

    const fitScale = useCallback(() => {
        setPreviewScale(window.innerWidth < 768 ? 0.45 : 1);
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

    const handleToggleSection = useCallback((sec, v) => {
        dispatch({ type: "UPDATE_ENABLED", payload: { [sec]: v } });
    }, [dispatch]);

    useEffect(() => {
        const handler = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                e.preventDefault();
                if (e.shiftKey) redo(); else undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                handleSave();
            }
            if (e.key === "Escape") {
                setHistoryOpen(false);
                setFullPreview(false);
            }
            if (e.key === "h" && !e.ctrlKey && !e.metaKey && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
                setHistoryOpen(v => !v);
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [undo, redo, handleSave]);

    const manualSaves = savedCVs;

    const sectionCards = useMemo(() => (
        cvData.sectionOrder.map((sec) => {
            const meta =
                SECTION_META[sec] ||
                (sec.startsWith("custom_")
                    ? {
                        icon: null,
                        label: (cvData.customSections.find((c) => c.id === sec) || {}).name || "Custom",
                        mandatory: false,
                    }
                    : null);
            return meta ? { sec, meta } : null;
        }).filter(Boolean)
    ), [cvData.sectionOrder, cvData.customSections]);

    const previewStyle = useMemo(() => ({
        width: "794px",
        transform: `scale(${previewScale})`,
        transformOrigin: "top center",
        transition: "transform 0.2s ease",
    }), [previewScale]);

    const sidebarTabs = useMemo(() => [
        ["sections", <FaPen />, "Sections"],
        ["design", <FaPalette />, "Design"],
    ], []);

    const mobileNavItems = useMemo(() => [
        ['edit', FaPen, 'Edit'],
        ['design', FaPalette, 'Design'],
        ['preview', FaEye, 'Preview'],
        ['export', FaDownload, 'Export'],
    ], []);

    const ExportBtnContent = useMemo(() => (
        <>
            {isExporting ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            <span className="hidden sm:inline ml-1">
                {isExporting ? "Exporting..." : "Export PDF"}
            </span>
        </>
    ), [isExporting]);

    return (
        <div className="animate-fadeIn h-screen flex flex-col">

            {/* Toolbar */}
            {!fullPreview && (
                <div className="sticky top-0 z-50 bg-[var(--surface-50)] backdrop-blur-xl border-b border-[var(--surface-400)]/30 flex items-center justify-between h-14 px-3 sm:px-4">
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
                            {cvData.personal.firstName || cvData.personal.lastName
                                ? `${cvData.personal.firstName || ""} ${cvData.personal.lastName || ""}`.trim()
                                : "Untitled CV"}
                        </span>
                    </div>

                    <div className="flex items-center md:gap-2 gap-1">
                        <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"><FaArrowRotateLeft /></Button>
                        <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)"><FaArrowRotateRight /></Button>
                        <Button variant="ghost" size="sm" onClick={setDarkMode}>{darkMode ? <FaSun /> : <FaMoon />}</Button>
                        <Button
                            variant="ghost" size="sm"
                            onClick={() => setHistoryOpen(v => !v)}
                            title="Resume History"
                            className={cn("relative", historyOpen && "bg-[var(--brand-500)]/10 text-[var(--brand-600)]")}
                        >
                            <FaClockRotateLeft className={historyOpen ? "text-[var(--brand-500)]" : ""} />
                            <span className="hidden sm:inline ml-1">History</span>
                            {manualSaves.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-[4px] rounded-full bg-[var(--brand-500)] text-white text-[9px] font-bold flex items-center justify-center leading-none">
                                    {manualSaves.length > 9 ? "9+" : manualSaves.length}
                                </span>
                            )}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setFullPreview(true)} title="Full Preview">
                            <FaExpand />
                            <span className="hidden sm:inline ml-1">Preview</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="analyzer-btn-glow"
                            onClick={() => {
                                window.__cvexAutoAnalyze = true;
                                navigate("/analyzer");
                                showToast("Opening Analyzer...", "info");
                            }}
                            title="Analyze This CV"
                        >
                            <FaChartLine className="text-[var(--brand-500)]" />
                            <span className="hidden sm:inline ml-1">Analyze</span>
                        </Button>
                        <div className="hidden sm:block">
                            <Button variant="primary" size="sm" onClick={handleExport} disabled={isExporting}>
                                {ExportBtnContent}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* === FULL PREVIEW MODE === */}
            {fullPreview ? (
                <div className="flex flex-col h-full bg-[var(--surface-100)]">
                    <div className="flex items-center md:justify-around justify-between h-14 px-4 border-b border-[var(--surface-200)] bg-[var(--surface-50)]">
                        <h2 className="font-semibold text-base text-[var(--surface-900)]">Full Preview</h2>
                        <div className="flex items-center gap-2">
                            <div className="hidden sm:block">
                                <Button variant="primary" size="sm" onClick={handleExport} disabled={isExporting}>
                                    {isExporting
                                        ? <><FaSpinner className="animate-spin mr-1" /> Exporting...</>
                                        : <><FaDownload className="mr-1" /> Export PDF</>
                                    }
                                </Button>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setFullPreview(false)}>✕</Button>
                        </div>
                    </div>
                    <div
                        ref={previewWrapperRef}
                        className="flex-1 overflow-auto flex flex-col items-center py-6 px-2 sm:px-4 gap-6"
                        style={{ minHeight: 'calc(100vh - 56px)' }}
                    >
                        <div ref={previewContentRef} className="bg-white shadow-xl rounded-md overflow-visible border border-[var(--surface-200)]" style={previewStyle}>
                            <DebouncedPreview snapshot={debouncedCvData} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex overflow-hidden relative">

                    {/* Sidebar */}
                    <div className={cn(
                        "w-full lg:w-[380px] shrink-0 border-r border-[var(--surface-200)] flex flex-col overflow-hidden bg-[var(--surface-50)] transition-transform duration-300",
                        mobileView !== "edit" && "hidden lg:flex"
                    )}>
                        <div className="flex border-b border-[var(--surface-200)] shrink-0">
                            {sidebarTabs.map(([tab, icon, label]) => (
                                <button
                                    key={tab}
                                    className={cn(
                                        "flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-1",
                                        sidebarTab === tab
                                            ? "border-[var(--brand-900)] text-[var(--brand-600)]"
                                            : "border-transparent text-[var(--surface-500)] hover:text-[var(--surface-700)]"
                                    )}
                                    onClick={() => setSidebarTab(tab)}
                                >
                                    {icon}<span>{label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20 md:pb-4">
                            {sidebarTab === "sections" ? (
                                <>
                                    {sectionCards.map(({ sec, meta }, idx) => (
                                        <SectionCard
                                            key={sec}
                                            sec={sec}
                                            idx={idx}
                                            meta={meta}
                                            isEnabled={cvData.enabledSections[sec]}
                                            isActive={activeSection === sec}
                                            onToggle={(v) => handleToggleSection(sec, v)}
                                            onSetActive={setActiveSection}
                                            onDragStart={onDragStart}
                                            onDragOver={onDragOver}
                                            onDrop={onDrop}
                                            onDragEnd={onDragEnd}
                                        />
                                    ))}
                                </>
                            ) : (
                                <Suspense fallback={
                                    <div className="flex items-center justify-center py-12">
                                        <FaSpinner className="animate-spin text-[var(--surface-400)] text-xl" />
                                    </div>
                                }>
                                    <DesignPanel />
                                </Suspense>
                            )}
                        </div>
                    </div>

                    {/* Mobile bottom nav */}
                    <div className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-[var(--surface-200)] bg-[var(--surface-50)] flex h-16 shadow-t m-0 p-0">
                        {mobileNavItems.map(([view, Icon, label]) => {
                            const isActive =
                                (view === 'edit' && sidebarTab === 'sections' && mobileView === 'edit') ||
                                (view === 'design' && sidebarTab === 'design' && mobileView === 'edit') ||
                                (view === mobileView && view !== 'edit' && view !== 'design');
                            return (
                                <button
                                    key={view}
                                    className={cn(
                                        "flex-1 flex flex-col items-center justify-center gap-1 transition-colors duration-200 rounded-none",
                                        isActive
                                            ? "text-[var(--brand-600)] dark:text-[var(--brand-400)] bg-[var(--surface-100)] shadow-inner"
                                            : "text-[var(--surface-500)] hover:text-[var(--surface-700)]",
                                        view === 'export' && isExporting && "opacity-60"
                                    )}
                                    onClick={() => {
                                        if (view === 'export') { handleExport(); return; }
                                        if (view === 'design') { setMobileView('edit'); setSidebarTab('design'); return; }
                                        if (view === 'edit') { setMobileView('edit'); setSidebarTab('sections'); return; }
                                        if (view === 'preview') { setMobileView('preview'); return; }
                                    }}
                                >
                                    {view === 'export' && isExporting
                                        ? <FaSpinner className="text-xl animate-spin" />
                                        : <Icon className="text-xl" />
                                    }
                                    <span className="text-xs font-medium">
                                        {view === 'export' && isExporting ? 'Exporting...' : label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Preview Area */}
                    <div ref={previewWrapperRef} className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col items-center py-6 px-2 sm:px-4 bg-[var(--surface-100)]">
                        <div className="flex items-center gap-3 mb-6 p-2 bg-[var(--surface-50)] rounded-md shadow-sm z-10 border border-[var(--surface-200)]">
                            <Button variant="ghost" size="sm" onClick={() => adjustScale(-0.05)}><FaMinus /></Button>
                            <span className="text-sm font-medium text-[var(--surface-900)] w-12 text-center">
                                {Math.round(previewScale * 100)}%
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => adjustScale(0.05)}><FaPlus /></Button>
                            <Button variant="ghost" size="sm" onClick={fitScale}>Fit</Button>
                        </div>
                        <div
                            ref={previewContentRef}
                            className="bg-white shadow-xl rounded-md overflow-visible border border-[var(--surface-200)]"
                            style={previewStyle}
                        >
                            <DebouncedPreview snapshot={debouncedCvData} />
                        </div>
                    </div>

                </div>
            )}

            {/* HISTORY DRAWER */}
            {historyOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-black/50"
                    onClick={() => setHistoryOpen(false)}
                />
            )}

            <div
                className={cn(
                    "fixed z-[70] flex flex-col md:min-h-screen transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    "bg-[var(--surface-50)] border-[var(--surface-200)]",
                    "sm:inset-y-0 sm:right-0 sm:w-[380px] sm:border-l sm:rounded-none sm:shadow-2xl",
                    "bottom-0 left-0 right-0 max-h-[88vh] rounded-t-3xl border-t sm:bottom-auto sm:left-auto sm:top-0",
                    historyOpen
                        ? "translate-y-0 sm:translate-x-0"
                        : "translate-y-full sm:translate-y-0 sm:translate-x-full"
                )}
                onTouchStart={(e) => dragStartY.current = e.touches[0].clientY}
                onTouchMove={(e) => dragCurrentY.current = e.touches[0].clientY}
                onTouchEnd={() => {
                    if (dragStartY.current !== null && dragCurrentY.current !== null) {
                        const diff = dragCurrentY.current - dragStartY.current;
                        // If dragged downward by 50px or more, close
                        if (diff > 50) setHistoryOpen(false);
                    }
                    dragStartY.current = null;
                    dragCurrentY.current = null;
                }}
            >
                <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-[var(--surface-300)]" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--surface-200)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--brand-500)]/20 to-[var(--brand-500)]/5 flex items-center justify-center border border-[var(--brand-500)]/15">
                            <FaClockRotateLeft className="text-[var(--brand-500)]" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm text-[var(--surface-900)] leading-none">CV History</h2>
                            <p className="text-[11px] text-[var(--surface-500)] mt-0.5">
                                {manualSaves.length === 0
                                    ? "No versions saved"
                                    : `${manualSaves.length} version${manualSaves.length > 1 ? "s" : ""} saved`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {manualSaves.length > 0 && (
                            <button
                                onClick={() => setClearAllConfirm(true)}
                                className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-red-600 font-semibold text-xs hover:bg-red-100 hover:shadow-md transition-all duration-200 shadow-sm border border-red-200 cursor-pointer"
                            >
                                <FaTrash className="text-[10px]" />
                                Clear All
                            </button>
                        )}

                        {/* Close Button */}
                        <button
                            onClick={() => setHistoryOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--surface-500)] hover:text-[var(--surface-900)] hover:bg-[var(--surface-200)] transition-colors cursor-pointer"
                        >
                            <FaXmark />
                        </button>
                    </div>
                </div>

                {/* Save current btn */}
                <div className="px-4 pt-4 pb-3 shrink-0">
                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--brand-500)] hover:bg-[var(--brand-600)] active:scale-[0.98] text-white font-semibold text-sm transition-all duration-150 shadow-sm shadow-[var(--brand-500)]/25 cursor-pointer"
                    >
                        <FaFloppyDisk />
                        Save Current Version
                    </button>
                </div>

                {/* Divider */}
                {manualSaves.length > 0 && (
                    <div className="flex items-center gap-3 px-4 pb-2 shrink-0">
                        <div className="flex-1 h-px bg-[var(--surface-200)]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--surface-400)]">Saved Versions</span>
                        <div className="flex-1 h-px bg-[var(--surface-200)]" />
                    </div>
                )}

                {/* List */}
                <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 min-h-0">
                    {manualSaves.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 py-16">
                            <div className="w-20 h-20 rounded-2xl bg-[var(--surface-100)] border-2 border-dashed border-[var(--surface-300)] flex items-center justify-center">
                                <FaClockRotateLeft className="text-3xl text-[var(--surface-300)]" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold text-[var(--surface-700)]">No versions yet</p>
                                <p className="text-xs text-[var(--surface-400)] mt-1 max-w-[200px] leading-relaxed">
                                    Save your CV to track versions and restore anytime
                                </p>
                            </div>
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--brand-500)]/30 text-[var(--brand-600)] text-xs font-semibold hover:bg-[var(--brand-500)]/5 transition-colors cursor-pointer"
                            >
                                <FaFloppyDisk className="text-[10px]" />
                                Save first version
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2 pt-1">
                            {[...manualSaves].reverse().map((cv, idx) => {
                                const isLatest = idx === 0;
                                const savedDate = new Date(cv.savedAt);
                                const now = new Date();
                                const diffMs = now - savedDate;
                                const diffMins = Math.floor(diffMs / 60000);
                                const diffHours = Math.floor(diffMs / 3600000);
                                const diffDays = Math.floor(diffMs / 86400000);
                                const relativeTime =
                                    diffMins < 1 ? "Just now" :
                                        diffMins < 60 ? `${diffMins}m ago` :
                                            diffHours < 24 ? `${diffHours}h ago` :
                                                diffDays < 7 ? `${diffDays}d ago` :
                                                    savedDate.toLocaleDateString(undefined, { day: "numeric", month: "short" });

                                const fullTime = savedDate.toLocaleDateString(undefined, {
                                    day: "numeric", month: "short", year: "numeric",
                                    hour: "2-digit", minute: "2-digit"
                                });

                                const accentColor = cv.data?.design?.primaryColor || "var(--brand-500)";
                                const layout = cv.data?.design?.layout || cv.layout || "single";

                                return (
                                    <div key={cv.id} className={cn(
                                        "p-3.5 rounded-xl border transition-all duration-200",
                                        isLatest
                                            ? "border-[var(--brand-500)]/30 bg-[var(--brand-500)]/[0.04] shadow-sm"
                                            : "border-[var(--surface-200)] bg-[var(--surface-100)] hover:border-[var(--surface-300)] hover:bg-[var(--surface-50)]"
                                    )}>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div
                                                className="w-3 h-3 rounded-full shrink-0 border border-black/10 shadow-sm"
                                                style={{ background: accentColor }}
                                            />
                                            <span className="font-semibold text-sm text-[var(--surface-900)] truncate flex-1">
                                                {cv.name || "Untitled CV"}
                                            </span>
                                            {isLatest && (
                                                <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-[var(--brand-500)] text-white text-[9px] font-bold uppercase tracking-wide">
                                                    Latest
                                                </span>
                                            )}
                                        </div>

                                        {/* Meta */}
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[11px] text-[var(--surface-500)]" title={fullTime}>
                                                {relativeTime} · {fullTime.split(",").slice(0, 2).join(",")}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-[var(--surface-300)]" />
                                            <span className={cn(
                                                "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                                                layout === "sidebar"
                                                    ? "bg-purple-500/10 text-purple-600"
                                                    : "bg-blue-500/10 text-blue-600"
                                            )}>
                                                {layout === "sidebar" ? "Professional Layout" : "Modern Edge Layout"}
                                            </span>
                                        </div>

                                        {/* Actions: Restore + Download PDF + Delete */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    loadVersion(cv.id);
                                                    showToast("Version restored!", "success");
                                                    setHistoryOpen(false);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--brand-500)] hover:bg-[var(--brand-600)] active:scale-[0.97] text-white text-xs font-semibold transition-all duration-150 cursor-pointer"
                                            >
                                                <FaArrowRotateLeft className="text-[10px]" />
                                                Restore
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    setDownloadingId(cv.id);
                                                    try {
                                                        const { exportCVToPDF } = await import("../../../utils/exportPdf");
                                                        const { renderCVHTML } = await import("../preview/CVRenderer");
                                                        const html = renderCVHTML(cv.data, cv.name);
                                                        const ok = await exportCVToPDF(null, cv.name, html);
                                                        showToast(ok ? "PDF exported!" : "Export failed.", ok ? "success" : "error");
                                                    } catch {
                                                        showToast("Export failed.", "error");
                                                    } finally {
                                                        setDownloadingId(null);
                                                    }
                                                }}
                                                disabled={downloadingId === cv.id}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--surface-500)] hover:text-[var(--brand-600)] hover:bg-[var(--brand-500)]/10 border border-[var(--surface-200)] hover:border-[var(--brand-500)]/30 transition-all duration-150 disabled:opacity-60"
                                                title="Download PDF"
                                            >
                                                {downloadingId === cv.id
                                                    ? <FaSpinner className="text-[11px] animate-spin text-[var(--brand-500)]" />
                                                    : <FaDownload className="text-[11px]" />
                                                }
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm({ id: cv.id, name: cv.name || "this version" })}
                                                className="w-9 h-9 flex items-center justify-center rounded-lg text-[var(--surface-500)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 border border-[var(--surface-200)] hover:border-red-200 transition-all duration-150"
                                                title="Delete version"
                                            >
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

            {/* DELETE CONFIRM MODAL*/}
            {(deleteConfirm || clearAllConfirm) && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div
                        className="absolute inset-0 bg-black/60 animate-fadeIn"
                        onClick={() => {
                            setDeleteConfirm(null);
                            setClearAllConfirm(false);
                        }}
                    />

                    {/* Modal */}
                    <div className="relative z-10 w-full sm:max-w-[400px] bg-[var(--surface-50)] sm:rounded-2xl rounded-t-3xl shadow-2xl border border-[var(--surface-200)] overflow-hidden animate-scaleIn">

                        {/* Mobile handle */}
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
                                        {deleteConfirm ? "Delete this version?" : "Clear All Versions?"}
                                    </h3>
                                    <p className="text-[13px] text-[var(--surface-500)] mt-1 leading-relaxed">
                                        {deleteConfirm
                                            ? "You're about to permanently delete this CV version."
                                            : "This will permanently delete all saved CV versions."}
                                    </p>
                                </div>
                            </div>

                            {/* CV Name (only for single delete) */}
                            {deleteConfirm && (
                                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[var(--surface-100)] border border-[var(--surface-200)] mb-5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                    <span className="text-sm font-semibold text-[var(--surface-800)] truncate">
                                        {deleteConfirm.name}
                                    </span>
                                </div>
                            )}

                            {/* Warning */}
                            <p className="text-[12px] text-[var(--surface-400)] mb-5 flex items-center gap-1.5">
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    className="shrink-0 text-amber-400"
                                >
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                This action cannot be undone
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setDeleteConfirm(null);
                                        setClearAllConfirm(false);
                                    }}
                                    className="flex-1 py-2.5 rounded-xl border border-[var(--surface-300)] text-sm font-semibold text-[var(--surface-700)] hover:bg-[var(--surface-100)] active:scale-[0.97] transition cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        if (deleteConfirm) {
                                            deleteVersion(deleteConfirm.id);
                                            showToast("Version deleted", "success");
                                            setDeleteConfirm(null);
                                        } else if (clearAllConfirm) {
                                            manualSaves.forEach(cv => deleteVersion(cv.id));
                                            showToast("All versions deleted!", "success");
                                            setClearAllConfirm(false);
                                        }
                                    }}
                                    className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 active:scale-[0.97] transition cursor-pointer"
                                >
                                    <FaTrash className="text-xs" />
                                    {deleteConfirm ? "Delete" : "Clear All"}
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