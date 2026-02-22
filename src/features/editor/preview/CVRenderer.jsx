// /* ================================================
//    CV Render Engine — Generates CV HTML for preview & export
//    Two layouts: Single Column + Sidebar
//    NOTE: This file intentionally uses HTML string concatenation
//    for the CV output, as it must produce raw HTML for both the
//    live preview (dangerouslySetInnerHTML) and PDF export.
//    The React component wrapper uses proper JSX.
//    ================================================ */

// /** Main entry point: returns CV HTML string based on template layout */
// function renderCVHTML(cvData) {
//   if (!cvData) return '';
//   const d = cvData.design;
//   const tpl = getTemplateById(d.template);
//   if (tpl && tpl.layout === 'sidebar') return renderSidebarCV(cvData, d);
//   return renderSingleColumnCV(cvData, d);
// }

// // ---- Section Header (inline style for PDF fidelity) ----
// function sectionHeaderHTML(title, icon, d) {
//   return '<div style="margin-bottom:' + d.sectionSpacing + 'px;margin-top:' + (d.sectionSpacing + 4) + 'px;">' +
//     '<div style="font-size:' + (d.fontSize * 1.05) + 'px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:' + d.primaryColor + ';margin-bottom:6px;display:flex;align-items:center;gap:8px;">' +
//     (d.showIcons ? '<i class="fas ' + icon + '" style="font-size:' + (d.fontSize * 0.9) + 'px;"></i>' : '') + title + '</div>' +
//     '<div style="height:2px;background:' + d.primaryColor + ';opacity:0.2;border-radius:1px;"></div></div>';
// }

// // ---- Render individual sections ----
// function renderSection(sec, data, d) {
//   const e = escHtml;
//   const pc = d.primaryColor;
//   const fs = d.fontSize;
//   const ss = d.sectionSpacing;
//   const ic = d.showIcons;

//   switch (sec) {
//     case 'summary':
//       if (!data.personal.summary) return '';
//       return sectionHeaderHTML('Professional Summary', 'fa-align-left', d) +
//         '<p style="color:#475569;font-size:' + (fs * 0.95) + 'px;line-height:' + (d.lineHeight + 0.1) + ';">' + e(data.personal.summary) + '</p>';

//     case 'experience':
//       if (!data.experience.length) return '';
//       return sectionHeaderHTML('Work Experience', 'fa-briefcase', d) +
//         data.experience.map(exp =>
//           '<div style="margin-bottom:' + (ss - 2) + 'px;">' +
//           '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;">' +
//           '<div><div style="font-weight:700;font-size:' + fs + 'px;">' + e(exp.position) + '</div>' +
//           '<div style="color:' + pc + ';font-weight:600;font-size:' + (fs * 0.9) + 'px;">' + e(exp.company) + (exp.city ? ' — ' + e(exp.city) : '') + '</div></div>' +
//           '<div style="color:#64748b;font-size:' + (fs * 0.85) + 'px;font-weight:500;">' + e(exp.startDate) + (exp.startDate ? ' — ' : '') + (exp.current ? 'Present' : e(exp.endDate)) + '</div></div>' +
//           (exp.description ? '<div style="color:#475569;margin-top:6px;font-size:' + (fs * 0.9) + 'px;white-space:pre-line;">' + e(exp.description) + '</div>' : '') + '</div>'
//         ).join('');

//     case 'education':
//       if (!data.education.length) return '';
//       return sectionHeaderHTML('Education', 'fa-graduation-cap', d) +
//         data.education.map(edu =>
//           '<div style="margin-bottom:' + (ss - 2) + 'px;">' +
//           '<div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;">' +
//           '<div><div style="font-weight:700;font-size:' + fs + 'px;">' + e(edu.degree) + '</div>' +
//           '<div style="color:' + pc + ';font-weight:600;font-size:' + (fs * 0.9) + 'px;">' + e(edu.school) + (edu.city ? ' — ' + e(edu.city) : '') + '</div></div>' +
//           '<div style="color:#64748b;font-size:' + (fs * 0.85) + 'px;font-weight:500;">' + e(edu.startDate) + (edu.startDate ? ' — ' : '') + e(edu.endDate) + '</div></div>' +
//           (edu.gpa ? '<div style="color:#64748b;font-size:' + (fs * 0.85) + 'px;margin-top:2px;">GPA: ' + e(edu.gpa) + '</div>' : '') +
//           (edu.description ? '<div style="color:#475569;margin-top:4px;font-size:' + (fs * 0.9) + 'px;">' + e(edu.description) + '</div>' : '') + '</div>'
//         ).join('');

