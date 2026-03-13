import React, { useState } from "react";
import { useCV } from "../../../context/CVContext";
import MultiEntryForm from "../components/MultiEntryForm";
import { Button, Modal, FormField } from "../../../shared/ui/UIComponents";
import {
  FaUser,
  FaBriefcase,
  FaBuilding,
  FaEnvelope,
  FaPhone,
  FaCheck,
  FaCircleCheck,
} from "react-icons/fa6";

// ─── Steps ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Person",  icon: FaUser     },
  { id: 2, label: "Contact", icon: FaEnvelope },
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
      <IconField icon={FaUser}>
        <FormField
          label="Full Name"
          value={form.name}
          onChange={(v) => setForm((p) => ({ ...p, name: v }))}
          required
          placeholder="e.g. Dr. Jane Smith"
        />
      </IconField>
      <IconField icon={FaBriefcase}>
        <FormField
          label="Position / Title"
          value={form.position}
          onChange={(v) => setForm((p) => ({ ...p, position: v }))}
          placeholder="e.g. CTO, Senior Manager"
        />
      </IconField>
      <IconField icon={FaBuilding}>
        <FormField
          label="Company / Organization"
          value={form.company}
          onChange={(v) => setForm((p) => ({ ...p, company: v }))}
          placeholder="e.g. TechCorp Inc., Google"
        />
      </IconField>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <IconField icon={FaEnvelope}>
        <FormField
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(v) => setForm((p) => ({ ...p, email: v }))}
          placeholder="e.g. jane@techcorp.com"
        />
      </IconField>
      <IconField icon={FaPhone}>
        <FormField
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
          placeholder="e.g. +92 300 1234567"
        />
      </IconField>

      {/* Tips card */}
      <div className="rounded-xl border border-[var(--brand-200,#bfdbfe)] bg-[var(--brand-50,#eff6ff)] p-3">
        <div className="text-xs font-bold text-[var(--brand-600,#2563eb)] mb-1.5 uppercase tracking-wide">
          ✦ Pro tips
        </div>
        <ul className="space-y-1">
          {[
            "Always ask permission before listing someone as reference",
            "Choose people who know your work directly",
            "Former managers or senior colleagues work best",
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

// ─── Avatar initials ──────────────────────────────────────────────
function Avatar({ name }) {
  const initials = name
    ? name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";
  return (
    <div className="w-8 h-8 rounded-full bg-[var(--brand-100,#dbeafe)] text-[var(--brand-600)] flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────
function canProceed(step, form) {
  if (step === 1) return !!(form.name?.trim());
  return true;
}

// ─── Main component ───────────────────────────────────────────────
function ReferencesForm() {
  const { cvData, dispatch } = useCV();
  const [editId, setEditId] = useState(null);
  const [form,   setForm]   = useState({});
  const [step,   setStep]   = useState(1);

  const openNew = () => {
    setForm({ name: "", position: "", company: "", email: "", phone: "" });
    setEditId("__new__");
    setStep(1);
  };

  const openEdit = (id) => {
    const item = cvData.references.find((e) => e.id === id);
    if (item) { setForm({ ...item }); setEditId(id); setStep(1); }
  };

  const closeModal = () => { setEditId(null); setForm({}); setStep(1); };

  const save = () => {
    if (!form.name?.trim()) return;
    if (editId === "__new__") {
      dispatch({ type: "ADD_ENTRY", section: "references", payload: { ...form, id: Date.now().toString() } });
    } else if (editId) {
      dispatch({ type: "UPDATE_ENTRY", section: "references", id: editId, payload: form });
    }
    closeModal();
  };

  const isLast  = step === STEPS.length;
  const canNext = canProceed(step, form);

  return (
    <>
      <MultiEntryForm
        section="references"
        label="Reference"
        emptyText="No references added yet."
        addEntry={openNew}
        editEntry={openEdit}
        renderItem={(item) => (
          <div className="min-w-0 flex items-center gap-2" key={item.id}>
            <Avatar name={item.name} />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-[var(--surface-800)]">
                {item.name || "New Reference"}
              </div>
              <div className="text-xs text-[var(--surface-500)] truncate">
                {[item.position, item.company].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        )}
      />

      <Modal
        open={!!editId}
        onClose={closeModal}
        title={editId === "__new__" ? "Add Reference" : "Edit Reference"}
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

export default ReferencesForm;