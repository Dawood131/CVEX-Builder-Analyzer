import React, { useState } from "react";
import { useCV } from "../../../context/CVContext";
import MultiEntryForm from "../components/MultiEntryForm";
import { Button, Modal, FormField } from "../../../shared/ui/UIComponents";
import { FaGlobe, FaCheck, FaCircleCheck } from "react-icons/fa6";

// ─── Proficiency levels with descriptions ─────────────────────────
const LEVELS = [
  { id: "Native",       label: "Native",       desc: "First language / mother tongue",   color: "#8b5cf6" },
  { id: "Fluent",       label: "Fluent",        desc: "Near-native, full professional use", color: "#3b82f6" },
  { id: "Advanced",     label: "Advanced",      desc: "Complex topics, minor errors",      color: "#10b981" },
  { id: "Intermediate", label: "Intermediate",  desc: "Everyday conversations",            color: "#f59e0b" },
  { id: "Basic",        label: "Basic",         desc: "Simple phrases and greetings",      color: "#94a3b8" },
];

// ─── Popular languages quick pick ─────────────────────────────────
const POPULAR_LANGS = [
  "English", "Urdu", "Arabic", "French", "German",
  "Spanish", "Chinese", "Hindi", "Turkish", "Persian",
  "Italian", "Portuguese", "Russian", "Japanese",
];

// ─── Level selector card ──────────────────────────────────────────
function LevelSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-[0.8125rem] font-semibold text-[var(--surface-500)] mb-1">
        Proficiency Level
      </label>
      <div className="space-y-2">
        {LEVELS.map((l) => {
          const selected = value === l.id;
          return (
            <button
              key={l.id}
              onClick={() => onChange(l.id)}
              className={[
                "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all text-left",
                selected
                  ? "border-[var(--brand-500)] bg-[var(--brand-50,#eff6ff)]"
                  : "border-[var(--surface-200)] bg-[var(--surface-50)] hover:border-[var(--surface-300)]",
              ].join(" ")}
            >
              {/* Color dot */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: l.color, opacity: selected ? 1 : 0.4 }}
              />
              <div className="flex-1 min-w-0">
                <div className={["text-sm font-semibold", selected ? "text-[var(--brand-700,#1d4ed8)]" : "text-[var(--surface-700)]"].join(" ")}>
                  {l.label}
                </div>
                <div className="text-xs text-[var(--surface-400)] mt-0.5">{l.desc}</div>
              </div>
              {selected && (
                <FaCheck className="text-[var(--brand-500)] text-xs flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────
function LanguagesForm() {
  const { cvData, dispatch } = useCV();
  const [editId,   setEditId]   = useState(null);
  const [form,     setForm]     = useState({ name: "", level: "Intermediate" });
  const [showQuick, setShowQuick] = useState(false);

  const openNew = () => {
    setForm({ name: "", level: "Intermediate" });
    setEditId("__new__");
    setShowQuick(false);
  };

  const openEdit = (id) => {
    const l = cvData.languages.find((e) => e.id === id);
    if (l) { setForm({ ...l }); setEditId(id); setShowQuick(false); }
  };

  const closeModal = () => { setEditId(null); setForm({ name: "", level: "Intermediate" }); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editId === "__new__") {
      dispatch({ type: "ADD_ENTRY", section: "languages", payload: { ...form, id: Date.now().toString() } });
    } else if (editId) {
      dispatch({ type: "UPDATE_ENTRY", section: "languages", id: editId, payload: form });
    }
    closeModal();
  };

  const addedNames  = cvData.languages.map((l) => l.name.toLowerCase());
  const selectedLevel = LEVELS.find((l) => l.id === form.level) || LEVELS[3];

  return (
    <>
      <MultiEntryForm
        section="languages"
        label="Language"
        emptyText="No languages added yet."
        addEntry={openNew}
        editEntry={openEdit}
        renderItem={(item) => {
          const lvl = LEVELS.find((l) => l.id === item.level);
          return (
            <div className="min-w-0 flex items-center gap-2" key={item.id}>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-[var(--surface-800)]">
                  {item.name || "New Language"}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {lvl && (
                    <span
                      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: lvl.color }}
                    />
                  )}
                  <span className="text-xs text-[var(--surface-500)]">
                    {item.level || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          );
        }}
      />

      <Modal
        open={!!editId}
        onClose={closeModal}
        title={editId === "__new__" ? "Add Language" : "Edit Language"}
      >
        <div className="space-y-4">

          {/* Name field + quick pick */}
          <div className="space-y-2">
            <div className="flex gap-3 items-start">
              <div className="mt-7 w-8 h-8 rounded-lg bg-[var(--surface-100)] border border-[var(--surface-200)] flex items-center justify-center flex-shrink-0">
                <FaGlobe className="text-xs text-[var(--surface-500)]" />
              </div>
              <div className="flex-1 min-w-0">
                <FormField
                  label="Language Name"
                  value={form.name}
                  onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                  required
                  placeholder="e.g. English, Urdu, French"
                />
              </div>
            </div>

            {/* Quick pick toggle */}
            <button
              onClick={() => setShowQuick((v) => !v)}
              className="ml-11 text-xs font-semibold text-[var(--brand-500)] hover:text-[var(--brand-700)] transition-colors"
            >
              {showQuick ? "▲ Hide suggestions" : "⚡ Quick pick a language"}
            </button>

            {showQuick && (
              <div className="ml-11 flex flex-wrap gap-2">
                {POPULAR_LANGS.map((lang) => {
                  const added = addedNames.includes(lang.toLowerCase()) && editId === "__new__";
                  const selected = form.name === lang;
                  return (
                    <button
                      key={lang}
                      onClick={() => { if (!added) setForm((p) => ({ ...p, name: lang })); }}
                      className={[
                        "px-2.5 py-1 rounded-lg text-xs font-semibold border-2 transition-all",
                        added
                          ? "border-[var(--surface-200)] text-[var(--surface-400)] cursor-default opacity-50"
                          : selected
                          ? "border-[var(--brand-500)] bg-[var(--brand-50,#eff6ff)] text-[var(--brand-600)]"
                          : "border-[var(--surface-200)] bg-[var(--surface-50)] text-[var(--surface-600)] hover:border-[var(--brand-300)] hover:text-[var(--brand-600)]",
                      ].join(" ")}
                    >
                      {selected && <FaCheck className="inline text-[9px] mr-1" />}
                      {lang}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Level selector */}
          <LevelSelector
            value={form.level || "Intermediate"}
            onChange={(v) => setForm((p) => ({ ...p, level: v }))}
          />

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--surface-200)]">
            <button
              onClick={closeModal}
              className="text-sm text-[var(--surface-500)] hover:text-[var(--surface-700)] font-medium transition-colors px-2 py-1"
            >
              Cancel
            </button>
            <Button variant="primary" onClick={save} disabled={!form.name?.trim()}>
              <FaCheck className="mr-1.5 text-xs" />
              {editId === "__new__" ? "Add Language" : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default LanguagesForm;