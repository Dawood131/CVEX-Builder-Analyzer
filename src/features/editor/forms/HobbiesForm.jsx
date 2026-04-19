import React, { useState } from "react";
import { useCV } from "../../../context/CVContext";
import { Button } from "../../../shared/ui/UIComponents";
import { FaPlus, FaXmark, FaCheck } from "react-icons/fa6";

// ─── Popular hobbies by category ──────────────────────────────────
const HOBBY_CATEGORIES = {
  "🎨 Creative": ["Photography", "Drawing", "Painting", "Video Editing", "Graphic Design", "Writing", "Poetry"],
  "💪 Sports":   ["Football", "Cricket", "Basketball", "Swimming", "Gym", "Cycling", "Running", "Tennis"],
  "🎵 Music":    ["Guitar", "Piano", "Singing", "Music Production", "DJing"],
  "💻 Tech":     ["Open Source", "Gaming", "3D Modeling", "App Development", "Blogging"],
  "🌍 Other":    ["Travelling", "Reading", "Cooking", "Hiking", "Volunteering", "Chess", "Gardening"],
};

function HobbiesForm() {
  const { cvData, dispatch } = useCV();
  const [input,     setInput]     = useState("");
  const [activeCat, setActiveCat] = useState(Object.keys(HOBBY_CATEGORIES)[0]);

  const addedNames = cvData.hobbies.map((h) => h.name.toLowerCase());

  const addHobby = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (addedNames.includes(trimmed.toLowerCase())) return;
    dispatch({
      type: "ADD_ENTRY",
      section: "hobbies",
      payload: { name: trimmed, id: Date.now().toString() },
    });
  };

  const removeHobby = (id) => {
    dispatch({ type: "REMOVE_ENTRY", section: "hobbies", id });
  };

  const handleInputAdd = () => {
    addHobby(input);
    setInput("");
  };

  return (
    <div className="space-y-4">

      {/* Added hobbies */}
      {cvData.hobbies.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-[var(--surface-400)] uppercase tracking-wide mb-2">
            Added ({cvData.hobbies.length})
          </div>
          <div className="flex flex-wrap gap-2">
            {cvData.hobbies.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                  bg-[var(--brand-50,#eff6ff)] text-[var(--surface-700)]
                  border border-[var(--brand-200,#bfdbfe)]
                  text-sm font-semibold group"
              >
                <span>{h.name}</span>
                <button
                  onClick={() => removeHobby(h.id)}
                  className="w-4 h-4 rounded-full flex items-center justify-center
                    opacity-50 hover:opacity-100 hover:bg-[var(--brand-200,#bfdbfe)]
                    transition-all ml-0.5"
                >
                  <FaXmark className="text-[9px]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual input */}
      <div>
        <div className="text-xs font-semibold text-[var(--surface-400)] uppercase tracking-wide mb-2">
          Add Custom
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-3.5 py-2.5 border-[1.5px] border-[var(--surface-200)]
              rounded-[0.625rem] text-sm bg-[var(--surface-50)]
              focus:outline-none focus:border-[var(--brand-500)] transition-colors text-[var(--surface-800)]"
            placeholder="e.g. Photography, Chess…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleInputAdd(); } }}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={handleInputAdd}
            disabled={!input.trim()}
          >
            <FaPlus className="text-xs" />
          </Button>
        </div>
      </div>

      {/* Quick pick */}
      <div>
        <div className="text-xs font-semibold text-[var(--surface-400)] uppercase tracking-wide mb-2">
          Quick Pick
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.keys(HOBBY_CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={[
                "px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all",
                activeCat === cat
                  ? "border-[var(--brand-500)] bg-[var(--brand-50,#eff6ff)] text-[var(--surface-700)]"
                  : "border-[var(--surface-200)] text-[var(--surface-500)] hover:border-[var(--surface-300)]",
              ].join(" ")}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Hobby chips */}
        <div className="flex flex-wrap gap-2">
          {HOBBY_CATEGORIES[activeCat].map((hobby) => {
            const added = addedNames.includes(hobby.toLowerCase());
            return (
              <button
                key={hobby}
                onClick={() => !added && addHobby(hobby)}
                className={[
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all",
                  added
                    ? "border-[var(--brand-400)] bg-[var(--brand-50,#eff6ff)] text-[var(--surface-700)] cursor-default"
                    : "border-[var(--surface-200)] bg-[var(--surface-50)] text-[var(--surface-500)] hover:border-[var(--brand-400)] hover:text-[var(--brand-600)]",
                ].join(" ")}
              >
                {added
                  ? <FaCheck className="text-[9px]" />
                  : <FaPlus className="text-[9px] opacity-50" />
                }
                {hobby}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default HobbiesForm;