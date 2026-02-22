import React from "react";
import SectionHeader from "./SectionHeader";
import { FEATURES } from "../../../data/templates";

import {
  FaGem,
  FaThLarge,
  FaEye,
  FaPalette,
  FaArrowsAlt,
  FaCopy,
  FaRobot,
  FaFilePdf,
  FaMobileAlt
} from "react-icons/fa";

const ICON_MAP = {
  "fa-th-large": FaThLarge,
  "fa-eye": FaEye,
  "fa-palette": FaPalette,
  "fa-arrows-alt": FaArrowsAlt,
  "fa-copy": FaCopy,
  "fa-robot": FaRobot,
  "fa-file-pdf": FaFilePdf,
  "fa-mobile-alt": FaMobileAlt,
};

function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-20 lg:py-28 bg-[var(--brand-400)] dark:bg-[var(--surface-100)] border-y border-[var(--surface-200)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeader
          badge="Features"
          badgeIcon={FaGem}
          title="Everything You Need"
          subtitle="Powerful features to create the perfect CV"
        />

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {FEATURES.map((f, i) => {
            const FeatureIcon = ICON_MAP[f.icon];

            return (
              <div
                key={i}
                className={`
                  reveal
                  text-start rounded-2xl
                    transition-transform duration-300 ease-out
                    hover:scale-[1.03]
                    bg-[var(--surface-50)] dark:bg-[var(--surface-200)]
                    border border-[var(--border)] p-6
                `}
              >
                {/* Icon Box */}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6
                                transition-transform duration-300 hover:scale-110
                                bg-[var(--brand-50)] dark:bg-[var(--brand-700)]/20">
                  {FeatureIcon && (
                    <FeatureIcon className="text-2xl text-[var(--brand-500)]" />
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg mb-2 text-[var(--foreground)]">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;