//     case 'skills':
//       if (!data.skills.length) return '';
//       return sectionHeaderHTML('Skills', 'fa-star', d) +
//         '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
//         data.skills.map(s => '<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:6px;background:' + pc + '15;color:' + pc + ';font-size:' + (fs * 0.85) + 'px;font-weight:600;">' + e(s.name) + '</span>').join('') + '</div>' +
//         (data.skills.some(s => s.level) ? '<div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;">' +
//         data.skills.filter(s => s.level).map(s =>
//           '<div style="display:flex;align-items:center;gap:8px;"><span style="font-size:' + (fs * 0.85) + 'px;font-weight:500;min-width:80px;">' + e(s.name) + '</span>' +
//           '<div style="flex:1;height:6px;border-radius:3px;background:#e2e8f0;overflow:hidden;"><div style="width:' + s.level + '%;height:100%;border-radius:3px;background:' + pc + ';"></div></div></div>'
//         ).join('') + '</div>' : '');

//     case 'projects':
//       if (!data.projects.length) return '';
//       return sectionHeaderHTML('Projects', 'fa-code', d) +
//         data.projects.map(p =>
//           '<div style="margin-bottom:' + (ss - 2) + 'px;"><div style="font-weight:700;font-size:' + fs + 'px;">' + e(p.name) + '</div>' +
//           (p.techStack ? '<div style="color:' + pc + ';font-size:' + (fs * 0.85) + 'px;font-weight:500;">' + e(p.techStack) + '</div>' : '') +
//           (p.description ? '<div style="color:#475569;margin-top:4px;font-size:' + (fs * 0.9) + 'px;">' + e(p.description) + '</div>' : '') +
//           (p.link ? '<div style="font-size:' + (fs * 0.8) + 'px;color:#64748b;margin-top:2px;">' + (ic ? '<i class="fas fa-link" style="margin-right:3px;"></i>' : '') + e(p.link) + '</div>' : '') + '</div>'
//         ).join('');

//     case 'certifications':
//       if (!data.certifications.length) return '';
//       return sectionHeaderHTML('Certifications', 'fa-certificate', d) +
//         data.certifications.map(c =>
//           '<div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;">' +
//           '<div><div style="font-weight:700;font-size:' + (fs * 0.95) + 'px;">' + e(c.name) + '</div>' +
//           (c.issuer ? '<div style="color:#64748b;font-size:' + (fs * 0.85) + 'px;">' + e(c.issuer) + '</div>' : '') + '</div>' +
//           (c.date ? '<div style="color:#64748b;font-size:' + (fs * 0.85) + 'px;font-weight:500;white-space:nowrap;">' + e(c.date) + '</div>' : '') + '</div>'
//         ).join('');

//     case 'languages':
//       if (!data.languages.length) return '';
//       return sectionHeaderHTML('Languages', 'fa-globe', d) +
//         '<div style="display:flex;flex-wrap:wrap;gap:12px;">' +
//         data.languages.map(l =>
//           '<div style="padding:6px 14px;border-radius:8px;background:' + pc + '10;border:1px solid ' + pc + '30;"><div style="font-weight:600;font-size:' + (fs * 0.9) + 'px;">' + e(l.name) + '</div>' +
//           '<div style="color:#64748b;font-size:' + (fs * 0.8) + 'px;">' + e(l.level) + '</div></div>'
//         ).join('') + '</div>';

//     case 'awards':
//       if (!data.awards.length) return '';
//       return sectionHeaderHTML('Awards & Achievements', 'fa-trophy', d) +
//         data.awards.map(a =>
//           '<div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;">' +
//           '<div style="font-weight:700;font-size:' + (fs * 0.95) + 'px;">' + e(a.title) + '</div>' +
//           (a.date ? '<div style="color:#64748b;font-size:' + (fs * 0.85) + 'px;">' + e(a.date) + '</div>' : '') + '</div>' +
//           (a.issuer ? '<div style="color:#64748b;font-size:' + (fs * 0.85) + 'px;">' + e(a.issuer) + '</div>' : '') +
//           (a.description ? '<div style="color:#475569;font-size:' + (fs * 0.9) + 'px;margin-top:2px;">' + e(a.description) + '</div>' : '') + '</div>'
//         ).join('');

