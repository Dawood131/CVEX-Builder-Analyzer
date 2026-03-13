import React, { useState } from "react";
import { useCV } from "../../../context/CVContext";
import MultiEntryForm from "../components/MultiEntryForm";
import { Button, Modal, FormField } from "../../../shared/ui/UIComponents";
import {
  FaCertificate,
  FaBuilding,
  FaCalendar,
  FaLink,
  FaCheck,
  FaCircleCheck,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";

// ─── Steps ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Cert",    icon: FaCertificate },
  { id: 2, label: "Details", icon: FaBuilding    },
];

// ─── Popular issuers for quick pick ──────────────────────────────
const POPULAR_ISSUERS = [
  "Amazon Web Services", "Google", "Microsoft", "Meta",
  "Coursera", "Udemy", "LinkedIn Learning", "IBM",
  "Cisco", "CompTIA", "Oracle", "Salesforce",
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
      <IconField icon={FaCertificate}>
        <FormField
          label="Certification Name"
          value={form.name}
          onChange={(v) => setForm((p) => ({ ...p, name: v }))}
          required
          placeholder="e.g. AWS Solutions Architect, PMP, IELTS"
        />
      </IconField>
      <IconField icon={FaCalendar}>
        <FormField
          label="Issue Date"
          value={form.date}
          onChange={(v) => setForm((p) => ({ ...p, date: v }))}
          placeholder="e.g. 2023, Mar 2024"
        />
      </IconField>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <IconField icon={FaBuilding}>
        <FormField
          label="Issuing Organization"
          value={form.issuer}
          onChange={(v) => setForm((p) => ({ ...p, issuer: v }))}
          placeholder="e.g. Amazon Web Services, Google"
        />
      </IconField>

      {/* Popular issuers quick pick */}
      <div>
        <div className="text-xs font-semibold text-[var(--surface-400)] uppercase tracking-wide mb-2 ml-11">
          Quick pick
        </div>
        <div className="flex flex-wrap gap-2 ml-11">
          {POPULAR_ISSUERS.map((issuer) => {
            const selected = form.issuer?.toLowerCase() === issuer.toLowerCase();
            return (
              <button
                key={issuer}
                onClick={() => setForm((p) => ({ ...p, issuer: selected ? "" : issuer }))}
                className={[
                  "px-2.5 py-1 rounded-lg text-xs font-semibold border-2 transition-all",
                  selected
                    ? "border-[var(--brand-500)] bg-[var(--brand-50,#eff6ff)] text-[var(--brand-600)]"
                    : "border-[var(--surface-200)] bg-white text-[var(--surface-600)] hover:border-[var(--brand-300)] hover:text-[var(--brand-600)]",
                ].join(" ")}
              >
                {selected && <FaCheck className="inline text-[9px] mr-1" />}
                {issuer}
              </button>
            );
          })}
        </div>
      </div>

      <IconField icon={FaLink}>
        <FormField
          label="Credential URL"
          type="url"
          value={form.link}
          onChange={(v) => setForm((p) => ({ ...p, link: v }))}
          placeholder="https://www.credly.com/badges/..."
          hint="Link to verify your credential online"
        />
      </IconField>

      {/* Tips */}
      <div className="rounded-xl border border-[var(--brand-200,#bfdbfe)] bg-[var(--brand-50,#eff6ff)] p-3">
        <div className="text-xs font-bold text-[var(--brand-600,#2563eb)] mb-1.5 uppercase tracking-wide">
          ✦ Pro tips
        </div>
        <ul className="space-y-1">
          {[
            "Add Credly or official verification links",
            "List most recent or most relevant certs first",
            "Include expiry date if certification renews",
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
  if (step === 1) return !!(form.name?.trim());
  return true;
}

// ─── Main component ───────────────────────────────────────────────
function CertificationsForm() {
  const { cvData, dispatch } = useCV();
  const [editId, setEditId] = useState(null);
  const [form,   setForm]   = useState({});
  const [step,   setStep]   = useState(1);

  const openNew = () => {
    setForm({ name: "", issuer: "", date: "", link: "" });
    setEditId("__new__");
    setStep(1);
  };

  const openEdit = (id) => {
    const item = cvData.certifications.find((e) => e.id === id);
    if (item) { setForm({ ...item }); setEditId(id); setStep(1); }
  };

  const closeModal = () => { setEditId(null); setForm({}); setStep(1); };

  const save = () => {
    if (!form.name?.trim()) return;
    if (editId === "__new__") {
      dispatch({ type: "ADD_ENTRY", section: "certifications", payload: { ...form, id: Date.now().toString() } });
    } else if (editId) {
      dispatch({ type: "UPDATE_ENTRY", section: "certifications", id: editId, payload: form });
    }
    closeModal();
  };

  const isLast  = step === STEPS.length;
  const canNext = canProceed(step, form);

  return (
    <>
      <MultiEntryForm
        section="certifications"
        label="Certification"
        emptyText="No certifications added yet."
        addEntry={openNew}
        editEntry={openEdit}
        renderItem={(item) => (
          <div className="min-w-0 flex items-center gap-2" key={item.id}>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-[var(--surface-800)]">
                {item.name || "New Certification"}
              </div>
              <div className="text-xs text-[var(--surface-500)] truncate">
                {[item.issuer, item.date].filter(Boolean).join(" · ")}
              </div>
            </div>
            {item.link && (
              <FaArrowUpRightFromSquare className="text-[10px] text-[var(--surface-400)] flex-shrink-0" />
            )}
          </div>
        )}
      />

      <Modal
        open={!!editId}
        onClose={closeModal}
        title={editId === "__new__" ? "Add Certification" : "Edit Certification"}
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

export default CertificationsForm;