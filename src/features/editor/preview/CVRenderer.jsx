import React, { useRef, useEffect, useState } from "react";
import { useCV } from "../../../context/CVContext";

const A4_W = 794;
const A4_H = 1123;
const SIDEBAR_W = 252;
const MAIN_W = A4_W - SIDEBAR_W;

const esc = (s) => {
  if (!s) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const ha = (hex, a) => {
  try {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  } catch { return hex; }
};

const dateBadge = (from, to, current, fs) => {
  if (!from && !to) return "";
  const end = current ? "Present" : esc(to);
  const label = from ? `${esc(from)} - ${end}` : end;
  return `<span style="display:inline-block;font-size:${fs*0.75}px;font-weight:500;color:#64748b;background:#f1f5f9;padding:2px 9px;border-radius:4px;white-space:nowrap;flex-shrink:0;">${label}</span>`;
};

const bullets = (text, pc) => {
  if (!text) return "";
  const color = pc || "#64748b";
  return text.split("\n").filter(l => l.trim())
    .map(l => {
      const clean = l.replace(/^\s*[-•*·>–—]\s*/, "").trim();
      if (!clean) return "";
      return `<div style="display:flex;align-items:flex-start;gap:7px;margin-bottom:4px;"><span style="width:6px;height:6px;border-radius:50%;background:${color};flex-shrink:0;margin-top:5px;opacity:0.7;"></span><span>${esc(clean)}</span></div>`;
    })
    .filter(Boolean)
    .join("");
};

const techChips = (stack, pc, fs) => {
  if (!stack) return "";
  return stack.split(",").map(t =>
    `<span style="display:inline-block;font-size:${fs*0.72}px;font-weight:600;padding:2px 7px;border-radius:3px;background:${ha(pc,0.08)};color:${pc};margin:2px 2px 0 0;">${esc(t.trim())}</span>`
  ).join("");
};

export const CV_FONTS = [
  { label: "Inter",            value: "Inter" },
  { label: "Lato",             value: "Lato" },
  { label: "Source Sans Pro",  value: "Source Sans 3" },
  { label: "Nunito Sans",      value: "Nunito Sans" },
  { label: "Raleway",          value: "Raleway" },
  { label: "Poppins",          value: "Poppins" },
  { label: "Merriweather",     value: "Merriweather" },
  { label: "Playfair Display", value: "Playfair Display" },
];

const GOOGLE_FONTS_URL =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Lato:wght@400;700&family=Source+Sans+3:wght@400;600;700&family=Nunito+Sans:wght@400;600;700;800&family=Raleway:wght@400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700;800&display=swap";

const globalCSS = (d) => {
  const { fontSize: fs, lineHeight: lh, fontFamily: ff, primaryColor: pc } = d;
  return `
*, *::before, *::after {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
  box-sizing: border-box;
  margin: 0; padding: 0;
}
@page :first { size: A4; margin: 0; }
@page { size: A4; margin: 0; }
html { background: #fff; }
body {
  font-family: '${ff}', 'Inter', 'Helvetica Neue', Arial, sans-serif;
  font-size: ${fs}px;
  line-height: ${lh};
  color: #1e293b;
  background: #fff;
  width: ${A4_W}px;
}
a { text-decoration: none; }

/* ── Single-column ── */
.no-break        { page-break-inside: avoid !important; break-inside: avoid !important; }
.section-block   { page-break-inside: avoid !important; break-inside: avoid !important; }
.break-after-avoid { page-break-after: avoid !important; break-after: avoid !important; }
.sc-sh, .sb-msh  { page-break-after: avoid !important; break-after: avoid !important; }
.db {
  display: inline-block;
  font-size: ${fs*0.74}px; font-weight: 500;
  color: #64748b; background: #f1f5f9;
  padding: 2px 8px; border-radius: 4px;
  white-space: nowrap; flex-shrink: 0;
}
.sc-header {
  background: ${pc};
  color: white;
  padding: 30px 36px 22px;
  width: ${A4_W}px;
  page-break-inside: avoid; break-inside: avoid;
  page-break-after: avoid; break-after: avoid;
}
.sc-content { padding: 18px 36px 28px; }
.sc-sh { padding-top: 16px; padding-bottom: 6px; }
.sc-sh.first { padding-top: 0; }
.sc-sh-inner { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
.sc-sh-icon  { font-size: ${fs*0.8}px; color: ${pc}; opacity: 0.7; }
.sc-sh-label { font-size: ${fs*0.69}px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${pc}; }
.sc-sh-line  { height: 1.5px; background: linear-gradient(to right, ${pc}, transparent); border-radius: 2px; opacity: 0.28; }

/* ── Sidebar layout: page-row approach ── */
/*
  The sidebar layout renders as a series of .sb-page-row divs, each exactly
  A4_H tall. Every row contains two fixed-height columns:
    .sb-col-left  (${SIDEBAR_W}px, colored background, clipped)
    .sb-col-right (${MAIN_W}px, white, shows the slice of main content)

  The main content is rendered once in a hidden off-screen div, then sliced
  per page via JavaScript after fonts load.
*/
.sb-page-row {
  display: flex;
  width: ${A4_W}px;
  height: ${A4_H}px;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
  position: relative;
}
.sb-page-row:last-child {
  page-break-after: auto;
  break-after: auto;
}
.sb-col-left {
  width: ${SIDEBAR_W}px;
  flex-shrink: 0;
  background: ${pc};
  color: white;
  overflow: hidden;
  position: relative;
}
.sb-col-right {
  width: ${MAIN_W}px;
  flex-shrink: 0;
  background: #fff;
  overflow: hidden;
  position: relative;
}
/* The actual content panes positioned via JS top offset */
.sb-left-inner {
  position: absolute;
  top: 0; left: 0;
  width: ${SIDEBAR_W}px;
  padding: 28px 20px 48px;
  box-sizing: border-box;
}
.sb-right-inner {
  position: absolute;
  top: 0; left: 0;
  width: ${MAIN_W}px;
  padding: 24px 26px 48px;
  box-sizing: border-box;
}
/* Sidebar sub-section headings */
.sb-ssh { margin-top: 18px; margin-bottom: 8px; }
.sb-ssh-row  { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.sb-ssh-icon { font-size: ${fs*0.7}px; color: rgba(255,255,255,0.5); }
.sb-ssh-label{ font-size: ${fs*0.67}px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: rgba(255,255,255,0.55); }
.sb-ssh-line { height: 1px; background: rgba(255,255,255,0.12); }
/* Main-column section headings */
.sb-msh { padding-top: 16px; padding-bottom: 6px; }
.sb-msh.first { padding-top: 0; }
.sb-msh-inner { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; }
.sb-msh-icon  { font-size: ${fs*0.8}px; color: ${pc}; opacity: 0.7; }
.sb-msh-label { font-size: ${fs*0.69}px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: ${pc}; }
.sb-msh-line  { height: 1.5px; background: linear-gradient(to right, ${pc}, transparent); opacity: 0.28; border-radius: 2px; }
.tl-dot { width: 9px; height: 9px; border-radius: 50%; background: ${pc}; box-shadow: 0 0 0 3px ${ha(pc,0.15)}; flex-shrink: 0; }
.tl-line { width: 1px; flex: 1; background: ${ha(pc,0.15)}; margin-top: 5px; }
.stag {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 4px; margin: 2px 2px 0 0;
  background: ${ha(pc,0.08)}; color: ${pc};
  font-size: ${fs*0.8}px; font-weight: 600;
  border: 1px solid ${ha(pc,0.18)};
}
/* Off-screen measurement containers */
#sb-measure-left, #sb-measure-right {
  position: absolute;
  top: -99999px;
  left: 0;
  visibility: hidden;
  pointer-events: none;
}
#sb-measure-left  { width: ${SIDEBAR_W}px; padding: 28px 20px 0; box-sizing: border-box; }
#sb-measure-right { width: ${MAIN_W}px;    padding: 24px 26px 0; box-sizing: border-box; }
`;
};

/* ── Section heading helpers ── */
const scSH = (title, icon, showIcons, isFirst) =>
  `<div class="sc-sh break-after-avoid${isFirst ? " first" : ""}">
    <div class="sc-sh-inner">
      ${showIcons ? `<i class="fas ${icon} sc-sh-icon"></i>` : ""}
      <span class="sc-sh-label">${title}</span>
    </div>
    <div class="sc-sh-line"></div>
  </div>`;

const sbSSH = (title, icon, showIcons) =>
  `<div class="sb-ssh">
    <div class="sb-ssh-row">
      ${showIcons ? `<i class="fas ${icon} sb-ssh-icon"></i>` : ""}
      <span class="sb-ssh-label">${title}</span>
    </div>
    <div class="sb-ssh-line"></div>
  </div>`;

const sbMSH = (title, icon, showIcons, isFirst) =>
  `<div class="sb-msh break-after-avoid${isFirst ? " first" : ""}">
    <div class="sb-msh-inner">
      ${showIcons ? `<i class="fas ${icon} sb-msh-icon"></i>` : ""}
      <span class="sb-msh-label">${title}</span>
    </div>
    <div class="sb-msh-line"></div>
  </div>`;

function wrapSection(name, html) {
  if (!html) return "";
  return `<div class="cv-section section-block" data-section="${name}">${html}</div>`;
}

/* ── Single-column renderers ── */
function rSummary(data, d, isFirst) {
  if (!data.personal?.summary) return "";
  const { fontSize: fs, primaryColor: pc } = d;
  return wrapSection("summary",
    scSH("Professional Summary","fa-align-left",d.showIcons,isFirst) +
    `<p style="color:#475569;font-size:${fs*0.88}px;line-height:1.65;padding:9px 11px;border-left:3px solid ${ha(pc,0.4)};background:${ha(pc,0.03)};border-radius:0 6px 6px 0;">${esc(data.personal.summary)}</p>`
  );
}

function rExperience(data, d, isFirst) {
  if (!data.experience?.length) return "";
  const { fontSize: fs, primaryColor: pc, sectionSpacing: ss } = d;
  const gap = Math.min(ss, 12);
  return wrapSection("experience",
    scSH("Work Experience","fa-briefcase",d.showIcons,isFirst) +
    data.experience.map((x,i) => `
<div class="no-break" style="margin-bottom:${gap}px;${i<data.experience.length-1?`padding-bottom:${gap}px;border-bottom:1px solid #f1f5f9;`:""}">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:4px;">
    <div>
      <div style="font-weight:700;font-size:${fs*0.95}px;color:#0f172a;">${esc(x.position)}</div>
      <div style="display:flex;align-items:center;gap:5px;margin-top:2px;flex-wrap:wrap;">
        <span style="color:${pc};font-weight:600;font-size:${fs*0.83}px;">${esc(x.company)}</span>
        ${x.city?`<span style="color:#94a3b8;font-size:${fs*0.78}px;">- ${esc(x.city)}</span>`:""}
        ${x.type?`<span style="font-size:${fs*0.7}px;color:#64748b;background:#f8fafc;border:1px solid #e2e8f0;padding:1px 6px;border-radius:20px;">${esc(x.type)}</span>`:""}
      </div>
    </div>
    ${dateBadge(x.startDate,x.endDate,x.current,fs)}
  </div>
  ${x.description?`<div style="color:#475569;margin-top:6px;font-size:${fs*0.83}px;line-height:1.6;">${bullets(x.description,pc)}</div>`:""}
</div>`).join("")
  );
}

function rEducation(data, d, isFirst) {
  if (!data.education?.length) return "";
  const { fontSize: fs, primaryColor: pc, sectionSpacing: ss } = d;
  const gap = Math.min(ss, 12);
  return wrapSection("education",
    scSH("Education","fa-graduation-cap",d.showIcons,isFirst) +
    data.education.map((x,i) => `
<div class="no-break" style="margin-bottom:${gap}px;${i<data.education.length-1?`padding-bottom:${gap}px;border-bottom:1px solid #f1f5f9;`:""}">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:4px;">
    <div>
      <div style="font-weight:700;font-size:${fs*0.95}px;color:#0f172a;">${esc(x.degree)}</div>
      <div style="color:${pc};font-weight:600;font-size:${fs*0.83}px;margin-top:2px;">${esc(x.school)}${x.city?` <span style="color:#94a3b8;font-weight:400;">- ${esc(x.city)}</span>`:""}</div>
    </div>
    ${dateBadge(x.startDate,x.endDate,x.current,fs)}
  </div>
  ${x.gpa?`<div style="color:#64748b;font-size:${fs*0.78}px;margin-top:3px;">GPA: <strong>${esc(x.gpa)}</strong></div>`:""}
  ${x.description?`<div style="color:#475569;margin-top:4px;font-size:${fs*0.85}px;line-height:1.6;">${esc(x.description)}</div>`:""}
</div>`).join("")
  );
}

function rSkills(data, d, isFirst) {
  if (!data.skills?.length) return "";
  const { fontSize: fs, primaryColor: pc } = d;
  const hasBars = data.skills.some(s => s.level);
  const tags = data.skills.map(s => `<span class="stag">${esc(s.name)}</span>`).join("");
  const bars = hasBars ? `
<div style="margin-top:10px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">
  ${data.skills.filter(s=>s.level).map(s=>`
  <div>
    <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
      <span style="font-size:${fs*0.8}px;font-weight:600;color:#334155;">${esc(s.name)}</span>
      <span style="font-size:${fs*0.72}px;color:#94a3b8;">${s.level}%</span>
    </div>
    <div style="height:4px;border-radius:99px;background:#e2e8f0;overflow:hidden;">
      <div style="width:${s.level}%;height:100%;border-radius:99px;background:linear-gradient(to right,${pc},${ha(pc,0.6)});"></div>
    </div>
  </div>`).join("")}
</div>` : "";
  return wrapSection("skills",
    scSH("Skills","fa-star",d.showIcons,isFirst) +
    `<div style="display:flex;flex-wrap:wrap;gap:5px;">${tags}</div>` + bars
  );
}

function rProjects(data, d, isFirst) {
  if (!data.projects?.length) return "";
  const { fontSize: fs, primaryColor: pc, sectionSpacing: ss } = d;
  const gap = Math.min(ss, 10);
  return wrapSection("projects",
    scSH("Projects","fa-code",d.showIcons,isFirst) +
    data.projects.map(p=>`
<div class="no-break" style="margin-bottom:${gap}px;padding:10px 12px;border:1px solid #e2e8f0;border-radius:7px;background:#fafafa;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:5px;">
    <div style="font-weight:700;font-size:${fs*0.93}px;color:#0f172a;">${esc(p.name)}</div>
    ${p.link?`<a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer" style="font-size:${fs*0.74}px;color:#3b82f6;border-bottom:1px solid #bfdbfe;">View</a>`:""}
  </div>
  ${p.techStack?`<div style="margin-top:5px;">${techChips(p.techStack,pc,fs)}</div>`:""}
  ${p.description?`<div style="color:#475569;margin-top:6px;font-size:${fs*0.83}px;line-height:1.6;">${bullets(p.description,pc)}</div>`:""}
</div>`).join("")
  );
}

function rCertifications(data, d, isFirst) {
  if (!data.certifications?.length) return "";
  const { fontSize: fs, primaryColor: pc } = d;
  return wrapSection("certifications",
    scSH("Certifications","fa-certificate",d.showIcons,isFirst) +
    data.certifications.map(c=>`
<div class="no-break" style="padding:8px 11px;margin-bottom:5px;border-left:3px solid ${ha(pc,0.4)};background:#fafafa;border-radius:0 6px 6px 0;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
    <div style="flex:1;min-width:0;">
      <div style="font-weight:700;font-size:${fs*0.88}px;color:#0f172a;">${esc(c.name)}</div>
      ${c.issuer?`<div style="color:#64748b;font-size:${fs*0.76}px;margin-top:2px;">${esc(c.issuer)}</div>`:""}
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
      ${c.date?`<span class="db">${esc(c.date)}</span>`:""}
      ${c.link?`<a href="${esc(c.link)}" target="_blank" rel="noopener noreferrer" style="font-size:${fs*0.7}px;font-weight:600;color:${pc};background:${ha(pc,0.08)};border:1px solid ${ha(pc,0.2)};padding:2px 7px;border-radius:4px;">Verify</a>`:""}
    </div>
  </div>
</div>`).join("")
  );
}

function rLanguages(data, d, isFirst) {
  if (!data.languages?.length) return "";
  const { fontSize: fs, primaryColor: pc } = d;
  return wrapSection("languages",
    scSH("Languages","fa-globe",d.showIcons,isFirst) +
    `<div style="display:flex;flex-wrap:wrap;gap:7px;">${data.languages.map(l=>`
<div style="padding:7px 12px;border-radius:7px;background:#fafafa;border:1px solid #e2e8f0;min-width:80px;text-align:center;">
  <div style="font-weight:700;font-size:${fs*0.86}px;color:#0f172a;">${esc(l.name)}</div>
  <div style="color:${pc};font-size:${fs*0.73}px;font-weight:500;margin-top:2px;">${esc(l.level)}</div>
</div>`).join("")}</div>`
  );
}

function rAwards(data, d, isFirst) {
  if (!data.awards?.length) return "";
  const { fontSize: fs, primaryColor: pc } = d;
  return wrapSection("awards",
    scSH("Awards & Achievements","fa-trophy",d.showIcons,isFirst) +
    data.awards.map(a=>`
<div class="no-break" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px;">
  <div style="width:26px;height:26px;border-radius:50%;flex-shrink:0;background:${ha(pc,0.1)};display:flex;align-items:center;justify-content:center;">
    <i class="fas fa-trophy" style="font-size:${fs*0.7}px;color:${pc};"></i>
  </div>
  <div>
    <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
      <span style="font-weight:700;font-size:${fs*0.88}px;color:#0f172a;">${esc(a.title)}</span>
      ${a.date?`<span style="font-size:${fs*0.73}px;color:#64748b;">${esc(a.date)}</span>`:""}
    </div>
    ${a.issuer?`<div style="color:#64748b;font-size:${fs*0.78}px;margin-top:1px;">${esc(a.issuer)}</div>`:""}
    ${a.description?`<div style="color:#475569;font-size:${fs*0.83}px;margin-top:2px;line-height:1.55;">${esc(a.description)}</div>`:""}
  </div>
</div>`).join("")
  );
}

function rHobbies(data, d, isFirst) {
  if (!data.hobbies?.length) return "";
  const { fontSize: fs } = d;
  return wrapSection("hobbies",
    scSH("Hobbies & Interests","fa-heart",d.showIcons,isFirst) +
    `<div style="display:flex;flex-wrap:wrap;gap:5px;">${data.hobbies.map(h=>
      `<span style="padding:3px 11px;border-radius:99px;background:#f1f5f9;color:#475569;font-size:${fs*0.8}px;font-weight:500;border:1px solid #e2e8f0;">${esc(h.name)}</span>`
    ).join("")}</div>`
  );
}

function rReferences(data, d, isFirst) {
  if (!data.references?.length) return "";
  const { fontSize: fs, primaryColor: pc } = d;
  return wrapSection("references",
    scSH("References","fa-users",d.showIcons,isFirst) +
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">${data.references.map(r=>`
<div class="no-break" style="padding:10px 12px;border-radius:7px;border:1px solid #e2e8f0;background:#fafafa;">
  <div style="font-weight:700;font-size:${fs*0.88}px;color:#0f172a;">${esc(r.name)}</div>
  ${r.position?`<div style="color:${pc};font-size:${fs*0.8}px;font-weight:500;margin-top:2px;">${esc(r.position)}${r.company?` - <span style="color:#64748b;font-weight:400;">${esc(r.company)}</span>`:""}</div>`:""}
  ${r.email?`<a href="mailto:${esc(r.email)}" target="_blank" rel="noopener noreferrer" style="display:block;color:#3b82f6;font-size:${fs*0.76}px;margin-top:4px;">${esc(r.email)}</a>`:""}
  ${r.phone?`<div style="color:#64748b;font-size:${fs*0.76}px;margin-top:2px;">${esc(r.phone)}</div>`:""}
</div>`).join("")}</div>`
  );
}

function rCustom(sec, data, d, isFirst) {
  const custom = data.customSections?.find(c=>c.id===sec);
  if (!custom?.entries?.length) return "";
  const { fontSize: fs, primaryColor: pc } = d;
  return wrapSection(sec,
    scSH(custom.name,"fa-folder",d.showIcons,isFirst) +
    custom.entries.map(entry=>`
<div class="no-break" style="margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid #f1f5f9;">
  <div style="font-weight:700;font-size:${fs*0.9}px;color:#0f172a;">${esc(entry.title)}</div>
  ${entry.subtitle?`<div style="color:${pc};font-size:${fs*0.8}px;font-weight:500;margin-top:2px;">${esc(entry.subtitle)}</div>`:""}
  ${entry.description?`<div style="color:#475569;font-size:${fs*0.85}px;margin-top:3px;line-height:1.6;">${esc(entry.description)}</div>`:""}
</div>`).join("")
  );
}

function renderSection(sec, data, d, isFirst) {
  switch(sec) {
    case "summary":        return rSummary(data, d, isFirst);
    case "experience":     return rExperience(data, d, isFirst);
    case "education":      return rEducation(data, d, isFirst);
    case "skills":         return rSkills(data, d, isFirst);
    case "projects":       return rProjects(data, d, isFirst);
    case "certifications": return rCertifications(data, d, isFirst);
    case "languages":      return rLanguages(data, d, isFirst);
    case "awards":         return rAwards(data, d, isFirst);
    case "hobbies":        return rHobbies(data, d, isFirst);
    case "references":     return rReferences(data, d, isFirst);
    default: return sec.startsWith("custom_") ? rCustom(sec,data,d,isFirst) : "";
  }
}

/* ── Single-column builder ── */
function buildSingleColumn(data, d) {
  const p = data.personal;
  const { fontSize: fs, primaryColor: pc, showIcons: ic } = d;
  const photoR = d.photoShape==="circle"?"50%":d.photoShape==="rounded"?"14px":"4px";

  const photo = d.showPhoto && p.photo
    ? `<div style="width:86px;height:86px;border-radius:${photoR};overflow:hidden;flex-shrink:0;border:3px solid rgba(255,255,255,0.3);box-shadow:0 4px 16px rgba(0,0,0,0.25);">
         <img src="${esc(p.photo)}" style="width:100%;height:100%;object-fit:cover;" alt="">
       </div>` : "";

  const chip = (icon, html) =>
    `<span style="display:inline-flex;align-items:center;gap:5px;font-size:${fs*0.78}px;opacity:0.92;">
       ${ic?`<i class="${icon}" style="font-size:${fs*0.72}px;opacity:0.7;"></i>`:""}${html}
     </span>`;

  const contacts = [
    p.email    && chip("fas fa-envelope",     `<a href="mailto:${esc(p.email)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">${esc(p.email)}</a>`),
    p.phone    && chip("fas fa-phone",        `<a href="tel:${esc(p.phone)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">${esc(p.phone)}</a>`),
    (p.city||p.country) && chip("fas fa-map-marker-alt", esc([p.city,p.country].filter(Boolean).join(", "))),
    p.linkedin && chip("fab fa-linkedin",     `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">LinkedIn</a>`),
    p.github   && chip("fab fa-github",       `<a href="${esc(p.github)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">GitHub</a>`),
    p.website  && chip("fas fa-globe",        `<a href="${esc(p.website)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">Portfolio</a>`),
  ].filter(Boolean).join(`<span style="color:rgba(255,255,255,0.3);">|</span>`);

  const enabled = data.sectionOrder.filter(s => data.enabledSections[s] && s !== "personal");
  let firstDone = false;
  const sectionsHTML = enabled.map(s => {
    const html = renderSection(s, data, d, !firstDone);
    if (html) firstDone = true;
    return html;
  }).filter(Boolean).join("");

  return `
<div id="cv-page-wrapper">
<div class="sc-header">
  <div style="display:flex;align-items:center;gap:22px;">
    ${photo}
    <div style="flex:1;min-width:0;">
      <div style="font-size:${fs*2.1}px;font-weight:800;letter-spacing:-0.8px;line-height:1.1;color:white;">${esc(p.firstName)} ${esc(p.lastName)}</div>
      ${p.title?`<div style="font-size:${fs*1.05}px;font-weight:400;opacity:0.82;margin-top:6px;">${esc(p.title)}</div>`:""}
    </div>
  </div>
  ${contacts?`<div style="display:flex;flex-wrap:wrap;gap:10px 18px;margin-top:18px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.15);">${contacts}</div>`:""}
</div>
<div class="sc-content">${sectionsHTML}</div>
</div>`;
}

/* ── Sidebar: raw HTML for left & right measurement panes ── */
function buildSidebarLeftHTML(data, d) {
  const p = data.personal;
  const { fontSize: fs, showIcons: ic } = d;
  const photoR = d.photoShape==="circle"?"50%":d.photoShape==="rounded"?"14px":"4px";

  const enabled = data.sectionOrder.filter(s => data.enabledSections[s]);
  const SIDE = ["skills","languages","hobbies","references"];
  const sideSecs = enabled.filter(s => SIDE.includes(s));

  const srow = (icon, html) =>
    `<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
       ${ic?`<i class="${icon}" style="font-size:${fs*0.72}px;color:rgba(255,255,255,0.8);margin-top:3px;flex-shrink:0;"></i>`:""}
       <span style="font-size:${fs*0.8}px;line-height:1.55;word-break:break-all;opacity:0.88;">${html}</span>
     </div>`;

  const contactRows = [
    p.email    && srow("fas fa-envelope",     `<a href="mailto:${esc(p.email)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">${esc(p.email)}</a>`),
    p.phone    && srow("fas fa-phone",        `<a href="tel:${esc(p.phone)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">${esc(p.phone)}</a>`),
    (p.city||p.country) && srow("fas fa-map-marker-alt", esc([p.city,p.country].filter(Boolean).join(", "))),
    p.website  && srow("fas fa-globe",        `<a href="${esc(p.website)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">Portfolio</a>`),
    p.linkedin && srow("fab fa-linkedin",     `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">LinkedIn</a>`),
    p.github   && srow("fab fa-github",       `<a href="${esc(p.github)}" target="_blank" rel="noopener noreferrer" style="color:inherit;">GitHub</a>`),
  ].filter(Boolean).join("");

  let sideHTML = "";
  sideSecs.forEach(sec => {
    if (sec==="skills" && data.skills?.length) {
      const hasBars = data.skills.some(s=>s.level);
      sideHTML += sbSSH("Skills","fa-star",ic);
      if (hasBars) {
        sideHTML += data.skills.filter(s=>s.level).map(s=>`
<div style="margin-bottom:9px;">
  <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
    <span style="font-size:${fs*0.82}px;font-weight:500;opacity:0.9;">${esc(s.name)}</span>
    <span style="font-size:${fs*0.72}px;opacity:0.45;">${s.level}%</span>
  </div>
  <div style="height:5px;border-radius:99px;background:rgba(255,255,255,0.15);overflow:hidden;">
    <div style="width:${s.level}%;height:100%;border-radius:99px;background:linear-gradient(to right,rgba(255,255,255,0.9),rgba(255,255,255,0.55));"></div>
  </div>
</div>`).join("");
      } else {
        sideHTML += `<div>${data.skills.map(s=>
          `<span style="display:inline-block;padding:4px 10px;margin:3px 3px 0 0;border-radius:5px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.15);font-size:${fs*0.78}px;font-weight:500;">${esc(s.name)}</span>`
        ).join("")}</div>`;
      }
    }
    if (sec==="languages" && data.languages?.length) {
      sideHTML += sbSSH("Languages","fa-globe",ic) +
        data.languages.map(l=>`
<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 10px;margin-bottom:6px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:7px;">
  <span style="font-weight:600;font-size:${fs*0.83}px;">${esc(l.name)}</span>
  <span style="font-size:${fs*0.72}px;opacity:0.6;background:rgba(255,255,255,0.1);padding:2px 9px;border-radius:99px;">${esc(l.level)}</span>
</div>`).join("");
    }
    if (sec==="hobbies" && data.hobbies?.length) {
      sideHTML += sbSSH("Interests","fa-heart",ic) +
        `<div>${data.hobbies.map(h=>
          `<span style="display:inline-block;padding:4px 11px;margin:3px 3px 0 0;border-radius:99px;background:rgba(255,255,255,0.09);border:1px solid rgba(255,255,255,0.12);font-size:${fs*0.78}px;color:rgba(255,255,255,0.82);">${esc(h.name)}</span>`
        ).join("")}</div>`;
    }
    if (sec==="references" && data.references?.length) {
      sideHTML += sbSSH("References","fa-users",ic) +
        data.references.map(r=>`
<div style="margin-bottom:10px;padding:11px 12px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:8px;">
  <div style="font-weight:700;font-size:${fs*0.88}px;">${esc(r.name)}</div>
  ${r.position?`<div style="opacity:0.65;font-size:${fs*0.78}px;margin-top:3px;">${esc(r.position)}${r.company?` - ${esc(r.company)}`:""}</div>`:""}
  ${r.email?`<a href="mailto:${esc(r.email)}" target="_blank" rel="noopener noreferrer" style="display:block;font-size:${fs*0.75}px;color:rgba(255,255,255,0.6);margin-top:5px;">${esc(r.email)}</a>`:""}
  ${r.phone?`<div style="opacity:0.55;font-size:${fs*0.75}px;margin-top:3px;">${esc(r.phone)}</div>`:""}
</div>`).join("");
    }
  });

  return `
    <div style="text-align:center;margin-bottom:22px;padding-bottom:22px;border-bottom:1px solid rgba(255,255,255,0.12);">
      ${d.showPhoto && p.photo?`
        <div style="width:96px;height:96px;border-radius:${photoR};overflow:hidden;margin:0 auto 14px;border:3px solid rgba(255,255,255,0.25);box-shadow:0 6px 24px rgba(0,0,0,0.3);">
          <img src="${esc(p.photo)}" style="width:100%;height:100%;object-fit:cover;" alt="">
        </div>`:""}
      <div style="font-size:${fs*1.3}px;font-weight:800;letter-spacing:-0.3px;line-height:1.3;word-break:break-word;">${esc(p.firstName)} ${esc(p.lastName)}</div>
      ${p.title?`<div style="display:inline-block;margin-top:8px;font-size:${fs*0.78}px;opacity:0.7;padding:3px 12px;background:rgba(255,255,255,0.1);border-radius:99px;border:1px solid rgba(255,255,255,0.15);">${esc(p.title)}</div>`:""}
    </div>
    <div>
      <div style="font-size:${fs*0.68}px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:rgba(255,255,255,0.45);margin-bottom:12px;">Contact</div>
      ${contactRows}
    </div>
    ${sideHTML}`;
}

function buildSidebarRightHTML(data, d) {
  const { fontSize: fs, primaryColor: pc, sectionSpacing: ss, showIcons: ic } = d;

  const enabled = data.sectionOrder.filter(s => data.enabledSections[s]);
  const SIDE = ["skills","languages","hobbies","references"];
  const mainSecs = enabled.filter(s => s !== "personal" && !SIDE.includes(s));

  let firstMain = false;
  return mainSecs.map(sec => {
    const isFirst = !firstMain;
    const msh = (title, icon) => { firstMain = true; return sbMSH(title, icon, ic, isFirst); };

    switch(sec) {
      case "summary":
        if (!data.personal?.summary) return "";
        return msh("Professional Summary","fa-align-left") +
          `<p style="color:#475569;font-size:${fs*0.9}px;line-height:1.75;padding:10px 12px;border-left:3px solid ${ha(pc,0.35)};background:${ha(pc,0.03)};border-radius:0 6px 6px 0;">${esc(data.personal.summary)}</p>`;
      case "experience":
        if (!data.experience?.length) return "";
        return msh("Work Experience","fa-briefcase") +
          data.experience.map((x,i)=>`
<div class="no-break" style="display:flex;gap:14px;margin-bottom:${ss}px;">
  <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;padding-top:4px;">
    <div class="tl-dot"></div>
    <div class="tl-line"></div>
  </div>
  <div style="flex:1;min-width:0;padding-bottom:${ss}px;${i<data.experience.length-1?`border-bottom:1px solid #f1f5f9;`:""}">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:4px;">
      <div>
        <div style="font-weight:700;font-size:${fs*0.97}px;color:#0f172a;">${esc(x.position)}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:3px;flex-wrap:wrap;">
          <span style="color:${pc};font-weight:600;font-size:${fs*0.83}px;">${esc(x.company)}</span>
          ${x.city?`<span style="color:#94a3b8;font-size:${fs*0.78}px;">- ${esc(x.city)}</span>`:""}
          ${x.type?`<span style="font-size:${fs*0.7}px;color:#64748b;background:#f1f5f9;border:1px solid #e2e8f0;padding:1px 7px;border-radius:99px;">${esc(x.type)}</span>`:""}
        </div>
      </div>
      ${dateBadge(x.startDate,x.endDate,x.current,fs)}
    </div>
    ${x.description?`<div style="color:#475569;margin-top:7px;font-size:${fs*0.85}px;line-height:1.65;">${bullets(x.description,pc)}</div>`:""}
  </div>
</div>`).join("");
      case "education":
        if (!data.education?.length) return "";
        return msh("Education","fa-graduation-cap") +
          data.education.map((x,i)=>`
<div class="no-break" style="margin-bottom:${ss}px;${i<data.education.length-1?`padding-bottom:${ss}px;border-bottom:1px solid #f1f5f9;`:""}">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:4px;">
    <div>
      <div style="font-weight:700;font-size:${fs*0.97}px;color:#0f172a;">${esc(x.degree)}</div>
      <div style="color:${pc};font-weight:600;font-size:${fs*0.83}px;margin-top:3px;">${esc(x.school)}${x.city?` <span style="color:#94a3b8;font-weight:400;">- ${esc(x.city)}</span>`:""}</div>
    </div>
    ${dateBadge(x.startDate,x.endDate,x.current,fs)}
  </div>
  ${x.gpa?`<div style="color:#64748b;font-size:${fs*0.8}px;margin-top:4px;">GPA: <strong>${esc(x.gpa)}</strong></div>`:""}
  ${x.description?`<div style="color:#475569;margin-top:5px;font-size:${fs*0.87}px;line-height:1.65;">${esc(x.description)}</div>`:""}
</div>`).join("");
      case "projects":
        if (!data.projects?.length) return "";
        return msh("Projects","fa-code") +
          data.projects.map(proj=>`
<div class="no-break" style="margin-bottom:${ss-2}px;padding:11px 13px;border:1px solid #e2e8f0;border-radius:8px;background:#fafafa;">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:6px;">
    <div style="font-weight:700;font-size:${fs*0.93}px;color:#0f172a;">${esc(proj.name)}</div>
    ${proj.link?`<a href="${esc(proj.link)}" target="_blank" rel="noopener noreferrer" style="font-size:${fs*0.76}px;color:#3b82f6;border-bottom:1px solid #bfdbfe;">View</a>`:""}
  </div>
  ${proj.techStack?`<div style="margin-top:6px;">${techChips(proj.techStack,pc,fs)}</div>`:""}
  ${proj.description?`<div style="color:#475569;margin-top:7px;font-size:${fs*0.85}px;line-height:1.65;">${bullets(proj.description,pc)}</div>`:""}
</div>`).join("");
      case "certifications":
        if (!data.certifications?.length) return "";
        return msh("Certifications","fa-certificate") +
          data.certifications.map(c=>`
<div class="no-break" style="padding:9px 12px;margin-bottom:6px;border-left:3px solid ${ha(pc,0.4)};background:#fafafa;border-radius:0 6px 6px 0;">
  <div style="display:flex;justify-content:space-between;gap:8px;">
    <div>
      <div style="font-weight:700;font-size:${fs*0.88}px;color:#0f172a;">${esc(c.name)}</div>
      ${c.issuer?`<div style="color:#64748b;font-size:${fs*0.78}px;margin-top:2px;">${esc(c.issuer)}</div>`:""}
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">
      ${c.date?`<span class="db">${esc(c.date)}</span>`:""}
      ${c.link?`<a href="${esc(c.link)}" target="_blank" rel="noopener noreferrer" style="font-size:${fs*0.72}px;font-weight:600;color:${pc};background:${ha(pc,0.08)};border:1px solid ${ha(pc,0.2)};padding:2px 8px;border-radius:4px;">Verify</a>`:""}
    </div>
  </div>
</div>`).join("");
      case "awards":
        if (!data.awards?.length) return "";
        return msh("Awards","fa-trophy") +
          data.awards.map(a=>`
<div class="no-break" style="display:flex;gap:12px;margin-bottom:10px;">
  <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:${ha(pc,0.1)};display:flex;align-items:center;justify-content:center;">
    <i class="fas fa-trophy" style="font-size:${fs*0.7}px;color:${pc};"></i>
  </div>
  <div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <span style="font-weight:700;font-size:${fs*0.88}px;color:#0f172a;">${esc(a.title)}</span>
      ${a.date?`<span style="font-size:${fs*0.73}px;color:#64748b;">${esc(a.date)}</span>`:""}
    </div>
    ${a.issuer?`<div style="color:#64748b;font-size:${fs*0.78}px;margin-top:2px;">${esc(a.issuer)}</div>`:""}
    ${a.description?`<div style="color:#475569;font-size:${fs*0.83}px;margin-top:3px;line-height:1.6;">${esc(a.description)}</div>`:""}
  </div>
</div>`).join("");
      default:
        return sec.startsWith("custom_") ? rCustom(sec,data,d,isFirst) : "";
    }
  }).filter(Boolean).join("");
}

/* ── Sidebar assembled HTML ── */
function buildSidebar(data, d) {
  const leftHTML  = buildSidebarLeftHTML(data, d);
  const rightHTML = buildSidebarRightHTML(data, d);

  /*
   * Strategy: render left+right in hidden off-screen divs, measure their
   * scrollHeight, then slice both into per-page rows via absolute positioning.
   * Each .sb-page-row is exactly A4_H tall with overflow:hidden.
   * The JS paginator runs once after fonts load, and again on cv-repaginate message.
   */
  return `
<div id="sb-measure-left"  class="sb-left-inner">${leftHTML}</div>
<div id="sb-measure-right" class="sb-right-inner">${rightHTML}</div>
<div id="sb-pages"></div>`;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Paginator script — runs inside the iframe
   Slices left+right columns into A4-height rows.
   Called once on load and again whenever cv-repaginate is posted.
───────────────────────────────────────────────────────────────────────────── */
const PAGINATOR_SCRIPT = `
<script>
(function(){
  var PAGE_H   = ${A4_H};
  var LEFT_PAD_TOP  = 28;   // matches .sb-left-inner padding-top
  var RIGHT_PAD_TOP = 24;   // matches .sb-right-inner padding-top

  function paginate() {
    var ml = document.getElementById('sb-measure-left');
    var mr = document.getElementById('sb-measure-right');
    var container = document.getElementById('sb-pages');
    if (!ml || !mr || !container) return;

    var leftH  = ml.scrollHeight  + LEFT_PAD_TOP;
    var rightH = mr.scrollHeight + RIGHT_PAD_TOP;
    var totalH = Math.max(leftH, rightH, PAGE_H);
    var numPages = Math.ceil(totalH / PAGE_H);

    var rows = '';
    for (var i = 0; i < numPages; i++) {
      var offset = i * PAGE_H;
      rows += '<div class="sb-page-row">' +
        '<div class="sb-col-left">' +
          '<div class="sb-left-inner" style="top:-' + offset + 'px;">' +
            ml.innerHTML +
          '</div>' +
        '</div>' +
        '<div class="sb-col-right">' +
          '<div class="sb-right-inner" style="top:-' + offset + 'px;">' +
            mr.innerHTML +
          '</div>' +
        '</div>' +
      '</div>';
    }
    container.innerHTML = rows;

    // Report height to parent
    setTimeout(function(){
      var h = container.scrollHeight;
      window.parent.postMessage({ type: 'cv-height', height: h }, '*');
    }, 50);
  }

  // Run after fonts load
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function(){ setTimeout(paginate, 100); });
  } else {
    window.addEventListener('load', function(){ setTimeout(paginate, 200); });
  }

  // Re-run when parent asks (after CV data change)
  window.addEventListener('message', function(e){
    if (e.data && e.data.type === 'cv-repaginate') paginate();
  });

  // Also expose globally
  window.__sbPaginate = paginate;

  // Link intercept
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    e.stopPropagation();
    window.parent.postMessage({ type: 'cv-open-link', href: href }, '*');
  }, true);
})();
<\/script>`;

/* ── Non-sidebar LINK_INTERCEPT_SCRIPT (no paginator) ── */
const LINK_INTERCEPT_SCRIPT = `
<script>
(function() {
  function report() {
    window.parent.postMessage({ type: 'cv-height', height: document.body.scrollHeight }, '*');
  }
  if (document.readyState === 'complete') { setTimeout(report, 400); }
  else { window.addEventListener('load', function(){ setTimeout(report, 400); }); }
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    e.preventDefault();
    e.stopPropagation();
    window.parent.postMessage({ type: 'cv-open-link', href: href }, '*');
  }, true);
})();
<\/script>`;

function buildBodyHTML(cvData) {
  const d = cvData.design;
  return d.layout === "sidebar" ? buildSidebar(cvData, d) : buildSingleColumn(cvData, d);
}

function buildPreviewHTML(cvData) {
  const d = cvData.design;
  const bodyContent = buildBodyHTML(cvData);
  const css = globalCSS(d);
  const isSidebar = d.layout === "sidebar";
  const script = isSidebar ? PAGINATOR_SCRIPT : LINK_INTERCEPT_SCRIPT;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${GOOGLE_FONTS_URL}">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
${css}
* { page-break-before: auto !important; break-before: auto !important; }
.sb-page-row { page-break-after: always !important; break-after: page !important; }
.sb-page-row:last-child { page-break-after: auto !important; break-after: auto !important; }
a { cursor: pointer; }
</style>
</head>
<body>${bodyContent}${script}</body>
</html>`;
}

