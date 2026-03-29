import React, { useState, useEffect, useRef } from "react";
import SectionHeader from "./SectionHeader";
import { TESTIMONIALS } from "../../../data/templates";
import { FaHeart } from "react-icons/fa6";

function TestimonialsSection() {
  const cardGap = 24; // px gap
  const transitionTime = 700; // ms
  const visibleCards = 3; // how many visible on desktop
  const trackRef = useRef(null);

  // Clone last `visibleCards` at start, first `visibleCards` at end
  const clonesStart = TESTIMONIALS.slice(-visibleCards);
  const clonesEnd = TESTIMONIALS.slice(0, visibleCards);
  const cards = [...clonesStart, ...TESTIMONIALS, ...clonesEnd];

  const [activeIndex, setActiveIndex] = useState(visibleCards); // start at first real card

  const next = () => setActiveIndex((prev) => prev + 1);

  // Auto-scroll
  useEffect(() => {
    const interval = setInterval(next, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle transform + seamless loop
  useEffect(() => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const cardWidth = track.children[0].offsetWidth + cardGap;

    track.style.transition = `transform ${transitionTime}ms ease-in-out`;
    track.style.transform = `translateX(-${activeIndex * cardWidth}px)`;

    // Seamless loop: if reached clones at end, snap back
    if (activeIndex >= TESTIMONIALS.length + visibleCards) {
      setTimeout(() => {
        track.style.transition = "none"; // remove animation
        setActiveIndex(visibleCards); // snap to first real card
        track.style.transform = `translateX(-${visibleCards * cardWidth}px)`;
      }, transitionTime);
    }
  }, [activeIndex]);

  return (
    <section
      id="testimonials"
      className="py-20 lg:py-28 bg-[var(--surface-100)] overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge="Testimonials"
          badgeIcon={FaHeart}
          title="Loved by Professionals"
        />

        <div className="relative overflow-hidden mt-10">
          <div ref={trackRef} className="flex gap-6">
            {cards.map((t, idx) => (
              <div
                key={idx}
                className="flex-shrink-0 w-full sm:w-[80%] lg:w-[32%] bg-[var(--surface-50)] rounded-2xl border border-[var(--surface-200)] p-6"
              >
                {/* User */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[var(--surface-900)]">
                      {t.name}
                    </div>
                    <div className="text-xs text-gray-400">{t.role}</div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex gap-1 mt-4 mb-3">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-sm ${
                        i < t.rating ? "text-amber-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-sm leading-relaxed text-[var(--surface-900)]">
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsSection;