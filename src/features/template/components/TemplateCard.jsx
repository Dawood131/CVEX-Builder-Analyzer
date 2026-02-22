import React from "react";
import { TemplateThumbnail } from "../../../shared/ui/UIComponents";
import { Button } from "../../../shared/ui/UIComponents";
import { cn } from "../../../utils/helper";
import { FaCheck } from "react-icons/fa";

function TemplateCard({ template, onClick, selected }) {
  return (
    <div className="cursor-pointer animate-slideUpFade" onClick={onClick}>
      <div className={cn('template-thumb bg-[var(--surface-50)] relative', selected && 'selected')}>
        <TemplateThumbnail template={template} />
        <div className="absolute inset-0 bg-[var(--brand-600)]/0 group-hover:bg-[var(--brand-600)]/10 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
            <Button variant="primary" size="sm" className="shadow-lg">
              Use Template
            </Button>
          </div>
        </div>
        {template.popular && (
          <div className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Popular
          </div>
        )}
        {selected && (
          <div className="absolute top-2 left-2 bg-[var(--brand-600)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <FaCheck className="w-3 h-3" />
            Selected
          </div>
        )}
      </div>
      <div className="mt-3">
        <div className="font-semibold text-sm flex items-center gap-2 text-[var(--surface-900)]">
          {template.name}
          <div className="flex gap-1">
            {template.colors.map((c) => (
              <div
                key={c}
                className="w-3 h-3 rounded-full border border-[var(--surface-900)]"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
        <div className="text-xs text-[var(--surface-900)] mt-0.5">{template.description}</div>
      </div>
    </div>
  );
}

export default TemplateCard;