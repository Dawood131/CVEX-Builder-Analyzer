import React from "react";
import { COLOR_THEMES } from "../../../data/templates";
import { ColorSwatch, Reveal } from "../../../shared/ui/UIComponents";
import { FaPalette, FaFont, FaArrowsAltV, FaUserCircle, FaMagic } from "react-icons/fa";

function CustomizationSection() {
    const [demoColor, setDemoColor] = React.useState('#4f46e5');

    const features = [
        [FaPalette, 'Color Themes', '12+ pre-built color themes or pick your own'],
        [FaFont, 'Font Selection', 'Professional font pairs for any industry'],
        [FaArrowsAltV, 'Spacing Control', 'Fine-tune margins, padding, and line height'],
        [FaUserCircle, 'Photo Options', 'Circle, square, or no photo — your choice'],
    ];

    return (
        <section className="py-20 lg:py-28 bg-[var(--brand-400)] dark:bg-[var(--surface-100)] border-y border-[var(--surface-100)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">

                {/* Left text */}
                <Reveal direction="left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-100)] dark:bg-[var(--brand-800)]/10 dark:text-[var(--brand-600)] text-sm font-semibold mb-4">
                        <FaMagic className="w-4 h-4" /> Customization
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--surface-900)]">Full Design Control</h2>
                    <p className="mt-4 text-[var(--surface-900)] text-lg leading-relaxed">
                        Make your CV truly yours. Change colors, fonts, layouts, and spacing with our intuitive design tools. Every change updates in real-time.
                    </p>
                    <div className="mt-8 space-y-4">
                        {features.map(([Icon, title, desc]) => (
                            <div key={title} className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg dark:bg-[var(--surface-300)]/20 flex items-center justify-center shrink-0">
                                    {Icon && <Icon className="text-[var(--brand-600)] w-5 h-5" />}
                                </div>
                                <div>
                                    <div className="font-semibold text-[var(--surface-900)]">{title}</div>
                                    <div className="text-sm text-[var(--surface-900)]">{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Reveal>

                {/* Right demo */}
                <Reveal direction="right" className="flex justify-center">
                    <div className="bg-[var(--surface-50)] dark:bg-[var(--surface-50)] rounded-2xl border border-[var(--surface-200)] shadow-xl p-6 max-w-sm w-full">
                        <div className="text-sm font-semibold mb-4 text-[var(--surface-900)]">Try Color Themes</div>
                        <div className="flex flex-wrap gap-3 mb-6">
                            {COLOR_THEMES.slice(0, 8).map(t => (
                                <ColorSwatch
                                    key={t.name}
                                    color={t.primary}
                                    active={demoColor === t.primary}
                                    onClick={() => setDemoColor(t.primary)}
                                    title={t.name}
                                />
                            ))}
                        </div>
                        <div className="text-sm font-semibold mb-3 text-[var(--surface-900)]">Preview</div>
                        <div className="rounded-xl overflow-hidden border border-[var(--surface-100)] transition-all duration-300" style={{ aspectRatio: '210/297' }}>
                            <div className="h-full flex flex-col">
                                <div className="py-4 px-5 text-white transition-colors duration-300" style={{ background: demoColor }}>
                                    <div className="font-bold text-sm">John Doe</div>
                                    <div className="text-white/70 text-xs">Software Engineer</div>
                                </div>
                                <div className="flex-1 p-4 bg-white space-y-3">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: demoColor }}>Experience</div>
                                        <div className="w-full h-0.5 rounded mb-2" style={{ background: demoColor, opacity: 0.2 }} />
                                        <div className="text-[11px] text-surface-700 leading-relaxed">
                                            Senior Developer at TechCorp<br />
                                            <span className="text-surface-400">2020 – Present</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: demoColor }}>Skills</div>
                                        <div className="flex gap-1 flex-wrap">
                                            {['React', 'Node.js', 'TypeScript'].map(s => (
                                                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: demoColor + '20', color: demoColor }}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Reveal>

            </div>
        </section>
    );
}

export default CustomizationSection;