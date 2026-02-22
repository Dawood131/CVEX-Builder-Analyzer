import React from "react";
import {
    FaBrain,
    FaChartPie,
    FaRobot,
    FaBullseye,
    FaChartLine,
    FaMagic,
    FaExchangeAlt,
    FaArrowRight,
    FaClock,
    FaLock,
    FaBolt
} from "react-icons/fa";
import { Button } from "../../../shared/ui/UIComponents";
import {cn }from "../../../utils/helper";

function AIAnalyzerSection({ navigate }) {
    const [activeMetric, setActiveMetric] = React.useState(0);

    React.useEffect(() => {
        const timer = setInterval(() => setActiveMetric(p => (p + 1) % 4), 3000);
        return () => clearInterval(timer);
    }, []);

    const metrics = [
        { label: 'Resume Score', value: 87, icon: <FaChartPie size={14} />, color: 'from-emerald-400 to-emerald-600' },
        { label: 'ATS Compatible', value: 92, icon: <FaRobot size={14} />, color: 'from-blue-400 to-blue-600' },
        { label: 'Keyword Match', value: 78, icon: <FaBullseye size={14} />, color: 'from-amber-400 to-amber-600' },
        { label: 'Impact Score', value: 85, icon: <FaChartLine size={14} />, color: 'from-purple-400 to-purple-600' }
    ];

    const features = [
        { icon: <FaChartPie />, title: 'Comprehensive Scoring', desc: 'Get a 0-100 score across 5 dimensions: Content, ATS, Keywords, Formatting, and Writing quality.' },
        { icon: <FaRobot />, title: 'ATS Compatibility Check', desc: 'Ensure your CV passes Applicant Tracking Systems used by 99% of Fortune 500 companies.' },
        { icon: <FaBullseye />, title: 'Job Description Matching', desc: "Paste a job posting and see exactly which keywords you're missing and which you've nailed." },
        { icon: <FaChartLine />, title: 'Impact Analysis', desc: 'Measure how well your achievements are quantified with action verbs and measurable results.' },
        { icon: <FaMagic />, title: 'Smart Suggestions', desc: 'Get prioritized, actionable recommendations to boost your score section by section.' }
    ];

    return (
        <section id="analyzer" className="py-20 lg:py-28 relative overflow-hidden">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-indigo-900" />
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-semibold mb-4">
                        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                            <FaBrain size={10} className="text-white" />
                        </div>
                        AI-Powered Analysis — New Feature
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                        Optimize Your Resume with{' '}
                        <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                            AI Intelligence
                        </span>
                    </h2>
                    <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
                        Get instant, actionable insights powered by our AI analyzer. Score your CV against ATS systems, match keywords to job descriptions, and discover hidden improvements.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-center reveal">
                    {/* Left: Metrics */}
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-500/20 to-purple-500/20 rounded-3xl blur-xl" />
                        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-8">
                            {/* Score circle */}
                            <div className="flex items-center gap-6 mb-6">
                                <div className="relative w-28 h-28 shrink-0">
                                    <svg width="112" height="112" className="transform -rotate-90">
                                        <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                        <circle
                                            cx="56"
                                            cy="56"
                                            r="48"
                                            fill="none"
                                            stroke="#10b981"
                                            strokeWidth="8"
                                            strokeDasharray={2 * Math.PI * 48}
                                            strokeDashoffset={2 * Math.PI * 48 * (1 - 0.87)}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-extrabold text-white">87</span>
                                        <span className="text-[10px] text-white/60">out of 100</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-white font-bold text-lg">Great Score!</div>
                                    <div className="text-white/60 text-sm">Your CV is well-optimized</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        <span className="text-emerald-400 text-xs font-semibold">↑ 12% improvement</span>
                                        <span className="text-white/40 text-xs"> vs. last scan</span>
                                    </div>
                                </div>
                            </div>

                            {/* Metric cards */}
                            <div className="grid grid-cols-2 gap-3">
                                {metrics.map((m, i) => (
                                    <div
                                        key={m.label}
                                        className={cn(
                                            'p-3 rounded-xl transition-all duration-500 cursor-default',
                                            activeMetric === i ? 'bg-white/20 scale-[1.02] shadow-lg' : 'bg-white/5 hover:bg-white/10'
                                        )}
                                        onMouseEnter={() => setActiveMetric(i)}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={cn('w-7 h-7 rounded-lg bg-gradient-to-br flex items-center justify-center', m.color)}>
                                                {m.icon}
                                            </div>
                                            <span className="text-white/70 text-xs font-medium">{m.label}</span>
                                        </div>
                                        <div className="flex items-end gap-1">
                                            <span className="text-2xl font-extrabold text-white">{m.value}</span>
                                            <span className="text-white/40 text-xs mb-1">%</span>
                                        </div>
                                        <div className="mt-1.5 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                            <div
                                                className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-1000', m.color)}
                                                style={{ width: `${activeMetric === i ? m.value : m.value * 0.7}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Keyword preview */}
                            <div className="mt-4 p-3 rounded-xl bg-white/5">
                                <div className="text-xs font-semibold text-white/80 mb-2">Top Matched Keywords</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {['React', 'TypeScript', 'Node.js', 'AWS', 'Agile', 'Leadership', 'CI/CD'].map((kw) => (
                                        <span key={kw} className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-medium">
                                            ✓ {kw}
                                        </span>
                                    ))}
                                    {['GraphQL', 'Kubernetes'].map((kw) => (
                                        <span key={kw} className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-medium">
                                            ✗ {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Features + CTA */}
                    <div className="space-y-6 reveal">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-start gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors text-white">
                                    {f.icon}
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm">{f.title}</h4>
                                    <p className="text-white/60 text-sm mt-0.5 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}

                        {/* Before/After card */}
                        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur border border-white/10">
                            <div className="flex items-center gap-2 mb-3">
                                <FaExchangeAlt className="text-amber-400" />
                                <span className="text-white font-bold text-sm">Before → After</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                    <div className="text-2xl font-extrabold text-red-400">42</div>
                                    <div className="text-[10px] text-red-300 mt-0.5">Before optimization</div>
                                    <div className="text-[10px] text-red-300/70">Missing keywords, no metrics</div>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="text-2xl font-extrabold text-emerald-400">87</div>
                                    <div className="text-[10px] text-emerald-300 mt-0.5">After CVEX analysis</div>
                                    <div className="text-[10px] text-emerald-300/70">+107% improvement</div>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <Button
                                variant="white"
                                size="xl"
                                className="group flex items-center justify-center gap-2"
                                onClick={() => navigate('/analyzer')}
                            >
                                <FaBrain />
                                Analyze Your Resume Now
                                <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>

                        {/* Footer icons */}
                        <div className="flex items-center gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-1"><FaClock className="text-amber-400" /> Free scans</div>
                            <div className="flex items-center gap-1"><FaLock className="text-emerald-400" /> No sign-up required</div>
                            <div className="flex items-center gap-1"><FaBolt className="text-blue-400" /> Results in seconds</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AIAnalyzerSection;