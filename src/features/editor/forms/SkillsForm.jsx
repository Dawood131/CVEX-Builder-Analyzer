import React, { useState } from "react";
import { useCV } from "../../../context/CVContext";
import MultiEntryForm from "../components/MultiEntryForm";
import { Button, Modal, FormField } from "../../../shared/ui/UIComponents";
import { FaCheck, FaStar, FaWandMagicSparkles } from "react-icons/fa6";

// ─── Proficiency levels ───────────────────────────────────────────
const LEVELS = [
  { label: "Beginner",     value: 25, color: "#94a3b8" },
  { label: "Elementary",   value: 40, color: "#60a5fa" },
  { label: "Intermediate", value: 60, color: "#34d399" },
  { label: "Advanced",     value: 80, color: "#a78bfa" },
  { label: "Expert",       value: 95, color: "#f59e0b" },
];

// Quick-add popular skills by category
const QUICK_SKILLS = {
  "💻 Tech": ["JavaScript", "Python", "React", "Node.js", "TypeScript", "SQL", "Git", "Docker"],
  "🎨 Design": ["Figma", "Photoshop", "Illustrator", "UI/UX", "Canva"],
  "📊 Business": ["Excel", "PowerPoint", "Project Management", "Agile", "Scrum"],
};

function getLevelInfo(val) {
  return [...LEVELS].reverse().find((l) => val >= l.value) || LEVELS[0];
}

