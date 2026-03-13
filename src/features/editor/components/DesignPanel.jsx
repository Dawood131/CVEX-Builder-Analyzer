import React from "react";
import { TEMPLATES, COLOR_THEMES, FONT_OPTIONS } from "../../../data/templates";
import { TemplateThumbnail, Button, ColorSwatch, Toggle, SmoothDropdown, AdvancedColorPicker } from "../../../shared/ui/UIComponents";
import { useCV } from "../../../context/CVContext";
import { cn } from "../../../utils/helper";
import { useNavigate } from "react-router-dom";
import { LuLayoutGrid } from "react-icons/lu";

// ─── Tiny helpers ─────────────────────────────────────────────
function PanelLabel({ children }) {
    return (
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--surface-400)] mb-2.5 px-0.5">
            {children}
        </p>
    );
}

function Divider() {
    return <div className="h-px bg-[var(--surface-200)] -mx-4 my-1" />;
}

// ─── Slider with live pill value ──────────────────────────────
function FancySlider({ label, value, min, max, step, onChange, hint, pct }) {
    const fillPct = pct !== undefined ? pct : ((value - min) / (max - min)) * 100;
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[0.775rem] font-medium text-[var(--surface-700)]">{label}</span>
                <span className="text-[0.68rem] font-semibold text-[var(--surface-600)] bg-[var(--brand-50)] border border-[var(--brand-100)] px-1.5 py-0.5 rounded-md font-mono leading-none">
                    {hint || value}
                </span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(e)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none"
                style={{
                    background: `linear-gradient(to right, var(--brand-500) ${fillPct}%, var(--surface-200) ${fillPct}%)`
                }}
            />
            <div className="flex justify-between mt-1">
                <span className="text-[0.6rem] text-[var(--surface-400)]">{min}</span>
                <span className="text-[0.6rem] text-[var(--surface-400)]">{max}</span>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
function DesignPanel() {
    const navigate = useNavigate();
    const { cvData, dispatch } = useCV();
    const d = cvData.design;

    const applyTheme = (primary, secondary, accent) => {
        dispatch({ type: 'UPDATE_DESIGN', payload: { primaryColor: primary, secondaryColor: secondary, accentColor: accent } });
    };

    const changeTpl = (id) => {
        const tpl = TEMPLATES.find(t => t.id === id);
        if (!tpl) return;
        dispatch({ type: 'UPDATE_DESIGN', payload: { template: id, layout: tpl.layout || 'single' } });
    };

    return (
        <div className="space-y-4">

            {/* ══ TEMPLATE ════════════════════════════════ */}
            <div>
                <PanelLabel>Template</PanelLabel>
                <div className="grid grid-cols-2 gap-3 mb-2.5">
                    {TEMPLATES.slice(0, 2).map(t => (
                        <div
                            key={t.id}
                            onClick={() => changeTpl(t.id)}
                            className={cn(
                                "relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 hover:shadow-lg group",
                                d.template === t.id
                                    ? "border-[var(--brand-500)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand-500)_18%,transparent)]"
                                    : "border-[var(--surface-200)] hover:border-[var(--surface-300)]"
                            )}
                            style={{ aspectRatio: "210/297" }}
                        >
                            <TemplateThumbnail template={t} primaryColor={d.primaryColor} />

                            {/* Checkmark badge */}
                            {d.template === t.id && (
                                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--brand-500)] flex items-center justify-center shadow-sm z-10">
                                    <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            )}

                            {/* Bottom name strip */}
                            <div className={cn(
                                "absolute bottom-0 inset-x-0 py-1 text-center text-[0.58rem] font-bold tracking-wide transition-all",
                                d.template === t.id
                                    ? "bg-[var(--brand-500)] text-white"
                                    : "bg-black/20 text-white backdrop-blur-[1px] group-hover:bg-black/30"
                            )}>
                                {t.name || t.id}
                            </div>
                        </div>
                    ))}
                </div>

                <Button variant="ghost" size="sm" className="w-full border border-dashed border-[var(--surface-300)] hover:border-[var(--brand-300)] hover:text-[var(--brand-600)] hover:bg-[var(--brand-50)] transition-all" onClick={() => navigate('/templates')}>
                    <div className="flex items-center justify-center gap-1.5 w-full text-[0.75rem]">
                        <LuLayoutGrid className="w-3.5 h-3.5" />
                        <span>Browse All Templates</span>
                    </div>
                </Button>
            </div>

            <Divider />

            {/* ══ COLOR ═══════════════════════════════════ */}
            <div>
                <PanelLabel>Color Theme</PanelLabel>

                {/* Swatches — 6 col grid, square with diagonal accent */}
                <div className="grid grid-cols-6 gap-2 mb-3">
                    {COLOR_THEMES.map(t => (
                        <button
                            key={t.name}
                            title={t.name}
                            onClick={() => applyTheme(t.primary, t.secondary, t.accent)}
                            className={cn(
                                "relative aspect-square rounded-lg overflow-hidden transition-all duration-150",
                                d.primaryColor === t.primary
                                    ? "ring-2 ring-[var(--brand-500)] ring-offset-2 scale-110 shadow-md"
                                    : "ring-1 ring-black/10 hover:scale-110 hover:shadow-sm"
                            )}
                            style={{ background: t.primary }}
                        >
                            {/* Diagonal accent */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                               
                            />
                            {/* Active tick */}
                            {d.primaryColor === t.primary && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <svg viewBox="0 0 10 10" className="w-2.5 h-2.5 drop-shadow">
                                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Custom color row */}
                <div className="flex items-center gap-2 p-2 bg-[var(--surface-100)] rounded-xl border border-[var(--surface-200)]">
                    <AdvancedColorPicker
                        color={d.primaryColor}
                        onChange={(c) => applyTheme(c, c, c)}
                    />
                    <input
                        type="text"
                        value={d.primaryColor}
                        onChange={e => applyTheme(e.target.value, e.target.value, e.target.value)}
                        maxLength={7}
                        className="flex-1 px-2.5 py-1.5 border border-[var(--surface-200)] rounded-lg text-[0.75rem] bg-[var(--surface-50)] font-mono focus:outline-none focus:border-[var(--brand-400)] text-[var(--surface-900)] transition-colors min-w-0"
                        placeholder="#3b82f6"
                    />
                    {/* Live preview swatch */}
                    <div
                        className="w-7 h-7 rounded-lg flex-shrink-0 shadow-inner border border-black/10"
                        style={{ background: d.primaryColor }}
                    />
                </div>
            </div>

            <Divider />

            {/* ══ TYPOGRAPHY ══════════════════════════════ */}
            <div>
                <PanelLabel>Typography</PanelLabel>
                <div className="space-y-4">
                    <SmoothDropdown
                        label="Font Family"
                        options={FONT_OPTIONS}
                        value={d.fontFamily}
                        onChange={v => dispatch({ type: 'UPDATE_DESIGN', payload: { fontFamily: v } })}
                    />

                    <FancySlider
                        label="Font Size"
                        value={d.fontSize}
                        min={10} max={18} step={1}
                        hint={`${d.fontSize}px`}
                        onChange={e => dispatch({ type: 'UPDATE_DESIGN', payload: { fontSize: parseInt(e.target.value) } })}
                    />

                    <FancySlider
                        label="Line Height"
                        value={d.lineHeight}
                        min={1.2} max={2.0} step={0.1}
                        hint={Number(d.lineHeight).toFixed(1)}
                        pct={((d.lineHeight - 1.2) / 0.8) * 100}
                        onChange={e => dispatch({ type: 'UPDATE_DESIGN', payload: { lineHeight: parseFloat(e.target.value) } })}
                    />
                </div>
            </div>

            <Divider />

            {/* ══ SPACING ═════════════════════════════════ */}
            <div>
                <PanelLabel>Spacing</PanelLabel>
                <FancySlider
                    label="Section Spacing"
                    value={d.sectionSpacing}
                    min={8} max={32} step={2}
                    hint={`${d.sectionSpacing}px`}
                    pct={((d.sectionSpacing - 8) / 24) * 100}
                    onChange={e => dispatch({ type: 'UPDATE_DESIGN', payload: { sectionSpacing: parseInt(e.target.value) } })}
                />
            </div>

            <Divider />

            {/* ══ DISPLAY ═════════════════════════════════ */}
            <div>
                <PanelLabel>Display Options</PanelLabel>
                <div className="rounded-xl border border-[var(--surface-200)] overflow-hidden divide-y divide-[var(--surface-100)]">
                    <div className="px-3 py-2 hover:bg-[var(--surface-50)] transition-colors">
                        <Toggle
                            label="Show Icons"
                            active={d.showIcons}
                            onChange={v => dispatch({ type: 'UPDATE_DESIGN', payload: { showIcons: v } })}
                        />
                    </div>
                    <div className="px-3 py-2 hover:bg-[var(--surface-50)] transition-colors">
                        <Toggle
                            label="Show Photo"
                            active={d.showPhoto}
                            onChange={v => dispatch({ type: 'UPDATE_DESIGN', payload: { showPhoto: v } })}
                        />
                    </div>
                </div>

                {/* Photo shape — visible only when show photo is on */}
                {d.showPhoto && (
                    <div className="mt-3">
                        <p className="text-[0.7rem] font-medium text-[var(--surface-500)] mb-2">Photo Shape</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: "circle",  label: "Circle",  borderRadius: "50%" },
                                { id: "rounded", label: "Rounded", borderRadius: "28%" },
                                { id: "square",  label: "Square",  borderRadius: "6px" },
                            ].map(({ id, label, borderRadius }) => (
                                <button
                                    key={id}
                                    onClick={() => dispatch({ type: 'UPDATE_DESIGN', payload: { photoShape: id } })}
                                    className={cn(
                                        "flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all duration-150",
                                        d.photoShape === id
                                            ? "border-[var(--brand-500)] bg-[var(--brand-50)]"
                                            : "border-[var(--surface-200)] hover:border-[var(--surface-300)] bg-[var(--surface-50)]"
                                    )}
                                >
                                    {/* Actual shape preview using live primary color */}
                                    <div
                                        style={{
                                            width: 22, height: 22,
                                            borderRadius,
                                            background: d.primaryColor,
                                            opacity: d.photoShape === id ? 1 : 0.3,
                                            transition: "all 0.15s",
                                        }}
                                    />
                                    <span className={cn(
                                        "text-[0.65rem] font-semibold",
                                        d.photoShape === id ? "text-[var(--surface-600)]" : "text-[var(--surface-500)]"
                                    )}>
                                        {label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

export default DesignPanel;