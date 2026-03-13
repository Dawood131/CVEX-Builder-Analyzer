import React, { useState } from "react";
import { useCV } from "../../../context/CVContext";
import MultiEntryForm from "../components/MultiEntryForm";
import { Button, Modal, FormField } from "../../../shared/ui/UIComponents";
import {
  FaBriefcase,
  FaBuilding,
  FaLocationDot,
  FaCalendar,
  FaAlignLeft,
  FaCheck,
  FaCircleCheck,
} from "react-icons/fa6";

// ─── Step indicator ───────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Role",     icon: FaBriefcase },
  { id: 2, label: "Dates",    icon: FaCalendar  },
  { id: 3, label: "Details",  icon: FaAlignLeft },
];

function StepBar({ current, onGo }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => {
        const done    = current > s.id;
        const active  = current === s.id;
        const Icon    = s.icon;
        return (
          <React.Fragment key={s.id}>
            <button
              onClick={() => done && onGo(s.id)}
              className={[
                "flex flex-col items-center gap-1 min-w-[56px] transition-all",
                done ? "cursor-pointer" : "cursor-default",
              ].join(" ")}
            >
              <div className={[
                "w-9 h-9 rounded-full flex items-center justify-center transition-all border-2",
                done
                  ? "bg-[var(--brand-500)] border-[var(--brand-500)] text-white"
                  : active
                  ? "bg-white border-[var(--brand-500)] text-[var(--brand-500)] shadow-md"
                  : "bg-[var(--surface-100)] border-[var(--surface-300)] text-[var(--surface-400)]",
              ].join(" ")}>
                {done
                  ? <FaCheck className="text-xs" />
                  : <Icon className="text-xs" />}
              </div>
              <span className={[
                "text-[10px] font-semibold uppercase tracking-wide",
                active ? "text-[var(--brand-600)]" : done ? "text-[var(--brand-500)]" : "text-[var(--surface-400)]",
              ].join(" ")}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={[
                "flex-1 h-0.5 mb-4 mx-1 rounded transition-all",
                current > s.id ? "bg-[var(--brand-400)]" : "bg-[var(--surface-200)]",
              ].join(" ")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Field wrapper with icon ──────────────────────────────────────
function IconField({ icon: Icon, children }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="mt-7 w-8 h-8 rounded-lg bg-[var(--surface-100)] border border-[var(--surface-200)] flex items-center justify-center flex-shrink-0">
        <Icon className="text-xs text-[var(--surface-500)]" />
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

// ─── Date range row ───────────────────────────────────────────────
function DateRow({ form, setForm }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <FormField
          label="Start Date"
          value={form.startDate}
          onChange={(v) => setForm((p) => ({ ...p, startDate: v }))}
          placeholder="Jan 2020"
          half
        />
        <div className={`flex-1 transition-opacity duration-200 ${form.current ? "opacity-35 pointer-events-none select-none" : "opacity-100"}`}>
          <FormField
            label="End Date"
            value={form.current ? "" : form.endDate}
            onChange={(v) => setForm((p) => ({ ...p, endDate: v }))}
            placeholder={form.current ? "Present" : "Dec 2023"}
            half
          />
        </div>
      </div>

      {/* Current job toggle */}
      <button
        type="button"
        onClick={() => setForm((p) => ({ ...p, current: !p.current, endDate: !p.current ? "" : p.endDate }))}
        className={[
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left",
          form.current
            ? "border-[var(--brand-500)] bg-[var(--brand-50,#eff6ff)]"
            : "border-[var(--surface-200)] bg-[var(--surface-50)] hover:border-[var(--brand-300)]",
        ].join(" ")}
      >
        <div className={[
          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0",
          form.current
            ? "border-[var(--brand-500)] bg-[var(--brand-500)]"
            : "border-[var(--surface-300)] bg-white",
        ].join(" ")}>
          {form.current && <FaCheck className="text-[8px] text-white" />}
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--surface-800)]">Currently working here</div>
          <div className="text-xs text-[var(--surface-400)] mt-0.5">End date will show as "Present"</div>
        </div>
      </button>
    </div>
  );
}

// ─── Step content ─────────────────────────────────────────────────
function StepContent({ step, form, setForm }) {
  if (step === 1) return (
    <div className="space-y-1">
      <IconField icon={FaBriefcase}>
        <FormField
          label="Job Title / Position"
          value={form.position}
          onChange={(v) => setForm((p) => ({ ...p, position: v }))}
          required
          placeholder="e.g. Senior Software Engineer"
        />
      </IconField>
      <IconField icon={FaBuilding}>
        <FormField
          label="Company Name"
          value={form.company}
          onChange={(v) => setForm((p) => ({ ...p, company: v }))}
          required
          placeholder="e.g. Google, Meta, Amazon"
        />
      </IconField>
      <IconField icon={FaLocationDot}>
        <FormField
          label="City / Location"
          value={form.city}
          onChange={(v) => setForm((p) => ({ ...p, city: v }))}
          placeholder="e.g. San Francisco, CA (optional)"
        />
      </IconField>
    </div>
  );

  if (step === 2) return (
    <IconField icon={FaCalendar}>
      <DateRow form={form} setForm={setForm} />
    </IconField>
  );

  if (step === 3) return (
    <div className="space-y-3">
      <IconField icon={FaAlignLeft}>
        <FormField
          label="Description"
          type="textarea"
          value={form.description}
          onChange={(v) => setForm((p) => ({ ...p, description: v }))}
          placeholder={"• Led a team of 5 engineers\n• Increased system performance by 40%\n• Shipped 3 major product features"}
          rows={6}
        />
      </IconField>

      {/* Tips card */}
      <div className="rounded-xl border border-[var(--brand-200,#bfdbfe)] bg-[var(--brand-50,#eff6ff)] p-3">
        <div className="text-xs font-bold text-[var(--brand-600,#2563eb)] mb-1.5 uppercase tracking-wide">
          ✦ Pro tips
        </div>
        <ul className="space-y-1">
          {[
            "Start each bullet with an action verb (Led, Built, Increased…)",
            "Include numbers and percentages where possible",
            "Focus on impact, not just responsibilities",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-xs text-[var(--brand-700,#1d4ed8)]">
              <FaCircleCheck className="text-[var(--brand-400,#60a5fa)] mt-0.5 flex-shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return null;
}

// ─── Validation ───────────────────────────────────────────────────
function canProceed(step, form) {
  if (step === 1) return !!(form.position?.trim() && form.company?.trim());
  return true;
}

// ─── Main component ───────────────────────────────────────────────
function ExperienceForm() {
  const { cvData, dispatch, uid } = useCV();
  const [editId, setEditId]   = useState(null);
  const [form,   setForm]     = useState({});
  const [step,   setStep]     = useState(1);

  const openNew = () => {
    setForm({
      id: uid(), position: "", company: "", city: "",
      startDate: "", endDate: "", current: false, description: "",
    });
    setEditId("__new__");
    setStep(1);
  };

  const openEdit = (id) => {
    const item = cvData.experience.find((e) => e.id === id);
    if (item) { setForm({ ...item }); setEditId(id); setStep(1); }
  };

  const closeModal = () => { setEditId(null); setForm({}); setStep(1); };

  const save = () => {
    if (editId === "__new__") {
      dispatch({ type: "ADD_ENTRY", section: "experience", payload: form });
    } else if (editId) {
      dispatch({ type: "UPDATE_ENTRY", section: "experience", id: editId, payload: form });
    }
    closeModal();
  };

  const isNew   = editId === "__new__";
  const isLast  = step === STEPS.length;
  const canNext = canProceed(step, form);

  return (
    <>
      <MultiEntryForm
        section="experience"
        label="Experience"
        emptyText="No work experience added yet."
        addEntry={openNew}
        editEntry={openEdit}
        renderItem={(item) => (
          <div className="min-w-0" key={item.id}>
            <div className="font-semibold text-sm truncate text-[var(--surface-800)]">
              {item.position || "New Position"}
            </div>
            <div className="text-xs text-[var(--surface-500)] truncate">
              {[
                item.company,
                item.startDate &&
                  item.startDate + " – " + (item.current ? "Present" : item.endDate || ""),
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        )}
      />

      <Modal
        open={!!editId}
        onClose={closeModal}
        title={isNew ? "Add Experience" : "Edit Experience"}
      >
        <div className="space-y-5">
          {/* Step bar */}
          <StepBar current={step} onGo={setStep} />

          {/* Step content */}
          <div className="min-h-[220px]">
            <StepContent step={step} form={form} setForm={setForm} />
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--surface-200)]">
            <button
              onClick={() => step > 1 ? setStep((s) => s - 1) : closeModal()}
              className="text-sm text-[var(--surface-500)] hover:text-[var(--surface-700)] font-medium transition-colors px-2 py-1"
            >
              {step > 1 ? "← Back" : "Cancel"}
            </button>

            <div className="flex items-center gap-2">
              {/* Step dots */}
              <div className="flex gap-1.5 mr-2">
                {STEPS.map((s) => (
                  <div key={s.id} className={[
                    "w-1.5 h-1.5 rounded-full transition-all",
                    step === s.id ? "bg-[var(--brand-500)] w-4" : step > s.id ? "bg-[var(--brand-300)]" : "bg-[var(--surface-300)]",
                  ].join(" ")} />
                ))}
              </div>

              {isLast ? (
                <Button variant="primary" onClick={save} disabled={!canNext}>
                  <FaCheck className="mr-1.5 text-xs" /> Save
                </Button>
              ) : (
                <Button variant="primary" onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
                  Next →
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default ExperienceForm;