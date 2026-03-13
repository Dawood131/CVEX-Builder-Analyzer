import {
  FaThLarge,
  FaBriefcase,
  FaBolt,
  FaMinus,
  FaPalette,
  FaUser, FaAlignLeft, FaGraduationCap, FaStar, 
  FaCode, FaCertificate, FaGlobe, FaTrophy, FaHeart, FaUsers
} from "react-icons/fa";

const TEMPLATES = [
  { id: 'professional', name: 'Professional', category: 'professional', description: 'Clean corporate design, ideal for business & finance.', colors: ['#1e3a5f', '#2563eb', '#0f172a'], layout: 'single', popular: true },
  { id: 'modern', name: 'Modern Edge', category: 'modern', description: 'Bold sidebar layout with accent colors and clear hierarchy.', colors: ['#6366f1', '#4f46e5', '#312e81'], layout: 'sidebar', popular: true },
  { id: 'minimal', name: 'Minimal', category: 'minimal', description: 'Ultra-clean minimalist design that lets content speak.', colors: ['#374151', '#6b7280', '#111827'], layout: 'single', popular: true },
  { id: 'creative', name: 'Creative', category: 'creative', description: 'Vibrant design for designers, artists & creative pros.', colors: ['#ec4899', '#a855f7', '#6366f1'], layout: 'sidebar', popular: false },
  { id: 'executive', name: 'Executive', category: 'professional', description: 'Sophisticated layout for senior-level professionals.', colors: ['#0f172a', '#1e293b', '#334155'], layout: 'single', popular: true },
  { id: 'developer', name: 'Developer', category: 'modern', description: 'Tech-focused template with skills bars and project sections.', colors: ['#059669', '#10b981', '#047857'], layout: 'sidebar', popular: true },
  { id: 'elegant', name: 'Elegant', category: 'minimal', description: 'Graceful serif typography with subtle accents.', colors: ['#78716c', '#a8a29e', '#44403c'], layout: 'single', popular: false },
  { id: 'startup', name: 'Startup', category: 'creative', description: 'Dynamic layout perfect for startup and tech roles.', colors: ['#f59e0b', '#d97706', '#92400e'], layout: 'sidebar', popular: false },
  { id: 'academic', name: 'Academic', category: 'professional', description: 'Structured format ideal for academic and research CVs.', colors: ['#1e40af', '#1d4ed8', '#1e3a8a'], layout: 'single', popular: false },
  { id: 'nordic', name: 'Nordic', category: 'minimal', description: 'Scandinavian-inspired clean design with soft tones.', colors: ['#64748b', '#94a3b8', '#475569'], layout: 'single', popular: false },
  { id: 'bold', name: 'Bold Impact', category: 'creative', description: 'Strong visual impact with large headers and bright accents.', colors: ['#dc2626', '#ef4444', '#991b1b'], layout: 'sidebar', popular: false },
  { id: 'compact', name: 'Compact', category: 'modern', description: 'Space-efficient design that fits more content per page.', colors: ['#0891b2', '#06b6d4', '#0e7490'], layout: 'single', popular: false },
];

const TEMPLATE_CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: FaThLarge },
  { id: 'professional', name: 'Professional', icon: FaBriefcase },
  { id: 'modern', name: 'Modern', icon: FaBolt },
  { id: 'minimal', name: 'Minimal', icon: FaMinus },
  { id: 'creative', name: 'Creative', icon: FaPalette },
];

const COLOR_THEMES = [
  { name: 'Indigo', primary: '#4f46e5', secondary: '#6366f1', accent: '#a5b4fc' },
  { name: 'Blue', primary: '#2563eb', secondary: '#3b82f6', accent: '#93c5fd' },
  { name: 'Emerald', primary: '#059669', secondary: '#10b981', accent: '#6ee7b7' },
  { name: 'Rose', primary: '#e11d48', secondary: '#f43f5e', accent: '#fda4af' },
  { name: 'Amber', primary: '#d97706', secondary: '#f59e0b', accent: '#fcd34d' },
  { name: 'Violet', primary: '#7c3aed', secondary: '#8b5cf6', accent: '#c4b5fd' },
  { name: 'Teal', primary: '#0d9488', secondary: '#14b8a6', accent: '#5eead4' },
  { name: 'Slate', primary: '#334155', secondary: '#475569', accent: '#94a3b8' },
  { name: 'Cyan', primary: '#0891b2', secondary: '#06b6d4', accent: '#67e8f9' },
  { name: 'Fuchsia', primary: '#a21caf', secondary: '#c026d3', accent: '#e879f9' },
  { name: 'Red', primary: '#dc2626', secondary: '#ef4444', accent: '#fca5a5' },
  { name: 'Navy', primary: '#1e3a5f', secondary: '#1e40af', accent: '#93c5fd' },
];

