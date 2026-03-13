import React, { useState } from "react";
import { useCV } from "../../../context/CVContext";
import MultiEntryForm from "../components/MultiEntryForm";
import { Button, Modal, FormField } from "../../../shared/ui/UIComponents";
import {
  FaCode,
  FaLayerGroup,
  FaLink,
  FaAlignLeft,
  FaCheck,
  FaCircleCheck,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";

// ─── Steps ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Project", icon: FaCode },
  { id: 2, label: "Stack", icon: FaLayerGroup },
  { id: 3, label: "Details", icon: FaAlignLeft },
];

// ─── Step bar ─────────────────────────────────────────────────────
function StepBar({ current, onGo }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {STEPS.map((s, i) => {
        const done = current > s.id;
        const active = current === s.id;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.id}>
            <button
              onClick={() => done && onGo(s.id)}
              className={["flex flex-col items-center gap-1 min-w-[56px] transition-all", done ? "cursor-pointer" : "cursor-default"].join(" ")}
            >
              <div className={[
                "w-9 h-9 rounded-full flex items-center justify-center transition-all border-2",
                done ? "bg-[var(--brand-500)] border-[var(--brand-500)] text-white"
                  : active ? "bg-white border-[var(--brand-500)] text-[var(--brand-500)] shadow-md"
                    : "bg-[var(--surface-100)] border-[var(--surface-300)] text-[var(--surface-400)]",
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

// ─── Popular tech stacks for quick pick ──────────────────────────
const TECH_SUGGESTIONS = [
  "React", "Next.js", "Vue", "Angular", "TypeScript", "JavaScript",
  "Node.js", "Express", "Python", "Django", "FastAPI", "Laravel",
  "MongoDB", "PostgreSQL", "MySQL", "Redis", "Firebase",
  "Docker", "AWS", "Tailwind CSS", "GraphQL", "REST API",
];

// ─── Step content ─────────────────────────────────────────────────
function StepContent({ step, form, setForm }) {

  const toggleTech = (tech) => {
    const current = form.techStack ? form.techStack.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const exists = current.some((t) => t.toLowerCase() === tech.toLowerCase());
    const updated = exists ? current.filter((t) => t.toLowerCase() !== tech.toLowerCase()) : [...current, tech];
    setForm((p) => ({ ...p, techStack: updated.join(", ") }));
  };

  const selectedTechs = form.techStack
    ? form.techStack.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  if (step === 1) return (
    <div className="space-y-1">
      <IconField icon={FaCode}>
        <FormField
          label="Project Name"
          value={form.name}
          onChange={(v) => setForm((p) => ({ ...p, name: v }))}
          required
          placeholder="e.g. E-commerce Platform, Portfolio Website"
        />
      </IconField>
      <IconField icon={FaLink}>
        <FormField
          label="Project Link"
          type="url"
          value={form.link}
          onChange={(v) => setForm((p) => ({ ...p, link: v }))}
          placeholder="https://github.com/username/project"
          hint="GitHub, live demo, or any public URL"
        />
      </IconField>
    </div>
  );

  if (step === 2) return (
    <div className="space-y-3">
      <IconField icon={FaLayerGroup}>
        <FormField
          label="Tech Stack"
          value={form.techStack}
          onChange={(v) => setForm((p) => ({ ...p, techStack: v }))}
          placeholder="React, Node.js, MongoDB"
          hint="Type manually or pick from suggestions below"
        />
      </IconField>

      {/* Tech suggestions */}
      <div>
        <div className="text-xs font-semibold text-[var(--surface-400)] uppercase tracking-wide mb-2 ml-11">
          Quick pick
        </div>
        <div className="flex flex-wrap gap-2 ml-11">
          {TECH_SUGGESTIONS.map((tech) => {
            const selected = selectedTechs.some((t) => t.toLowerCase() === tech.toLowerCase());
            return (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                className={[
                  "px-2.5 py-1 rounded-lg text-xs font-semibold border-2 transition-all",
                  selected
                    ? "border-[var(--brand-500)] bg-[var(--brand-50,#eff6ff)] text-[var(--brand-600)]"
                    : "border-[var(--surface-200)] bg-white text-[var(--surface-600)] hover:border-[var(--brand-300)] hover:text-[var(--brand-600)]",
                ].join(" ")}
              >
                {selected && <FaCheck className="inline text-[9px] mr-1" />}
                {tech}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (step === 3) return (
    <div className="space-y-3">
      <IconField icon={FaAlignLeft}>
        <FormField
          label="Description"
          type="textarea"
          value={form.description}
          onChange={(v) => setForm((p) => ({ ...p, description: v }))}
          placeholder={"• Built a full-stack platform with 10k+ users\n• Reduced load time by 60% with lazy loading\n• Integrated Stripe payments and JWT auth"}
          hint="Use bullet points (•) for each key achievement"
          rows={5}
        />
      </IconField>

      {/* Tips */}
      <div className="rounded-xl border border-[var(--brand-200,#bfdbfe)] bg-[var(--brand-50,#eff6ff)] p-3">
        <div className="text-xs font-bold text-[var(--brand-600,#2563eb)] mb-1.5 uppercase tracking-wide">
          ✦ Pro tips
        </div>
        <ul className="space-y-1">
          {[
            "Mention user numbers, performance gains, or scale",
            "Highlight your specific role and contributions",
            "Add live links — recruiters love to click through",
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
function ProjectsForm() {
  const { cvData, dispatch } = useCV();
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({});
  const [step, setStep] = useState(1);

  const openNew = () => {
    setForm({ name: "", techStack: "", link: "", description: "" });
    setEditId("__new__");
    setStep(1);
  };

  const openEdit = (id) => {
    const item = cvData.projects.find((e) => e.id === id);
    if (item) { setForm({ ...item }); setEditId(id); setStep(1); }
  };

  const closeModal = () => { setEditId(null); setForm({}); setStep(1); };

  // ─── Description bullet formatter ────────────────────────────────
function formatDescription(text) {
  if (!text) return "";

  const lines = text
    .split(/\n|•|-/) 
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => `• ${line}`).join("\n");
}

  const save = () => {

    if (!form.name?.trim()) return;

    const formattedData = {
      ...form,
      description: formatDescription(form.description)
    };

    if (editId === "__new__") {

      dispatch({
        type: "ADD_ENTRY",
        section: "projects",
        payload: {
          ...formattedData,
          id: Date.now().toString()
        }
      });

    } else if (editId) {

      dispatch({
        type: "UPDATE_ENTRY",
        section: "projects",
        id: editId,
        payload: formattedData
      });

    }

    closeModal();
  };

  const isLast = step === STEPS.length;
  const canNext = canProceed(step, form);

  return (
    <>
      <MultiEntryForm
        section="projects"
        label="Project"
        emptyText="No projects added yet."
        addEntry={openNew}
        editEntry={openEdit}
        renderItem={(item) => (
          <div className="min-w-0 flex items-center gap-2" key={item.id}>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm truncate text-[var(--surface-800)]">
                {item.name || "New Project"}
              </div>
              <div className="text-xs text-[var(--surface-500)] truncate">
                {item.techStack || (item.link ? "Has link" : "")}
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
        title={editId === "__new__" ? "Add Project" : "Edit Project"}
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

export default ProjectsForm;