// ─── Custom slider ────────────────────────────────────────────────
function ProficiencySlider({ value, onChange }) {
  const info = getLevelInfo(value);

  return (
    <div className="space-y-3">
      {/* Level pills */}
      <div className="flex gap-2 flex-wrap">
        {LEVELS.map((l) => (
          <button
            key={l.label}
            onClick={() => onChange(l.value)}
            className={[
              "px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all",
              value === l.value
                ? "border-[var(--brand-500)] bg-[var(--brand-50,#eff6ff)] text-[var(--brand-600)]"
                : "border-[var(--surface-200)] bg-[var(--surface-50)] text-[var(--surface-500)] hover:border-[var(--surface-300)]",
            ].join(" ")}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-[var(--surface-500)]">Proficiency</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: info.color }}
          >
            {info.label} · {value}%
          </span>
        </div>

        {/* Track */}
        <div className="relative h-2 rounded-full bg-[var(--surface-200)]">
          <div
            className="absolute left-0 top-0 h-full rounded-full transition-all duration-200"
            style={{ width: `${value}%`, background: info.color }}
          />
          <input
            type="range"
            min={10} max={100} step={5}
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Tick marks */}
        <div className="flex justify-between px-0.5">
          {LEVELS.map((l) => (
            <div
              key={l.label}
              onClick={() => onChange(l.value)}
              className="flex flex-col items-center gap-0.5 cursor-pointer"
            >
              <div
                className="w-1 h-1 rounded-full transition-all"
                style={{ background: value >= l.value ? info.color : "#cbd5e1" }}
              />
              <span className="text-[9px] text-[var(--surface-400)]">{l.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────
function SkillsForm() {
  const { cvData, dispatch } = useCV();
  const [editId,    setEditId]    = useState(null);
  const [form,      setForm]      = useState({ name: "", level: 80 });
  const [activeTab, setActiveTab] = useState("manual"); // "manual" | "quick"
  const [activeCat, setActiveCat] = useState(Object.keys(QUICK_SKILLS)[0]);
  const [pendingSkill, setPendingSkill] = useState(null); // { name } waiting for level pick

  const openNew  = () => { setForm({ name: "", level: 80 }); setEditId("__new__"); setActiveTab("manual"); };
  const openEdit = (id) => {
    const item = cvData.skills.find((e) => e.id === id);
    if (item) { setForm({ ...item }); setEditId(id); setActiveTab("manual"); }
  };
  const closeModal = () => { setEditId(null); setForm({ name: "", level: 80 }); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editId === "__new__") {
      dispatch({ type: "ADD_ENTRY", section: "skills", payload: { ...form, id: Date.now().toString() } });
    } else if (editId) {
      dispatch({ type: "UPDATE_ENTRY", section: "skills", id: editId, payload: form });
    }
    closeModal();
  };

  // Quick add — show level picker first
  const quickAdd = (skillName) => {
    const already = cvData.skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase());
    if (already) return;
    setPendingSkill({ name: skillName, level: 80 });
  };

  const confirmQuickAdd = () => {
    if (!pendingSkill) return;
    dispatch({ type: "ADD_ENTRY", section: "skills", payload: { ...pendingSkill, id: Date.now().toString() } });
    setPendingSkill(null);
  };

  const addedNames = cvData.skills.map((s) => s.name.toLowerCase());

  return (
    <>
      <MultiEntryForm
        section="skills"
        label="Skills"
        emptyText="No skills added yet."
        addEntry={openNew}
        showCopy={false}
        editEntry={openEdit}
        renderItem={(item) => {
          const info = getLevelInfo(item.level || 80);
          return (
            <div className="min-w-0 flex items-center gap-2" key={item.id}>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate text-[var(--surface-800)]">
                  {item.name || "New Skill"}
                </div>
                {item.level && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="h-1 w-16 rounded-full bg-[var(--surface-200)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.level}%`, background: info.color }} />
                    </div>
                    <span className="text-[10px] text-[var(--surface-400)]">{info.label}</span>
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />

      <Modal
        open={!!editId}
        onClose={closeModal}
        title={editId === "__new__" ? "Add Skill" : "Edit Skill"}
      >
        <div className="space-y-4">

          {/* Tabs — only for new */}
          {editId === "__new__" && (
            <div className="flex rounded-xl overflow-hidden border border-[var(--surface-200)] p-1 gap-1 bg-[var(--surface-100)]">
              {[
                { id: "manual", label: "✏️ Manual", },
                { id: "quick",  label: "⚡ Quick Add", },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={[
                    "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all",
                    activeTab === t.id
                      ? "bg-[var(--surface-50)] text-[var(--brand-600)] shadow-sm "
                      : "text-[var(--surface-500)] hover:text-[var(--surface-700)]",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Manual tab */}
          {activeTab === "manual" && (
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="mt-7 w-8 h-8 rounded-lg bg-[var(--surface-100)] border border-[var(--surface-200)] flex items-center justify-center flex-shrink-0">
                  <FaStar className="text-xs text-[var(--surface-500)]" />
                </div>
                <div className="flex-1">
                  <FormField
                    label="Skill Name"
                    value={form.name}
                    onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                    required
                    placeholder="e.g. JavaScript, Figma, Excel"
                  />
                </div>
              </div>

              <ProficiencySlider
                value={form.level || 80}
                onChange={(v) => setForm((p) => ({ ...p, level: v }))}
              />
            </div>
          )}

          {/* Quick add tab */}
          {activeTab === "quick" && (
            <div className="space-y-3">
              {/* Category tabs */}
              <div className="flex gap-2 flex-wrap">
                {Object.keys(QUICK_SKILLS).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCat(cat)}
                    className={[
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                      activeCat === cat
                        ? "border-[var(--brand-500)] bg-[var(--brand-50,#eff6ff)] text-[var(--brand-800)]"
                        : "border-[var(--surface-200)] text-[var(--surface-500)] hover:border-[var(--surface-300)]",
                    ].join(" ")}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Skill chips */}
              <div className="flex flex-wrap gap-2">
                {QUICK_SKILLS[activeCat].map((skill) => {
                  const added = addedNames.includes(skill.toLowerCase());
                  const isPending = pendingSkill?.name === skill;
                  return (
                    <button
                      key={skill}
                      onClick={() => !added && !isPending && quickAdd(skill)}
                      className={[
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all",
                        added
                          ? "border-[var(--brand-400)] bg-[var(--brand-50,#eff6ff)] text-[var(--brand-500)] cursor-default"
                          : isPending
                          ? "border-[var(--brand-500)] bg-[var(--brand-500)] text-white"
                          : "border-[var(--surface-200)] bg-[var(--surface-50)] text-[var(--surface-500)] hover:border-[var(--brand-400)] hover:text-[var(--brand-600)] cursor-pointer",
                      ].join(" ")}
                    >
                      {added && <FaCheck className="text-[9px] text-[var(--brand-500)]" />}
                      {skill}
                    </button>
                  );
                })}
              </div>

              {/* Proficiency picker for pending skill */}
              {pendingSkill && (
                <div className="rounded-xl border-2 border-[var(--brand-300)] bg-[var(--brand-50,#eff6ff)] p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[var(--brand-700,#1d4ed8)]">
                      Set level for <span className="text-[var(--brand-600)]">"{pendingSkill.name}"</span>
                    </span>
                    <button
                      onClick={() => setPendingSkill(null)}
                      className="text-xs text-[var(--surface-400)] hover:text-[var(--surface-600)] px-1"
                    >✕</button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {LEVELS.map((l) => (
                      <button
                        key={l.label}
                        onClick={() => setPendingSkill((p) => ({ ...p, level: l.value }))}
                        className={[
                          "px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all",
                          pendingSkill.level === l.value
                            ? "border-[var(--brand-500)] bg-[var(--surface-50)] text-[var(--brand-600)] shadow-sm"
                            : "border-transparent bg-white/60 text-[var(--surface-600)] hover:bg-white  cursor-pointer",
                        ].join(" ")}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={confirmQuickAdd}
                    className="w-full py-2 rounded-lg bg-[var(--brand-500)] text-white text-xs font-bold hover:bg-[var(--brand-600)] transition-all flex items-center justify-center gap-2  cursor-pointer"
                  >
                    <FaCheck className="text-[10px]" /> Add "{pendingSkill.name}" · {getLevelInfo(pendingSkill.level).label}
                  </button>
                </div>
              )}

              {!pendingSkill && (
                <p className="text-xs text-[var(--surface-400)] pt-1">
                  Tap any skill to set proficiency and add it.
                </p>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-between items-center pt-2 border-t border-[var(--surface-200)]">
            <button
              onClick={closeModal}
              className="text-sm text-[var(--surface-500)] hover:text-[var(--surface-700)] font-medium transition-colors px-2 py-1  cursor-pointer"
            >
              {activeTab === "quick" ? "Done" : "Cancel"}
            </button>
            {activeTab === "manual" && (
              <Button variant="primary" onClick={save} disabled={!form.name?.trim()}>
                <FaCheck className="mr-1.5 text-xs" />
                {editId === "__new__" ? "Add Skill" : "Save"}
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

export default SkillsForm;