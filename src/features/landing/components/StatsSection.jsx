import React, { useEffect, useRef, useState } from "react";

function StatsSection() {
  const stats = [
    { label: "CVs Created", value: 1000, suffix: "+" },
    { label: "Templates", value: 10, suffix: "+" },
    { label: "User Rating", value: 49, suffix: "★" },
    { label: "Satisfaction", value: 98, suffix: "%" },
  ];

  const sectionRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));

  // Animate numbers when section is in view
  useEffect(() => {
    if (!sectionRef.current || hasAnimated) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        stats.forEach((s, i) => {
          const duration = 1500;
          const stepTime = 16;
          const steps = duration / stepTime;
          let current = 0;
          const increment = s.value / steps;

          function animateStep() {
            current += increment;
            setCounts((prev) => {
              const newCounts = [...prev];
              newCounts[i] = Math.min(Math.floor(current), s.value);
              return newCounts;
            });

            if (current < s.value) requestAnimationFrame(animateStep);
          }

          requestAnimationFrame(animateStep);
        });

        setHasAnimated(true);
      },
      { threshold: 0.3 }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [hasAnimated, stats]);

  return (
    <section
      ref={sectionRef}
      id="stats-section"
      className="
        py-15
        bg-[var(--brand-400)]
        dark:bg-[var(--surface-100)]
        border-y border-[var(--surface-200)]
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={s.label} className="text-center rounded-2xl">
            {/* Count number */}
            <div className="text-3xl sm:text-4xl font-extrabold text-[var(--brand-500)] gradient-text">
              {counts[i]}
              {counts[i] === s.value ? s.suffix : ""}
            </div>

            {/* Label */}
            <div className="text-sm text-[var(--muted)] mt-2 font-medium">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default StatsSection;