//     case 'hobbies':
//       if (!data.hobbies.length) return '';
//       return sectionHeaderHTML('Hobbies & Interests', 'fa-heart', d) +
//         '<div style="display:flex;flex-wrap:wrap;gap:6px;">' +
//         data.hobbies.map(h => '<span style="padding:4px 12px;border-radius:20px;background:' + pc + '10;color:' + pc + ';font-size:' + (fs * 0.85) + 'px;font-weight:500;">' + e(h.name) + '</span>').join('') + '</div>';

//     case 'references':
//       if (!data.references.length) return '';
//       return sectionHeaderHTML('References', 'fa-users', d) +
//         '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">' +
//         data.references.map(r =>
//           '<div style="padding:10px;border-radius:8px;border:1px solid #e2e8f0;">' +
//           '<div style="font-weight:700;font-size:' + (fs * 0.95) + 'px;">' + e(r.name) + '</div>' +
//           (r.position ? '<div style="color:' + pc + ';font-size:' + (fs * 0.85) + 'px;font-weight:500;">' + e(r.position) + (r.company ? ' at ' + e(r.company) : '') + '</div>' : '') +
//           (r.email ? '<div style="color:#64748b;font-size:' + (fs * 0.8) + 'px;margin-top:3px;">' + e(r.email) + '</div>' : '') +
//           (r.phone ? '<div style="color:#64748b;font-size:' + (fs * 0.8) + 'px;">' + e(r.phone) + '</div>' : '') + '</div>'
//         ).join('') + '</div>';

//     default:
//       if (sec.startsWith('custom_')) {
//         const custom = data.customSections.find(c => c.id === sec);
//         if (!custom || !custom.entries?.length) return '';
//         return sectionHeaderHTML(custom.name, 'fa-folder', d) +
//           custom.entries.map(entry =>
//             '<div style="margin-bottom:8px;"><div style="font-weight:700;font-size:' + (fs * 0.95) + 'px;">' + e(entry.title) + '</div>' +
//             (entry.subtitle ? '<div style="color:' + pc + ';font-size:' + (fs * 0.85) + 'px;font-weight:500;">' + e(entry.subtitle) + '</div>' : '') +
//             (entry.description ? '<div style="color:#475569;font-size:' + (fs * 0.9) + 'px;margin-top:3px;">' + e(entry.description) + '</div>' : '') + '</div>'
//           ).join('');
//       }
//       return '';
//   }
// }

// // ---- Single Column Layout ----
// function renderSingleColumnCV(data, d) {
//   const p = data.personal;
//   const photoShape = d.photoShape === 'circle' ? '50%' : d.photoShape === 'rounded' ? '12px' : '4px';
//   const enabled = data.sectionOrder.filter(s => data.enabledSections[s]);
//   const e = escHtml;
//   const ic = d.showIcons;

//   let html = '<div style="font-family:\'' + d.fontFamily + '\',sans-serif;font-size:' + d.fontSize + 'px;line-height:' + d.lineHeight + ';color:#1e293b;padding:0;">';
//   // Header
//   html += '<div style="background:' + d.primaryColor + ';color:white;padding:32px 36px;position:relative;">';
//   html += '<div style="display:flex;align-items:center;gap:20px;">';
//   if (d.showPhoto && p.photo) html += '<div style="width:80px;height:80px;border-radius:' + photoShape + ';overflow:hidden;border:3px solid rgba(255,255,255,0.3);flex-shrink:0;"><img src="' + p.photo + '" style="width:100%;height:100%;object-fit:cover;" alt="Photo"></div>';
//   html += '<div><div style="font-size:' + (d.fontSize * 2) + 'px;font-weight:800;letter-spacing:-0.5px;line-height:1.1;">' + e(p.firstName) + ' ' + e(p.lastName) + '</div>';
//   if (p.title) html += '<div style="font-size:' + (d.fontSize * 1.1) + 'px;opacity:0.85;margin-top:4px;font-weight:500;">' + e(p.title) + '</div>';
//   html += '</div></div>';
//   // Contact bar
//   html += '<div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:16px;font-size:' + (d.fontSize * 0.85) + 'px;opacity:0.9;">';
//   if (p.email) html += '<span>' + (ic ? '<i class="fas fa-envelope" style="margin-right:4px;"></i>' : '') + e(p.email) + '</span>';
//   if (p.phone) html += '<span>' + (ic ? '<i class="fas fa-phone" style="margin-right:4px;"></i>' : '') + e(p.phone) + '</span>';
//   if (p.city || p.country) html += '<span>' + (ic ? '<i class="fas fa-map-marker-alt" style="margin-right:4px;"></i>' : '') + e([p.city, p.country].filter(Boolean).join(', ')) + '</span>';
//   if (p.linkedin) html += '<span>' + (ic ? '<i class="fab fa-linkedin" style="margin-right:4px;"></i>' : '') + 'LinkedIn</span>';
//   if (p.github) html += '<span>' + (ic ? '<i class="fab fa-github" style="margin-right:4px;"></i>' : '') + 'GitHub</span>';
//   if (p.website) html += '<span>' + (ic ? '<i class="fas fa-globe" style="margin-right:4px;"></i>' : '') + e(p.website) + '</span>';
//   html += '</div></div>';
//   // Body
//   html += '<div style="padding:' + (d.sectionSpacing + 8) + 'px 36px;">';
//   enabled.forEach(sec => { if (sec !== 'personal') html += renderSection(sec, data, d); });
//   html += '</div></div>';
//   return html;
// }

