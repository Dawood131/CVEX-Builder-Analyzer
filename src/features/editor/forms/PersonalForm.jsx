import React, { useRef, useState } from "react";
import { useCV } from "../../../context/CVContext";
import { FormField } from "../../../shared/ui/UIComponents";
import {
  FaUpload, FaTrash, FaUser, FaEnvelope, FaPhone,
  FaLocationDot, FaGlobe, FaLinkedin, FaGithub,
  FaIdCard, FaCheck, FaCamera,
} from "react-icons/fa6";

function countFilled(...vals) {
  return vals.filter((v) => v && String(v).trim()).length;
}

// ─── Inline status pill ───────────────────────────────────────────
function StatusPill({ filled, total }) {
  const done = filled === total;
  return (
    <span className={[
      "text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide",
      done
        ? "bg-emerald-100 text-emerald-600"
        : filled > 0
        ? "bg-[var(--brand-100,#dbeafe)] text-[var(--brand-600)]"
        : "bg-[var(--surface-100)] text-[var(--surface-400)]",
    ].join(" ")}>
      {done ? "✓ Complete" : `${filled} / ${total}`}
    </span>
  );
}

// ─── Collapsible section ──────────────────────────────────────────
function Section({ icon: Icon, title, pill, children }) {
  return (
    <div className="group">
      {/* Section label row */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded-md bg-[var(--brand-500)] flex items-center justify-center flex-shrink-0">
          <Icon className="text-[8px] text-white" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[var(--surface-500)]">
          {title}
        </span>
        <div className="flex-1 h-px bg-[var(--surface-150,#f1f5f9)]" />
        {pill}
      </div>
      <div className="space-y-2.5 pl-0">{children}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
function PersonalForm() {
  const { cvData, dispatch, showToast } = useCV();
  const p = cvData.personal;
  const u = (field, val) => dispatch({ type: "UPDATE_PERSONAL", payload: { [field]: val } });

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = (file) => {
    if (!file?.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) { showToast("Photo must be under 2MB", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => u("photo", ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    /* Scrollable container */
   <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-180px)] pr-1 pb-4 scrollbar-hide">

      {/* ── PHOTO ── */}
      <Section
        icon={FaCamera}
        title="Photo"
        pill={<StatusPill filled={p.photo ? 1 : 0} total={1} />}
      >
        <input type="file" accept="image/*" ref={fileInputRef}
          onChange={(e) => processFile(e.target.files[0])} className="hidden" />

        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
          onClick={() => !p.photo && fileInputRef.current?.click()}
          className={[
            "flex items-center gap-4 p-3 rounded-xl border-[1.5px] transition-all",
            dragOver
              ? "border-[var(--brand-400)] bg-[var(--brand-50,#eff6ff)]"
              : p.photo
              ? "border-[var(--surface-300)] bg-[var(--surface-50)] "
              : "border-dashed border-[var(--surface-400)] hover:border-[var(--brand-300)] hover:bg-[var(--surface-50)] cursor-pointer",
          ].join(" ")}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--surface-100)] border border-[var(--surface-200)] flex items-center justify-center shadow-sm">
              {p.photo
                ? <img src={p.photo} className="w-full h-full object-cover" alt="Profile" />
                : <FaUser className="text-[var(--surface-300)] text-2xl" />
              }
            </div>
            {p.photo && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border border-white">
                <FaCheck className="text-[6px] text-white" />
              </div>
            )}
          </div>

          {/* Info + actions */}
          <div className="flex-1 min-w-0">
            {p.photo ? (
              <>
                <p className="text-xs font-semibold text-emerald-600 mb-1">Photo uploaded</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--brand-500)] text-white text-[11px] font-semibold hover:bg-[var(--brand-600)] transition-colors"
                  >
                    <FaUpload className="text-[8px]" /> Change
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); u("photo", ""); }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-[var(--surface-200)] text-red-400 text-[11px] font-semibold hover:bg-red-50 hover:border-red-200 transition-colors"
                  >
                    <FaTrash className="text-[8px]" /> Remove
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-semibold text-[var(--surface-600)] mb-0.5">
                  {dragOver ? "Release to upload" : "Upload photo"}
                </p>
                <p className="text-[10px] text-[var(--surface-400)] mb-2">
                  Drag & drop or click · JPG / PNG · max 2MB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--brand-500)] text-white text-[11px] font-semibold hover:bg-[var(--brand-600)] transition-colors"
                >
                  <FaUpload className="text-[8px]" /> Upload
                </button>
              </>
            )}
          </div>
        </div>
      </Section>

      {/* ── BASIC INFO ── */}
      <Section
        icon={FaIdCard}
        title="Basic Info"
        pill={<StatusPill filled={countFilled(p.firstName, p.lastName, p.title)} total={3} />}
      >
        <div className="flex gap-2.5">
          <FormField label="First Name" value={p.firstName} onChange={(v) => u("firstName", v)} required placeholder="John" half />
          <FormField label="Last Name"  value={p.lastName}  onChange={(v) => u("lastName",  v)} required placeholder="Doe"  half />
        </div>
        <FormField
          label="Job Title"
          value={p.title}
          onChange={(v) => u("title", v)}
          required
          placeholder="e.g. Senior Software Engineer"
        />
      </Section>

      {/* ── CONTACT ── */}
      <Section
        icon={FaEnvelope}
        title="Contact"
        pill={<StatusPill filled={countFilled(p.email, p.phone)} total={2} />}
      >
        <FormField label="Email" type="email" value={p.email} onChange={(v) => u("email", v)} required placeholder="john@example.com" />
        <FormField label="Phone" type="tel"   value={p.phone} onChange={(v) => u("phone", v)} placeholder="+1 (555) 123-4567" />
      </Section>

      {/* ── LOCATION ── */}
      <Section
        icon={FaLocationDot}
        title="Location"
        pill={<StatusPill filled={countFilled(p.city, p.country, p.address)} total={3} />}
      >
        <div className="flex gap-2.5">
          <FormField label="City"    value={p.city}    onChange={(v) => u("city",    v)} placeholder="New York" half />
          <FormField label="Country" value={p.country} onChange={(v) => u("country", v)} placeholder="USA"      half />
        </div>
        <FormField label="Address" value={p.address} onChange={(v) => u("address", v)} placeholder="123 Main St (optional)" />
      </Section>

      {/* ── ONLINE ── */}
      <Section
        icon={FaGlobe}
        title="Online Presence"
        pill={<StatusPill filled={countFilled(p.website, p.linkedin, p.github)} total={3} />}
      >
        <FormField label="Portfolio / Website" type="url" value={p.website}  onChange={(v) => u("website",  v)} placeholder="https://johndoe.com" />
        <FormField label="LinkedIn URL"         type="url" value={p.linkedin} onChange={(v) => u("linkedin", v)} placeholder="https://linkedin.com/in/johndoe" />
        <FormField label="GitHub URL"           type="url" value={p.github}   onChange={(v) => u("github",   v)} placeholder="https://github.com/johndoe" />
      </Section>

    </div>
  );
}

export default PersonalForm;