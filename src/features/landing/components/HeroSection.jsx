import React, { useEffect, useState } from 'react';
import { Button } from '../../../shared/ui/UIComponents';
import {
  FaArrowRight, FaEye, FaShieldAlt, FaFilePdf,
  FaUser, FaCheck, FaDownload,
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

function HeroSection({ navigate }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const skills = ['JavaScript', 'UI/UX', 'TailwindCSS', 'React', 'Redux'];

  const trustBadges = [
    [<FaShieldAlt className="text-emerald-500" />, 'ATS Friendly'],
    [<FaFilePdf className="text-red-500" />, 'PDF Export'],
    [<HiSparkles className="text-purple-500" />, 'No Design Skills Required'],
  ];

  const anim = (delay = 0) => ({
    transition: `opacity 0.8s ease ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    opacity:   mounted ? 1 : 0,
    transform: mounted ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.96)',
  });

  return (
    <section className="relative flex items-center overflow-hidden md:pt-1 pt-10 bg-[var(--surface-50)] dark:bg-[var(--surface-50)]">

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[var(--brand-100)] dark:bg-[var(--brand-100)]/20 blur-3xl opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-100 dark:bg-purple-900/20 blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-50 dark:bg-indigo-950/10 blur-3xl opacity-40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Text */}
          <div className="text-center lg:text-left">

            <div style={anim(0.1)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
              bg-[var(--brand-100)] dark:bg-[var(--brand-200)]/20
              text-[var(--brand-700)] dark:text-[var(--brand-400)]
              text-sm font-semibold mb-6">
              <HiSparkles />
              Trusted by 1,000+ professionals
            </div>

            <h1 style={anim(0.2)} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--surface-700)] dark:text-[var(--surface-800)]">
              Create & Analyze Your CV
              <span className="gradient-text block mt-1">That Gets You Hired</span>
            </h1>

            <p style={anim(0.35)} className="mt-6 text-lg sm:text-xl text-[var(--surface-700)] dark:text-[var(--surface-800)] max-w-xl mx-auto lg:mx-0">
              Build modern, ATS-friendly resumes in minutes with CVEX, or upload your existing CV to analyze it instantly and get actionable feedback to boost your chances of getting hired.
            </p>

            <div style={anim(0.5)} className="flex flex-col sm:flex-row gap-4 mt-8 justify-center lg:justify-start">
              <Button variant="primary" size="xl" className="group" onClick={() => navigate('/templates')}>
                Create Your CV
                <FaArrowRight className="transition-transform group-hover:translate-x-1 ml-2" />
              </Button>
              <Button onClick={() => navigate('/analyzer')} variant="secondary" size="xl">
                <FaEye className="mr-2" /> Analyze Your CV
              </Button>
            </div>

            <div style={anim(0.65)} className="flex flex-wrap gap-4 mt-8 justify-center lg:justify-start">
              {trustBadges.map(([icon, txt]) => (
                <div key={txt} className="flex items-center gap-2 text-sm text-[var(--surface-700)] dark:text-[var(--surface-800)]">
                  {icon}{txt}
                </div>
              ))}
            </div>
          </div>

          {/* Right Mockup */}
          <div style={anim(0.3)} className="relative flex justify-center">
            <div className="relative w-[320px] sm:w-[360px]">
              <div className="absolute inset-0 rounded-2xl blur-2xl opacity-20 scale-105" />
              <div className="relative bg-[var(--surface-50)] dark:bg-[var(--surface-100)] rounded-2xl shadow-2xl overflow-hidden border border-[var(--surface-200)] dark:border-[var(--surface-100)]">

                <div className="h-24 bg-gradient-to-r from-[var(--brand-600)] to-purple-600 flex items-end px-6 pb-3">
                  <div className="flex items-end gap-3">
                    <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/50 flex items-center justify-center -mb-1">
                      <FaUser className="text-white/70 text-lg" />
                    </div>
                    <div className="pb-1">
                      <div className="text-white font-bold text-sm">Dawood Butt</div>
                      <div className="text-white/70 text-xs">Frontend Developer</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand-600)] mb-2">Experience</div>
                    <div className="space-y-2">
                      {[['Lead Developer — Google', '2021 – Present'], ['Senior Developer — Spotify', '2018 – 2021']].map(([t, d]) => (
                        <div key={t} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-500)] mt-1.5 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-[var(--surface-900)] dark:text-[var(--surface-800)]">{t}</div>
                            <div className="text-[10px] text-[var(--surface-400)] dark:text-[var(--surface-800)]">{d}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand-600)] mb-2">Skills</div>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map(s => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--brand-50)] dark:bg-[var(--brand-400)]/10 dark:text-[var(--brand-500)] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand-600)] mb-2">Education</div>
                    <div className="text-xs font-semibold text-[var(--surface-100)] dark:text-[var(--surface-800)]">M.S. Human-Computer Interaction</div>
                    <div className="text-[10px] text-[var(--surface-400)] dark:text-[var(--surface-900)]">Stanford University • 2018</div>
                  </div>
                </div>
              </div>

              <div style={anim(0.75)} className="absolute -right-4 top-16 bg-[var(--surface-50)] dark:bg-[var(--surface-100)] rounded-xl shadow-lg px-3 py-2 animate-floatDelay border border-[var(--surface-100)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-300/30 flex items-center justify-center">
                    <FaCheck className="text-emerald-500 text-[10px]" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--surface-900)] dark:text-[var(--surface-800)]">ATS Score: 95%</span>
                </div>
              </div>

              <div style={anim(0.9)} className="absolute -left-4 bottom-20 bg-[var(--surface-50)] dark:bg-[var(--surface-100)] rounded-xl shadow-lg px-3 py-2 animate-float border border-[var(--surface-100)]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--brand-100)] dark:bg-[var(--brand-300)]/30 flex items-center justify-center">
                    <FaDownload className="text-[var(--brand-500)] text-[10px]" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--surface-900)] dark:text-[var(--surface-800)]">PDF Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;