// // ---- Sidebar Layout ----
// function renderSidebarCV(data, d) {
//   const p = data.personal;
//   const photoShape = d.photoShape === 'circle' ? '50%' : d.photoShape === 'rounded' ? '12px' : '4px';
//   const enabled = data.sectionOrder.filter(s => data.enabledSections[s]);
//   const e = escHtml;
//   const ic = d.showIcons;
//   const fs = d.fontSize;
//   const ss = d.sectionSpacing;
//   const pc = d.primaryColor;
//   const sidebarSecs = ['skills', 'languages', 'hobbies', 'references'];
//   const mainSecs = enabled.filter(s => s !== 'personal' && !sidebarSecs.includes(s));
//   const sideEnabled = enabled.filter(s => sidebarSecs.includes(s));

//   let html = '<div style="font-family:\'' + d.fontFamily + '\',sans-serif;font-size:' + fs + 'px;line-height:' + d.lineHeight + ';display:flex;min-height:100%;">';

//   // Sidebar
//   html += '<div style="width:35%;background:' + pc + ';color:white;padding:32px 20px;">';
//   html += '<div style="text-align:center;margin-bottom:24px;">';
//   if (d.showPhoto && p.photo) html += '<div style="width:100px;height:100px;border-radius:' + photoShape + ';overflow:hidden;border:3px solid rgba(255,255,255,0.3);margin:0 auto 12px;"><img src="' + p.photo + '" style="width:100%;height:100%;object-fit:cover;" alt="Photo"></div>';
//   html += '<div style="font-size:' + (fs * 1.6) + 'px;font-weight:800;letter-spacing:-0.3px;line-height:1.2;">' + e(p.firstName) + '<br>' + e(p.lastName) + '</div>';
//   if (p.title) html += '<div style="font-size:' + (fs * 0.9) + 'px;opacity:0.8;margin-top:6px;font-weight:500;">' + e(p.title) + '</div>';
//   html += '</div>';

//   // Contact
//   html += '<div style="margin-bottom:' + (ss + 4) + 'px;">';
//   html += '<div style="font-size:' + (fs * 0.8) + 'px;text-transform:uppercase;letter-spacing:2px;opacity:0.6;margin-bottom:10px;font-weight:700;">Contact</div>';
//   html += '<div style="font-size:' + (fs * 0.85) + 'px;">';
//   if (p.email) html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;word-break:break-all;">' + (ic ? '<i class="fas fa-envelope" style="width:14px;text-align:center;opacity:0.7;"></i>' : '') + '<span>' + e(p.email) + '</span></div>';
//   if (p.phone) html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' + (ic ? '<i class="fas fa-phone" style="width:14px;text-align:center;opacity:0.7;"></i>' : '') + '<span>' + e(p.phone) + '</span></div>';
//   if (p.city || p.country) html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' + (ic ? '<i class="fas fa-map-marker-alt" style="width:14px;text-align:center;opacity:0.7;"></i>' : '') + '<span>' + e([p.city, p.country].filter(Boolean).join(', ')) + '</span></div>';
//   if (p.website) html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;word-break:break-all;">' + (ic ? '<i class="fas fa-globe" style="width:14px;text-align:center;opacity:0.7;"></i>' : '') + '<span>' + e(p.website) + '</span></div>';
//   if (p.linkedin) html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' + (ic ? '<i class="fab fa-linkedin" style="width:14px;text-align:center;opacity:0.7;"></i>' : '') + '<span>LinkedIn</span></div>';
//   if (p.github) html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">' + (ic ? '<i class="fab fa-github" style="width:14px;text-align:center;opacity:0.7;"></i>' : '') + '<span>GitHub</span></div>';
//   html += '</div></div>';

//   // Sidebar sections
//   sideEnabled.forEach(sec => {
//     const sideH = '<div style="font-size:' + (fs * 0.8) + 'px;text-transform:uppercase;letter-spacing:2px;opacity:0.6;margin-bottom:10px;margin-top:' + (ss + 4) + 'px;font-weight:700;border-top:1px solid rgba(255,255,255,0.15);padding-top:' + ss + 'px;">';
//     if (sec === 'skills' && data.skills.length) {
//       html += sideH + 'Skills</div>';
//       html += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">' + data.skills.map(s => '<span style="padding:3px 10px;border-radius:4px;background:rgba(255,255,255,0.15);font-size:' + (fs * 0.8) + 'px;font-weight:500;">' + e(s.name) + '</span>').join('') + '</div>';
//       if (data.skills.some(s => s.level)) {
//         html += data.skills.filter(s => s.level).map(s =>
//           '<div style="margin-bottom:6px;"><div style="display:flex;justify-content:space-between;font-size:' + (fs * 0.8) + 'px;margin-bottom:3px;font-weight:500;"><span>' + e(s.name) + '</span><span style="opacity:0.6;">' + s.level + '%</span></div>' +
//           '<div style="height:4px;border-radius:2px;background:rgba(255,255,255,0.2);overflow:hidden;"><div style="width:' + s.level + '%;height:100%;border-radius:2px;background:rgba(255,255,255,0.8);"></div></div></div>'
//         ).join('');
//       }
//     }
//     if (sec === 'languages' && data.languages.length) {
//       html += sideH + 'Languages</div>';
//       html += data.languages.map(l => '<div style="margin-bottom:6px;font-size:' + (fs * 0.85) + 'px;"><div style="font-weight:600;">' + e(l.name) + '</div><div style="opacity:0.6;font-size:' + (fs * 0.8) + 'px;">' + e(l.level) + '</div></div>').join('');
//     }
//     if (sec === 'hobbies' && data.hobbies.length) {
//       html += sideH + 'Interests</div>';
//       html += '<div style="display:flex;flex-wrap:wrap;gap:4px;">' + data.hobbies.map(h => '<span style="padding:3px 10px;border-radius:20px;background:rgba(255,255,255,0.12);font-size:' + (fs * 0.8) + 'px;">' + e(h.name) + '</span>').join('') + '</div>';
//     }
//     if (sec === 'references' && data.references.length) {
//       html += sideH + 'References</div>';
//       html += data.references.map(r => '<div style="margin-bottom:10px;font-size:' + (fs * 0.85) + 'px;"><div style="font-weight:600;">' + e(r.name) + '</div>' + (r.position ? '<div style="opacity:0.7;font-size:' + (fs * 0.8) + 'px;">' + e(r.position) + '</div>' : '') + (r.email ? '<div style="opacity:0.6;font-size:' + (fs * 0.75) + 'px;margin-top:2px;">' + e(r.email) + '</div>' : '') + '</div>').join('');
//     }
//   });
//   html += '</div>';

//   // Main content
//   html += '<div style="flex:1;padding:32px 28px;color:#1e293b;">';
//   mainSecs.forEach(sec => { html += renderSection(sec, data, d); });
//   html += '</div></div>';
//   return html;
// }

// // ---- React Preview Component ----
// function CVPreview({ scale }) {
//   const { cvData } = useCV();
//   const html = React.useMemo(() => renderCVHTML(cvData), [cvData]);

//   return (
//     <div
//       className="cv-page shadow-2xl"
//       dangerouslySetInnerHTML={{ __html: html }}
//     />
//   );
// }

// // Expose to global scope
// window.renderCVHTML = renderCVHTML;
// window.CVPreview = CVPreview;
