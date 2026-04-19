import React, { useEffect, useState } from 'react';
import { FaArrowRight, FaEye, FaFilePdf } from 'react-icons/fa';

function HeroSection({ navigate }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const anim = (delay = 0) => ({
    transition: `opacity 0.7s ease ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(28px)',
  });
  const skills = [
    { label: 'HTML', pct: 90 },
    { label: 'CSS / Tailwind', pct: 85 },
    { label: 'JavaScript', pct: 80 },
    { label: 'React.js', pct: 75 },
    { label: 'Git & GitHub', pct: 70 },
  ];

  return (
    <section className="relative min-h-screen flex items-center bg-[var(--surface-50)] overflow-hidden">

      {/* Grid bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--surface-200) 1px, transparent 1px),
                            linear-gradient(90deg, var(--surface-200) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
          opacity: 0.4,
        }}
      />

      {/* Glow blobs — theme aware */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-[var(--brand-500)]/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-24">
        <div className="grid lg:grid-cols-2 gap-16 xl:gap-20 items-center">

          {/* ── LEFT ── */}
          <div className="flex flex-col w-full">

            {/* Eyebrow */}
            <div style={anim(0.05)} className="flex items-center gap-3 mb-8 w-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs font-semibold tracking-[0.12em] uppercase text-[var(--surface-500)]">
                CV Builder & Analyzer
              </span>
            </div>

            {/* Headline */}
            <h1
              style={anim(0.12)}
              className="w-full text-5xl sm:text-6xl lg:text-[64px] xl:text-[70px] font-black leading-[1.02] tracking-tight text-[var(--surface-900)] mb-6"
            >
              Land Your<br />
              Dream Job<br />
              <span
                style={{
                  WebkitTextStroke: '2.5px var(--brand-500)',
                  color: 'transparent',
                  display: 'inline-block',
                }}
              >
                Faster.
              </span>
            </h1>

            <p style={anim(0.22)} className="w-full text-base sm:text-[17px] text-[var(--surface-500)] leading-[1.7] mb-10">
              Build ATS-optimized resumes in minutes — or upload your CV
              and get an instant score with actionable fixes.
            </p>

            {/* CTAs */}
            <div style={anim(0.3)} className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full mb-10">
              <button
                onClick={() => navigate('/templates')}
                className="group relative flex items-center justify-center gap-2 w-full px-5 py-[14px] rounded-xl text-sm font-bold overflow-hidden transition-all duration-200"
                style={{
                  background: 'var(--brand-600)',
                  color: '#ffffff',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Build my CV
                <FaArrowRight className="text-xs transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => navigate('/analyzer')}
                className="flex items-center justify-center gap-2 w-full px-5 py-[14px] rounded-xl text-sm font-bold transition-all duration-200 text-[var(--surface-700)]"
                style={{
                  background: 'var(--surface-100)',
                  border: '1px solid var(--surface-200)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-150, var(--surface-200))'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-100)'}
              >
                <FaEye className="text-xs" />
                Analyze my CV
              </button>
            </div>

            {/* Trust */}
            <div style={anim(0.38)} className="flex items-center justify-between w-full pt-7 border-t border-[var(--surface-200)]">
              {[
                { label: 'ATS Friendly' },
                { label: 'PDF Export' },
                { label: 'No Design Skills' },
              ].map(({ label }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <span className="w-px h-5 bg-[var(--surface-200)]" />}
                  <span className="flex items-center gap-2 text-xs text-[var(--surface-500)] font-medium">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <circle cx="7" cy="7" r="6.5" fill="#dcfce7" />
                      <polyline points="4,7 6,9.2 10,4.5" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* ── RIGHT — CV CARD ── */}
          <div style={anim(0.18)} className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-[420px]">

              {/* Corner deco */}
              <div
                className="absolute -top-4 -left-4 w-16 h-16 pointer-events-none"
                style={{
                  borderTop: '1.5px solid var(--brand-400)',
                  borderLeft: '1.5px solid var(--brand-400)',
                  borderRadius: '10px 0 0 0',
                  opacity: 0.5,
                }}
              />
              <div
                className="absolute -bottom-4 -right-4 w-16 h-16 pointer-events-none"
                style={{
                  borderBottom: '1.5px solid var(--brand-400)',
                  borderRight: '1.5px solid var(--brand-400)',
                  borderRadius: '0 0 10px 0',
                  opacity: 0.5,
                }}
              />

              {/* Card */}
              <div
                className="relative rounded-2xl overflow-hidden w-full"
                style={{
                  background: 'var(--surface-100)',
                  border: '1px solid var(--surface-200)',
                  boxShadow: '0 0 0 1px var(--surface-200), 0 24px 64px -12px rgba(0,0,0,0.2)',
                }}
              >
                {/* Top accent bar */}
                <div className="h-[3px] w-full" style={{ background: 'linear-gradient(90deg, var(--brand-500), #a855f7, #ec4899)' }} />

                {/* CV Header */}
                <div
                  className="px-7 pt-6 pb-5"
                  style={{ borderBottom: '1px solid var(--surface-200)' }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg, var(--brand-500), #a855f7)' }}
                      >
                        <span className="text-white text-sm font-black">DB</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--surface-900)] tracking-tight">Dawood Butt</div>
                        <div className="text-[11px] text-[var(--surface-500)] mt-0.5">Frontend Developer</div>
                        <div className="text-[10px] text-[var(--surface-400)] mt-0.5">Lahore, Pakistan</div>
                      </div>
                    </div>
                    {/* ATS Score */}
                    <div
                      className="flex flex-col items-center rounded-xl px-3.5 py-2.5 shrink-0"
                      style={{
                        background: 'color-mix(in srgb, #16a34a 10%, var(--surface-50))',
                        border: '1px solid color-mix(in srgb, #16a34a 20%, transparent)',
                      }}
                    >
                      <span className="text-xl font-black text-emerald-500 leading-none">95</span>
                      <span className="text-[8px] font-bold text-emerald-600 tracking-widest uppercase mt-1">ATS</span>
                    </div>
                  </div>
                </div>

                {/* CV Body */}
                <div className="px-7 py-5 grid grid-cols-2 gap-6">

                  {/* Experience */}
                  <div>
                    <div
                      className="text-[9px] font-bold tracking-[0.14em] uppercase mb-3 flex items-center gap-1.5"
                      style={{ color: 'var(--surface-400)' }}
                    >
                      <span className="w-3 h-[1.5px] inline-block" style={{ background: 'var(--brand-400)' }} />
                      Experience
                    </div>
                    {[
                      ['Lead Developer', 'Google', '2021–Now'],
                      ['Senior Dev', 'Spotify', '2018–21'],
                      ['Frontend Eng', 'Notion', '2016–18'],
                    ].map(([role, co, yr]) => (
                      <div key={role} className="mb-3 last:mb-0">
                        <div className="text-xs font-semibold text-[var(--surface-800)]">{role}</div>
                        <div className="text-[10px] text-[var(--surface-400)]">{co} · {yr}</div>
                      </div>
                    ))}

                    <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--surface-200)' }}>
                      <div
                        className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2 flex items-center gap-1.5"
                        style={{ color: 'var(--surface-400)' }}
                      >
                        <span className="w-3 h-[1.5px] inline-block" style={{ background: 'var(--brand-400)' }} />
                        Education
                      </div>
                      <div className="text-xs font-semibold text-[var(--surface-800)]">BS Computer Science</div>
                      <div className="text-[10px] text-[var(--surface-400)]"> University · 2026</div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <div
                      className="text-[9px] font-bold tracking-[0.14em] uppercase mb-3 flex items-center gap-1.5"
                      style={{ color: 'var(--surface-400)' }}
                    >
                      <span className="w-3 h-[1.5px] inline-block" style={{ background: 'var(--brand-400)' }} />
                      Skills
                    </div>
                    {skills.map(({ label, pct }) => (
                      <div key={label} className="mb-2.5">
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-[var(--surface-500)]">{label}</span>
                          <span className="font-bold text-[var(--surface-600)]">{pct}%</span>
                        </div>
                        <div
                          className="h-[3px] rounded-full overflow-hidden"
                          style={{ background: 'var(--surface-200)' }}
                        >
                          <div
                            className="h-[3px] rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: 'linear-gradient(90deg, var(--brand-500), #a855f7)',
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--surface-200)' }}>
                      <div
                        className="text-[9px] font-bold tracking-[0.14em] uppercase mb-2 flex items-center gap-1.5"
                        style={{ color: 'var(--surface-400)' }}
                      >
                        <span className="w-3 h-[1.5px] bg-emerald-400 inline-block" />
                        Analysis
                      </div>
                      {['Keywords matched', 'Format clean', 'No parse errors'].map(item => (
                        <div key={item} className="flex items-center gap-1.5 text-[10px] text-[var(--surface-500)] mb-1.5">
                          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="4.5" fill="color-mix(in srgb, #16a34a 15%, transparent)" />
                            <polyline points="2.8,5 4.2,6.4 7.2,3.2" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div
                  className="px-7 py-3.5 flex items-center justify-between"
                  style={{
                    background: 'var(--surface-50)',
                    borderTop: '1px solid var(--surface-200)',
                  }}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--surface-400)]">
                    <FaFilePdf className="text-red-400" />
                    PDF export ready
                  </div>
                  <button
                    className="text-[10px] font-bold hover:underline"
                    style={{ color: 'var(--brand-500)' }}
                  >
                    Download →
                  </button>
                </div>
              </div>

              {/* Floating stat chip */}
              <div
                className="absolute -bottom-5 -right-5 rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: 'var(--surface-100)',
                  border: '1px solid var(--surface-200)',
                  boxShadow: '0 8px 24px -4px rgba(0,0,0,0.15)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'color-mix(in srgb, #a855f7 12%, var(--surface-50))' }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 10 L5 6 L8 8 L12 3" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="3" r="1.5" fill="#a855f7" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--surface-800)]">3× more callbacks</div>
                  <div className="text-[10px] text-[var(--surface-400)]">vs unoptimized CVs</div>
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