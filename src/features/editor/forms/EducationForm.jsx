import React, { useState } from "react";
import { useCV } from "../../../context/CVContext";
import MultiEntryForm from "../components/MultiEntryForm";
import { Button, Modal, FormField } from "../../../shared/ui/UIComponents";
import {
  FaGraduationCap,
  FaSchool,
  FaLocationDot,
  FaCalendar,
  FaAlignLeft,
  FaCheck,
  FaCircleCheck,
  FaStar,
} from "react-icons/fa6";

// ─── Steps ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Degree",   icon: FaGraduationCap },
  { id: 2, label: "Dates",    icon: FaCalendar       },
  { id: 3, label: "Details",  icon: FaAlignLeft      },
];

// ─── Step bar ─────────────────────────────────────────────────────
function StepBar({ current, onGo }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => {
        const done   = current > s.id;
        const active = current === s.id;
        const Icon   = s.icon;
        return (
          <React.Fragment key={s.id}>
            <button
              onClick={() => done && onGo(s.id)}
              className={["flex flex-col items-center gap-1 min-w-[56px] transition-all", done ? "cursor-pointer" : "cursor-default"].join(" ")}
            >
              <div className={[
                "w-9 h-9 rounded-full flex items-center justify-center transition-all border-2",
                done   ? "bg-[var(--brand-500)] border-[var(--brand-500)] text-white"
                : active ? "bg-white border-[var(--brand-500)] text-[var(--brand-500)] shadow-md"
                :          "bg-[var(--surface-100)] border-[var(--surface-300)] text-[var(--surface-400)]",
              ].join(" ")}>
                {done ? <FaCheck className="text-xs" /> : <Icon className="text-xs" />}
              </div>
              <span className={[
                "text-[10px] font-semibold uppercase tracking-wide",
                active ? "text-[var(--brand-600)]" : done ? "text-[var(--brand-500)]" : "text-[var(--surface-400)]",
              ].join(" ")}>{s.label}</span>
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

// ─── Icon field wrapper ───────────────────────────────────────────
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

// ─── Step content ─────────────────────────────────────────────────
function StepContent({ step, form, setForm }) {
  if (step === 1) return (
    <div className="space-y-1">
      <IconField icon={FaGraduationCap}>
        <FormField
          label="Degree / Qualification"
          value={form.degree}
          onChange={(v) => setForm((p) => ({ ...p, degree: v }))}
          required
          placeholder="e.g. B.S. Computer Science, MBA"
        />
      </IconField>
      <IconField icon={FaSchool}>
        <FormField
          label="School / University"
          value={form.school}
          onChange={(v) => setForm((p) => ({ ...p, school: v }))}
          required
          placeholder="e.g. MIT, Stanford, LUMS"
        />
      </IconField>
      <IconField icon={FaLocationDot}>
        <FormField
          label="City / Location"
          value={form.city}
          onChange={(v) => setForm((p) => ({ ...p, city: v }))}
          placeholder="e.g. Cambridge, MA (optional)"
        />
      </IconField>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <IconField icon={FaCalendar}>
        <div className="flex gap-3">
          <FormField
            label="Start Date"
            value={form.startDate}
            onChange={(v) => setForm((p) => ({ ...p, startDate: v }))}
            placeholder="2018"
            half
          />
          <div className={`flex-1 transition-opacity duration-200 ${form.current ? "opacity-35 pointer-events-none select-none" : "opacity-100"}`}>
            <FormField
              label="End Date"
              value={form.current ? "" : form.endDate}
              onChange={(v) => setForm((p) => ({ ...p, endDate: v }))}
              placeholder={form.current ? "Present" : "2022"}
              half
            />
          </div>
        </div>
      </IconField>

      {/* Currently studying toggle */}
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
          <div className="text-sm font-semibold text-[var(--surface-800)]">Currently studying here</div>
          <div className="text-xs text-[var(--surface-400)] mt-0.5">End date will show as "Present"</div>
        </div>
      </button>
    </div>
  );

  if (step === 3) return (
    <div className="space-y-3">
      <IconField icon={FaStar}>
        <FormField
          label="GPA / Grade"
          value={form.gpa}
          onChange={(v) => setForm((p) => ({ ...p, gpa: v }))}
          placeholder="e.g. 3.8 / 4.0 (optional)"
        />
      </IconField>
      <IconField icon={FaAlignLeft}>
        <FormField
          label="Description"
          type="textarea"
          value={form.description}
          onChange={(v) => setForm((p) => ({ ...p, description: v }))}
          placeholder={"Strong academic background with consistent performance, hands-on project experience, and knowledge of core subjects"}
          hint="Add achievements, coursework, or honors"
          rows={5}
        />
      </IconField>

      {/* Tips card */}
      <div className="rounded-xl border border-[var(--brand-200,#bfdbfe)] bg-[var(--brand-50,#eff6ff)] p-3">
        <div className="text-xs font-bold text-[var(--brand-600,#2563eb)] mb-1.5 uppercase tracking-wide">
          ✦ Pro tips
        </div>
        <ul className="space-y-1">
          {[
            "Only add GPA if it's 3.5+ or impressive",
            "Mention thesis, capstone, or final year projects",
            "Include relevant coursework for entry-level roles",
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
  if (step === 1) return !!(form.degree?.trim() && form.school?.trim());
  return true;
}

// ─── Main component ───────────────────────────────────────────────
function EducationForm() {
  const { cvData, dispatch } = useCV();
  const [editId, setEditId] = useState(null);
  const [form,   setForm]   = useState({});
  const [step,   setStep]   = useState(1);

  const openNew = () => {
    setForm({ id: Date.now().toString(), degree: "", school: "", city: "", startDate: "", endDate: "", current: false, gpa: "", description: "" });
    setEditId("__new__");
    setStep(1);
  };

  const openEdit = (id) => {
    const item = cvData.education.find((e) => e.id === id);
    if (item) { setForm({ ...item }); setEditId(id); setStep(1); }
  };

  const closeModal = () => { setEditId(null); setForm({}); setStep(1); };

  const save = () => {
    if (editId === "__new__") {
      dispatch({ type: "ADD_ENTRY", section: "education", payload: form });
    } else if (editId) {
      dispatch({ type: "UPDATE_ENTRY", section: "education", id: editId, payload: form });
    }
    closeModal();
  };

  const isLast = step === STEPS.length;
  const canNext = canProceed(step, form);

  return (
    <>
      <MultiEntryForm
        section="education"
        label="Education"
        emptyText="No education added yet."
        addEntry={openNew}
        editEntry={openEdit}
        renderItem={(item) => (
          <div className="min-w-0" key={item.id}>
            <div className="font-semibold text-sm truncate text-[var(--surface-800)]">
              {item.degree || "New Degree"}
            </div>
            <div className="text-xs text-[var(--surface-500)] truncate">
              {[item.school, item.startDate && item.startDate + " – " + (item.endDate || "Present")]
                .filter(Boolean).join(" · ")}
            </div>
          </div>
        )}
      />

      <Modal
        open={!!editId}
        onClose={closeModal}
        title={editId === "__new__" ? "Add Education" : "Edit Education"}
      >
        <div className="space-y-5">
          <StepBar current={step} onGo={setStep} />

          <div className="min-h-[220px]">
            <StepContent step={step} form={form} setForm={setForm} />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--surface-200)]">
            <button
              onClick={() => step > 1 ? setStep((s) => s - 1) : closeModal()}
              className="text-sm text-[var(--surface-500)] hover:text-[var(--surface-700)] font-medium transition-colors px-2 py-1"
            >
              {step > 1 ? "← Back" : "Cancel"}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                {STEPS.map((s) => (
                  <div key={s.id} className={[
                    "h-1.5 rounded-full transition-all",
                    step === s.id ? "bg-[var(--brand-500)] w-4" : step > s.id ? "bg-[var(--brand-300)] w-1.5" : "bg-[var(--surface-300)] w-1.5",
                  ].join(" ")} />
                ))}
              </div>

              {isLast ? (
                <Button variant="primary" onClick={save}>
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

export default EducationForm;