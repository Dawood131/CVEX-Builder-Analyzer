import React from "react";
import { useNavigate } from 'react-router-dom';
import {
    FaBrain, FaChartPie, FaRobot, FaBullseye, FaChartLine,
    FaMagic, FaExchangeAlt, FaArrowRight, FaClock, FaLock, FaBolt
} from "react-icons/fa";
import SectionHeader from "./SectionHeader";
import { Reveal } from "../../../shared/ui/UIComponents";
import { cn } from "../../../utils/helper";

function AIAnalyzerSection() {
    const navigate = useNavigate();
    const [activeMetric, setActiveMetric] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => setActiveMetric(p => (p + 1) % 4), 3000);
        return () => clearInterval(timer);
    }, []);

    const metrics = [
        { label: 'Resume Score', value: 87, accent: '#10b981', icon: <FaChartPie size={13} /> },
        { label: 'ATS Compatible', value: 92, accent: '#3b82f6', icon: <FaRobot size={13} /> },
        { label: 'Keyword Match', value: 78, accent: '#f59e0b', icon: <FaBullseye size={13} /> },
        { label: 'Impact Score', value: 85, accent: '#a855f7', icon: <FaChartLine size={13} /> },
    ];

    const features = [
        { icon: <FaChartPie />, title: 'Comprehensive Scoring', desc: 'Get a 0–100 score across Content, ATS, Keywords, Formatting, and Writing quality.', accent: '#10b981' },
        { icon: <FaRobot />, title: 'ATS Compatibility Check', desc: 'Ensure your CV passes tracking systems used by 99% of Fortune 500 companies.', accent: '#3b82f6' },
        { icon: <FaBullseye />, title: 'Job Description Matching', desc: "See exactly which keywords you're missing and which you've nailed.", accent: '#f59e0b' },
        { icon: <FaChartLine />, title: 'Impact Analysis', desc: 'Measure how well your achievements are quantified with measurable results.', accent: '#a855f7' },
        { icon: <FaMagic />, title: 'Smart Suggestions', desc: 'Get prioritized, actionable recommendations to boost your score section by section.', accent: '#ec4899' },
    ];

    return (
        <section id="analyzer" className="py-20 lg:py-28 relative overflow-hidden bg-[var(--surface-50)]">

            {/* Dot pattern */}
            {/* <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `radial-gradient(circle, var(--surface-300) 1px, transparent 1px)`,
                    backgroundSize: '28px 28px',
                    opacity: 0.45,
                }}
            /> */}

            {/* Top glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[260px] rounded-full bg-[var(--brand-500)]/8 blur-[100px] pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── HEADER ── */}
                <Reveal className="text-center max-w-3xl mx-auto mb-16">
                    <SectionHeader
                        badge="AI Analysis"
                        badgeIcon={FaBrain}
                        title={
                            <>
                                Optimize Your Resume with{' '}
                                <span className="text-[var(--brand-500)]">
                                    AI Intelligence
                                </span>
                            </>
                        }
                        subtitle="Get instant, actionable insights powered by our AI analyzer. Score your CV against ATS systems, match keywords to job descriptions, and discover hidden improvements."
                    />
                </Reveal>


                {/* ── MAIN GRID ── */}
                <div className="grid lg:grid-cols-2 gap-8 items-start">

                    {/* ── LEFT: METRICS CARD ── */}
                    <Reveal direction="left">
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                                background: 'var(--surface-100)',
                                border: '1px solid var(--surface-200)',
                                boxShadow: '0 0 0 1px var(--surface-200), 0 20px 60px -12px rgba(0,0,0,0.1)',
                            }}
                        >
                            {/* Top accent */}
                            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, var(--brand-500), #a855f7, #ec4899)' }} />

                            <div className="p-6 sm:p-7">

                                {/* Score row */}
                                <div
                                    className="flex items-center gap-5 mb-6 pb-6"
                                    style={{ borderBottom: '1px solid var(--surface-200)' }}
                                >
                                    <div className="relative w-20 h-20 shrink-0">
                                        <svg width="80" height="80" className="-rotate-90">
                                            <circle cx="40" cy="40" r="32" fill="none" stroke="var(--surface-200)" strokeWidth="6" />
                                            <circle
                                                cx="40" cy="40" r="32" fill="none" stroke="#10b981" strokeWidth="6"
                                                strokeDasharray={2 * Math.PI * 32}
                                                strokeDashoffset={2 * Math.PI * 32 * (1 - 0.87)}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-lg font-black text-[var(--surface-900)]">87</span>
                                            <span className="text-[8px] text-[var(--surface-400)] font-medium">/100</span>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-black text-[var(--surface-900)] mb-0.5">Great Score!</div>
                                        <div className="text-xs text-[var(--surface-400)] mb-2.5">Your CV is well-optimized</div>
                                        <div
                                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                                            style={{
                                                background: 'color-mix(in srgb, #10b981 10%, var(--surface-50))',
                                                color: '#059669',
                                                border: '1px solid color-mix(in srgb, #10b981 18%, transparent)',
                                            }}
                                        >
                                            ↑ 12% improvement vs last scan
                                        </div>
                                    </div>
                                </div>

                                {/* 4 metric cards */}
                                <div className="grid grid-cols-2 gap-2.5 mb-5">
                                    {metrics.map((m, i) => (
                                        <div
                                            key={m.label}
                                            className="p-3.5 rounded-xl cursor-default transition-all duration-300"
                                            style={{
                                                background: activeMetric === i
                                                    ? `color-mix(in srgb, ${m.accent} 8%, var(--surface-50))`
                                                    : 'var(--surface-50)',
                                                border: activeMetric === i
                                                    ? `1px solid color-mix(in srgb, ${m.accent} 28%, transparent)`
                                                    : '1px solid var(--surface-200)',
                                                transform: activeMetric === i ? 'scale(1.02)' : 'scale(1)',
                                            }}
                                            onMouseEnter={() => setActiveMetric(i)}
                                        >
                                            <div className="flex items-center gap-2 mb-2.5">
                                                <div
                                                    className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                                    style={{
                                                        background: `color-mix(in srgb, ${m.accent} 14%, var(--surface-100))`,
                                                        color: m.accent,
                                                    }}
                                                >
                                                    {m.icon}
                                                </div>
                                                <span className="text-[10px] font-semibold text-[var(--surface-500)]">{m.label}</span>
                                            </div>
                                            <div className="flex items-end gap-0.5 mb-1.5">
                                                <span className="text-xl font-black text-[var(--surface-900)]">{m.value}</span>
                                                <span className="text-[10px] text-[var(--surface-400)] mb-0.5">%</span>
                                            </div>
                                            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--surface-200)' }}>
                                                <div
                                                    className="h-full rounded-full transition-all duration-700"
                                                    style={{
                                                        width: `${activeMetric === i ? m.value : m.value * 0.65}%`,
                                                        background: m.accent,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Keywords */}
                                <div
                                    className="p-4 rounded-xl"
                                    style={{ background: 'var(--surface-50)', border: '1px solid var(--surface-200)' }}
                                >
                                    <div
                                        className="text-[9px] font-bold tracking-[0.12em] uppercase mb-2.5 flex items-center gap-1.5"
                                        style={{ color: 'var(--surface-400)' }}
                                    >
                                        <span className="w-3 h-[1.5px] bg-[var(--brand-400)] inline-block" />
                                        Keyword Match
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['React', 'TypeScript', 'Node.js', 'AWS', 'Agile', 'CI/CD'].map(kw => (
                                            <span
                                                key={kw}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                                style={{
                                                    background: 'color-mix(in srgb, #10b981 10%, var(--surface-50))',
                                                    color: '#059669',
                                                    border: '1px solid color-mix(in srgb, #10b981 18%, transparent)',
                                                }}
                                            >✓ {kw}</span>
                                        ))}
                                        {['GraphQL', 'Kubernetes'].map(kw => (
                                            <span
                                                key={kw}
                                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                                                style={{
                                                    background: 'color-mix(in srgb, #ef4444 8%, var(--surface-50))',
                                                    color: '#dc2626',
                                                    border: '1px solid color-mix(in srgb, #ef4444 15%, transparent)',
                                                }}
                                            >✗ {kw}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* ── RIGHT: FEATURES + BEFORE/AFTER + CTA ── */}
                    <Reveal direction="right" className="flex flex-col gap-3">

                        {/* Feature list */}
                        <div
                            className="rounded-2xl overflow-hidden"
                            style={{
                                background: 'var(--surface-100)',
                                border: '1px solid var(--surface-200)',
                                boxShadow: '0 0 0 1px var(--surface-200), 0 20px 60px -12px rgba(0,0,0,0.08)',
                            }}
                        >
                            <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #a855f7, #ec4899, var(--brand-500))' }} />
                            <div className="p-6 sm:p-7 flex flex-col gap-1">
                                {features.map((f, i) => (
                                    <div
                                        key={i}
                                        className="flex items-start gap-3.5 p-3 rounded-xl transition-all duration-200 group cursor-default"
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = `color-mix(in srgb, ${f.accent} 5%, var(--surface-50))`;
                                            e.currentTarget.style.borderColor = `color-mix(in srgb, ${f.accent} 20%, transparent)`;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.borderColor = 'transparent';
                                        }}
                                        style={{ border: '1px solid transparent' }}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs"
                                            style={{
                                                background: `color-mix(in srgb, ${f.accent} 12%, var(--surface-100))`,
                                                color: f.accent,
                                                border: `1px solid color-mix(in srgb, ${f.accent} 18%, transparent)`,
                                            }}
                                        >
                                            {f.icon}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-[var(--surface-800)] mb-0.5">{f.title}</div>
                                            <div className="text-[11px] text-[var(--surface-400)] leading-relaxed">{f.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Before / After */}
                        <div
                            className="rounded-2xl p-5"
                            style={{
                                background: 'var(--surface-100)',
                                border: '1px solid var(--surface-200)',
                            }}
                        >
                            <div
                                className="text-[9px] font-bold tracking-[0.12em] uppercase mb-3 flex items-center gap-1.5"
                                style={{ color: 'var(--surface-400)' }}
                            >
                                <FaExchangeAlt style={{ color: 'var(--brand-500)', fontSize: 10 }} />
                                Real Results
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: 'color-mix(in srgb, #ef4444 6%, var(--surface-50))',
                                        border: '1px solid color-mix(in srgb, #ef4444 14%, transparent)',
                                    }}
                                >
                                    <div className="text-2xl font-black leading-none mb-1" style={{ color: '#dc2626' }}>42</div>
                                    <div className="text-[10px] font-semibold mb-0.5" style={{ color: '#dc2626' }}>Before CVEX</div>
                                    <div className="text-[10px] text-[var(--surface-400)]">Missing keywords · No metrics</div>
                                </div>
                                <div
                                    className="p-4 rounded-xl"
                                    style={{
                                        background: 'color-mix(in srgb, #10b981 6%, var(--surface-50))',
                                        border: '1px solid color-mix(in srgb, #10b981 14%, transparent)',
                                    }}
                                >
                                    <div className="text-2xl font-black leading-none mb-1" style={{ color: '#059669' }}>87</div>
                                    <div className="text-[10px] font-semibold mb-0.5" style={{ color: '#059669' }}>After CVEX</div>
                                    <div className="text-[10px] text-[var(--surface-400)]">+107% improvement</div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div
                            className="rounded-2xl p-5"
                            style={{
                                background: 'var(--surface-100)',
                                border: '1px solid var(--surface-200)',
                            }}
                        >
                            <button
                                onClick={() => navigate('/analyzer')}
                                className="group flex items-center justify-center gap-2 w-full px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 text-white mb-4"
                                style={{
                                    background: 'var(--brand-600)',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                <FaBrain className="text-xs" />
                                Analyze Your Resume Now
                                <FaArrowRight className="text-xs transition-transform duration-200 group-hover:translate-x-1" />
                            </button>

                            <div
                                className="flex items-center justify-between pt-4"
                                style={{ borderTop: '1px solid var(--surface-200)' }}
                            >
                                {[
                                    { icon: <FaClock />, label: 'Free scans', color: '#f59e0b' },
                                    { icon: <FaLock />, label: 'No sign-up', color: '#10b981' },
                                    { icon: <FaBolt />, label: 'Instant results', color: '#3b82f6' },
                                ].map(({ icon, label, color }) => (
                                    <div key={label} className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--surface-400)]">
                                        <span style={{ color, fontSize: 10 }}>{icon}</span>
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </Reveal>
                </div>
            </div>
        </section>
    );
}

export default AIAnalyzerSection;