const FONT_OPTIONS = [
  { id: 'Inter', name: 'Inter', cat: 'sans-serif' },
  { id: 'Plus Jakarta Sans', name: 'Jakarta Sans', cat: 'sans-serif' },
  { id: 'Arial', name: 'Arial', cat: 'sans-serif' },
  { id: 'Helvetica', name: 'Helvetica', cat: 'sans-serif' },
  { id: 'Georgia', name: 'Georgia', cat: 'serif' },
  { id: 'Times New Roman', name: 'Times New Roman', cat: 'serif' },
  { id: 'Courier New', name: 'Courier New', cat: 'monospace' },
];

const SECTION_META = {
  personal:       { icon: FaUser, label: 'Personal Information', mandatory: true },
  summary:        { icon: FaAlignLeft, label: 'Professional Summary', mandatory: true },
  experience:     { icon: FaBriefcase, label: 'Work Experience', mandatory: true },
  education:      { icon: FaGraduationCap, label: 'Education', mandatory: true },
  skills:         { icon: FaStar, label: 'Skills', mandatory: false },
  projects:       { icon: FaCode, label: 'Projects', mandatory: false },
  certifications: { icon: FaCertificate, label: 'Certifications', mandatory: false },
  languages:      { icon: FaGlobe, label: 'Languages', mandatory: false },
  awards:         { icon: FaTrophy, label: 'Awards', mandatory: false },
  hobbies:        { icon: FaHeart, label: 'Hobbies & Interests', mandatory: false },
  references:     { icon: FaUsers, label: 'References', mandatory: false },
};

const FEATURES = [
  { icon: 'fa-th-large', title: 'Professional Templates', desc: 'Choose from 12+ beautifully designed templates for any industry.' },
  { icon: 'fa-eye', title: 'Live CV Preview', desc: 'See changes in real-time as you type — WYSIWYG editing.' },
  { icon: 'fa-palette', title: 'Dynamic Colors & Fonts', desc: 'Customize every visual aspect with our design tools.' },
  { icon: 'fa-arrows-alt', title: 'Drag & Drop Sections', desc: 'Reorder CV sections with intuitive drag and drop.' },
  { icon: 'fa-copy', title: 'Multiple CV Versions', desc: 'Save and manage different versions for different roles.' },
  { icon: 'fa-robot', title: 'Smart Suggestions', desc: 'Get AI-powered content suggestions for each section.' },
  { icon: 'fa-file-pdf', title: 'High-Quality PDF', desc: 'Export crisp, print-ready PDFs with perfect formatting.' },
  { icon: 'fa-mobile-alt', title: 'Fully Responsive', desc: 'Build and preview your CV on any device, anywhere.' },
];

const TESTIMONIALS = [
  { name: 'Sarah K.', role: 'Product Designer', text: 'CVEX made creating my CV so easy. The templates are stunning and the PDF export is flawless. Landed my dream job!', rating: 5, initials: 'SK', color: '#6366f1' },
  { name: 'Michael T.', role: 'Software Engineer', text: "The live preview feature is amazing. I could see every change in real-time. Best CV builder I've used.", rating: 5, initials: 'MT', color: '#059669' },
  { name: 'Emily R.', role: 'Marketing Manager', text: 'Beautiful templates, intuitive design tools, and the drag & drop is seamless. Highly recommended!', rating: 5, initials: 'ER', color: '#d97706' },
  { name: 'David L.', role: 'Data Analyst', text: 'The ATS-friendly templates helped me get past automated screening systems. Got 3 interview calls!', rating: 5, initials: 'DL', color: '#dc2626' },
  { name: 'Anna W.', role: 'UX Researcher', text: 'Clean, professional, and so easy to customize. Exported a perfect PDF in under 10 minutes.', rating: 5, initials: 'AW', color: '#8b5cf6' },
  { name: 'James P.', role: 'Project Manager', text: 'Multiple CV versions feature is a game-changer. I have different CVs for different job applications.', rating: 4, initials: 'JP', color: '#0891b2' },
];

const HOW_IT_WORKS = [
  { icon: 'fa-palette', title: 'Choose a Template', desc: 'Pick from our library of professional, modern, and creative templates.' },
  { icon: 'fa-edit', title: 'Fill Simple Forms', desc: 'Enter your information using our intuitive step-by-step forms.' },
  { icon: 'fa-sliders-h', title: 'Customize Design', desc: 'Adjust colors, fonts, layout, and more to match your style.' },
  { icon: 'fa-file-pdf', title: 'Download PDF', desc: 'Export a high-quality, ATS-friendly PDF ready to send.' },
];

export {TEMPLATES, TEMPLATE_CATEGORIES, COLOR_THEMES, FONT_OPTIONS, SECTION_META, FEATURES, TESTIMONIALS, HOW_IT_WORKS,}