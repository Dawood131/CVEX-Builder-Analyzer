import React from "react";
import SectionHeader from "./SectionHeader";
import { Reveal } from "../../../shared/ui/UIComponents";

import { TbTemplate } from "react-icons/tb";
import { BiEdit } from "react-icons/bi";
import { BsSliders } from "react-icons/bs";
import { FaRegFilePdf } from "react-icons/fa6";
import { HOW_IT_WORKS } from "../../../data/templates";
import { FaRoute } from "react-icons/fa";

const ICON_MAP = {
  "fa-palette": TbTemplate,
  "fa-edit": BiEdit,
  "fa-sliders-h": BsSliders,
  "fa-file-pdf": FaRegFilePdf,
};

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-20 lg:py-28 bg-[var(--surface-50)]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <SectionHeader
          badge="Simple Process"
          badgeIcon={FaRoute}
          title="How It Works"
          subtitle="Four simple steps to your perfect CV"
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
          {HOW_IT_WORKS.map((step, i) => {
            const StepIcon = ICON_MAP[step.icon];

            return (
              <Reveal
                key={i}
                direction="up"
                delay={i * 0.1}
                className="text-center rounded-2xl transition-all duration-300"
              >
                <div className="relative inline-flex mb-6">

                  {/* Icon Box */}
                  <div className="w-16 h-16 rounded-2xl bg-[var(--surface-300)]/20
                                  flex items-center justify-center
                                  transition-transform duration-300 hover:scale-110">
                    {StepIcon && (
                      <StepIcon className="text-2xl text-[var(--brand-600)]" />
                    )}
                  </div>

                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full
                                  bg-[var(--brand-600)] text-white text-xs font-bold
                                  flex items-center justify-center shadow-md">
                    {i + 1}
                  </div>
                </div>

                <h3 className="font-bold text-lg mb-2 text-[var(--foreground)]">
                  {step.title}
                </h3>

                <p className="text-[var(--muted)] text-sm leading-relaxed">
                  {step.desc}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorksSection;