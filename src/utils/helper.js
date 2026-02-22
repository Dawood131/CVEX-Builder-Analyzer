/** Escape HTML special characters to prevent XSS */
export function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Concatenate CSS class names, filtering out falsy values */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/** Find a template by its ID */
export function getTemplateById(id, templates) {
  return templates?.find(t => t.id === id);
}

/** Get templates filtered by category */
export function getTemplatesByCategory(cat, templates) {
  if (!cat || cat === 'all') return templates;
  return templates.filter(t => t.category === cat);
}
