import React from "react";
import { Reveal } from "../../../shared/ui/UIComponents";

function SectionHeader({ badge, badgeIcon: BadgeIcon, title, subtitle }) {
  return (
    <Reveal className="text-center max-w-2xl mx-auto mb-16">
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--brand-200)]/20 text-[var(--brand-400)] text-sm font-semibold mb-4">
          {BadgeIcon && <BadgeIcon className="w-4 h-4" />}
          {badge}
        </div>
      )}

      {/* Title */}
      <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--surface-900)]">
        {title}
      </h2>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-4 text-[var(--surface-500)] text-lg">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}

export default SectionHeader;