export function renderCVHTML(cvData, fileName) {
  const d = cvData.design;
  const css = globalCSS(d);
  const isSidebar = d.layout === "sidebar";
  const bodyContent = buildBodyHTML(cvData);
  const title = fileName || [cvData.personal?.firstName, cvData.personal?.lastName].filter(Boolean).join(" ") || "CV";

  // For PDF export we include the paginator so wkhtmltopdf / puppeteer can run it
  const script = isSidebar ? PAGINATOR_SCRIPT : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${GOOGLE_FONTS_URL}">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<style>
${css}
.sb-page-row { page-break-after: always !important; break-after: page !important; }
.sb-page-row:last-child { page-break-after: auto !important; break-after: auto !important; }
</style>
</head>
<body>${bodyContent}${script}</body>
</html>`;
}

export function CVPreview({ snapshot }) {
  const { cvData: liveCvData } = useCV();
  const cvData = snapshot || liveCvData;

  const iframeRef      = useRef(null);
  const lastHeightRef  = useRef(A4_H);
  const initializedRef = useRef(false);
  const [iframeHeight, setIframeHeight] = useState(A4_H);

  // Messages from iframe
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "cv-height" && typeof e.data.height === "number") {
        const h = Math.max(e.data.height + 40, A4_H);
        lastHeightRef.current = h;
        setIframeHeight(h);
      }
      if (e.data?.type === "cv-open-link" && e.data.href) {
        window.open(e.data.href, "_blank", "noopener,noreferrer");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // First load
  const initialHTML = React.useMemo(() => buildPreviewHTML(cvData), []); // eslint-disable-line react-hooks/exhaustive-deps

  // Live patch on cvData change
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const patch = () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc || !doc.body) return;

        if (!initializedRef.current) {
          initializedRef.current = true;
          return;
        }

        const isSidebar = cvData.design.layout === "sidebar";

        // Update CSS
        const styleEl = doc.head && doc.head.querySelector("style");
        if (styleEl) {
          styleEl.textContent = globalCSS(cvData.design) +
            "\n* { page-break-before: auto !important; break-before: auto !important; }" +
            "\n.sb-page-row { page-break-after: always !important; break-after: page !important; }" +
            "\n.sb-page-row:last-child { page-break-after: auto !important; break-after: auto !important; }" +
            "\na { cursor: pointer; }";
        }

        // Update body content
        doc.body.innerHTML = buildBodyHTML(cvData);

        if (isSidebar) {
          // Re-inject paginator + link intercept
          const s = doc.createElement("script");
          s.textContent = `
(function(){
  var PAGE_H = ${A4_H};
  function paginate() {
    var ml = document.getElementById('sb-measure-left');
    var mr = document.getElementById('sb-measure-right');
    var container = document.getElementById('sb-pages');
    if (!ml || !mr || !container) return;
    var leftH  = ml.scrollHeight  + 28;
    var rightH = mr.scrollHeight + 24;
    var totalH = Math.max(leftH, rightH, PAGE_H);
    var numPages = Math.ceil(totalH / PAGE_H);
    var rows = '';
    for (var i = 0; i < numPages; i++) {
      var offset = i * PAGE_H;
      rows += '<div class="sb-page-row">' +
        '<div class="sb-col-left"><div class="sb-left-inner" style="top:-' + offset + 'px;">' + ml.innerHTML + '</div></div>' +
        '<div class="sb-col-right"><div class="sb-right-inner" style="top:-' + offset + 'px;">' + mr.innerHTML + '</div></div>' +
      '</div>';
    }
    container.innerHTML = rows;
    setTimeout(function(){
      var h = container.scrollHeight;
      window.parent.postMessage({ type: 'cv-height', height: h }, '*');
    }, 50);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function(){ setTimeout(paginate, 100); });
  } else {
    setTimeout(paginate, 200);
  }
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a'); if (!a) return;
    var href = a.getAttribute('href'); if (!href) return;
    e.preventDefault(); e.stopPropagation();
    window.parent.postMessage({ type: 'cv-open-link', href: href }, '*');
  }, true);
})();`;
          doc.body.appendChild(s);
        } else {
          // Non-sidebar: simple height report + link intercept
          const s = doc.createElement("script");
          s.textContent = `
            setTimeout(function(){
              window.parent.postMessage({ type: 'cv-height', height: document.body.scrollHeight }, '*');
            }, 200);
            document.addEventListener('click', function(e) {
              var a = e.target.closest('a'); if (!a) return;
              var href = a.getAttribute('href'); if (!href) return;
              e.preventDefault(); e.stopPropagation();
              window.parent.postMessage({ type: 'cv-open-link', href: href }, '*');
            }, true);
          `;
          doc.body.appendChild(s);
        }
      } catch {
        // cross-origin guard
      }
    };

    const raf = requestAnimationFrame(patch);
    return () => cancelAnimationFrame(raf);
  }, [cvData]);

  return (
    <div style={{ width: A4_W, background: "#fff", overflow: "hidden" }}>
      <iframe
        ref={iframeRef}
        srcDoc={initialHTML}
        style={{
          width: A4_W,
          height: iframeHeight,
          border: "none",
          display: "block",
          overflow: "hidden",
        }}
        title="CV Preview"
        sandbox="allow-same-origin allow-scripts"
        scrolling="no"
      />
    </div>
  );
}