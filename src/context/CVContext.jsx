import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useRef } from 'react';

// ---- Default CV Data ----
export const DEFAULT_CV = {
  personal: {
    firstName: '', lastName: '', title: '', email: '', phone: '',
    address: '', city: '', country: '', website: '',
    linkedin: '', github: '', twitter: '', photo: '', summary: ''
  },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  awards: [],
  hobbies: [],
  references: [],
  customSections: [],
  sectionOrder: [
    'personal', 'summary', 'experience', 'education', 'skills',
    'projects', 'certifications', 'languages', 'awards', 'hobbies', 'references'
  ],
  enabledSections: {
    personal: true, summary: true, experience: true, education: true,
    skills: true, projects: false, certifications: false, languages: false,
    awards: false, hobbies: false, references: false
  },
  design: {
    template: 'professional', primaryColor: '#4f46e5', secondaryColor: '#6366f1',
    accentColor: '#a855f7', backgroundColor: '#ffffff', textColor: '#1e293b',
    fontFamily: 'Inter', fontSize: 14, lineHeight: 1.5, sectionSpacing: 16,
    showIcons: true, showPhoto: true, photoShape: 'circle', layout: 'single'
  },
  meta: { cvName: 'Untitled CV', createdAt: Date.now(), updatedAt: Date.now(), version: 1 }
};

// ---- Unique ID ----
export const uid = () => 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);

// ---- Reducer ----
function cvReducer(state, action) {
  const now = Date.now();

  switch (action.type) {
    case 'UPDATE_PERSONAL':
      return { ...state, personal: { ...state.personal, ...action.payload }, meta: { ...state.meta, updatedAt: now } };

    case 'UPDATE_DESIGN':
      return { ...state, design: { ...state.design, ...action.payload }, meta: { ...state.meta, updatedAt: now } };

    case 'UPDATE_ENABLED':
      return { ...state, enabledSections: { ...state.enabledSections, ...action.payload }, meta: { ...state.meta, updatedAt: now } };

    case 'SET_SECTION_ORDER':
      return { ...state, sectionOrder: action.payload, meta: { ...state.meta, updatedAt: now } };

    case 'SET_ARRAY_SECTION':
      return { ...state, [action.section]: action.payload, meta: { ...state.meta, updatedAt: now } };

    case 'ADD_ENTRY': {
      const entry = { ...action.payload, id: uid() };
      return { ...state, [action.section]: [...(state[action.section] || []), entry], meta: { ...state.meta, updatedAt: now } };
    }

    case 'UPDATE_ENTRY': {
      const arr = (state[action.section] || []).map(e => e.id === action.id ? { ...e, ...action.payload } : e);
      return { ...state, [action.section]: arr, meta: { ...state.meta, updatedAt: now } };
    }

    case 'REMOVE_ENTRY':
      return { ...state, [action.section]: (state[action.section] || []).filter(e => e.id !== action.id), meta: { ...state.meta, updatedAt: now } };

    case 'DUPLICATE_ENTRY': {
      const src = (state[action.section] || []).find(e => e.id === action.id);
      if (!src) return state;
      const clone = { ...JSON.parse(JSON.stringify(src)), id: uid() };
      return { ...state, [action.section]: [...state[action.section], clone], meta: { ...state.meta, updatedAt: now } };
    }

    case 'ADD_CUSTOM_SECTION': {
      const csId = 'custom_' + uid();
      return {
        ...state,
        customSections: [...state.customSections, { id: csId, name: action.payload, entries: [] }],
        sectionOrder: [...state.sectionOrder, csId],
        enabledSections: { ...state.enabledSections, [csId]: true },
        meta: { ...state.meta, updatedAt: now }
      };
    }

    case 'UPDATE_CUSTOM_SECTION': {
      const cs = state.customSections.map(c => c.id === action.id ? { ...c, ...action.payload } : c);
      return { ...state, customSections: cs, meta: { ...state.meta, updatedAt: now } };
    }

    case 'REMOVE_CUSTOM_SECTION':
      return {
        ...state,
        customSections: state.customSections.filter(c => c.id !== action.id),
        sectionOrder: state.sectionOrder.filter(s => s !== action.id),
        enabledSections: Object.fromEntries(Object.entries(state.enabledSections).filter(([k]) => k !== action.id)),
        meta: { ...state.meta, updatedAt: now }
      };

    case 'LOAD_CV':
      return { ...mergeDefaults(action.payload), meta: { ...action.payload.meta, updatedAt: now } };

    case 'NEW_CV':
      return {
        ...JSON.parse(JSON.stringify(DEFAULT_CV)),
        design: { ...DEFAULT_CV.design, template: action.template || 'professional', primaryColor: action.color || '#4f46e5' },
        meta: { ...DEFAULT_CV.meta, createdAt: now, updatedAt: now }
      };

    case 'RESTORE':
      return action.payload;

    default:
      return state;
  }
}

// ---- Merge defaults ----
function mergeDefaults(saved) {
  const def = JSON.parse(JSON.stringify(DEFAULT_CV));
  return {
    ...def, ...saved,
    personal: { ...def.personal, ...(saved.personal || {}) },
    design: { ...def.design, ...(saved.design || {}) },
    enabledSections: { ...def.enabledSections, ...(saved.enabledSections || {}) },
    sectionOrder: saved.sectionOrder || def.sectionOrder,
    meta: { ...def.meta, ...(saved.meta || {}) }
  };
}

// ---- Context ----
const CVContext = createContext(null);

export function CVProvider({ children }) {
  const loadInitial = () => {
    try {
      const saved = localStorage.getItem('cvex_currentCV');
      return saved ? mergeDefaults(JSON.parse(saved)) : JSON.parse(JSON.stringify(DEFAULT_CV));
    } catch {
      return JSON.parse(JSON.stringify(DEFAULT_CV));
    }
  };

  const [cvData, dispatch] = useReducer(cvReducer, null, loadInitial);

  // Dark mode
  const [darkMode, setDarkModeState] = useState(() => localStorage.getItem('cvex_darkMode') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('cvex_darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkModeState(prev => !prev), []);

  // Saved CVs
  const [savedCVs, setSavedCVs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cvex_savedCVs') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cvex_savedCVs', JSON.stringify(savedCVs));
  }, [savedCVs]);

  // Undo/Redo
  const historyRef = useRef({ stack: [JSON.stringify(loadInitial())], index: 0 });
  const lastSnap = useRef(JSON.stringify(loadInitial()));

  useEffect(() => {
    const snap = JSON.stringify(cvData);
    if (snap === lastSnap.current) return;
    lastSnap.current = snap;
    const h = historyRef.current;
    h.stack = h.stack.slice(0, h.index + 1);
    h.stack.push(snap);
    if (h.stack.length > 50) h.stack.shift();
    h.index = h.stack.length - 1;
  }, [cvData]);

  const canUndo = historyRef.current.index > 0;
  const canRedo = historyRef.current.index < historyRef.current.stack.length - 1;

  const undo = useCallback(() => {
    const h = historyRef.current;
    if (h.index > 0) {
      h.index--;
      const restored = JSON.parse(h.stack[h.index]);
      lastSnap.current = h.stack[h.index];
      dispatch({ type: 'RESTORE', payload: restored });
    }
  }, []);

  const redo = useCallback(() => {
    const h = historyRef.current;
    if (h.index < h.stack.length - 1) {
      h.index++;
      const restored = JSON.parse(h.stack[h.index]);
      lastSnap.current = h.stack[h.index];
      dispatch({ type: 'RESTORE', payload: restored });
    }
  }, []);

  // Autosave
  const saveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try { localStorage.setItem('cvex_currentCV', JSON.stringify(cvData)); } catch {}
    }, 500);
    return () => clearTimeout(saveTimer.current);
  }, [cvData]);

  // Active Section
  const [activeSection, setActiveSection] = useState('personal');
  const [previewScale, setPreviewScale] = useState(0.55);

  // Save/Load/Delete versions
  const saveVersion = useCallback((name) => {
    const cv = { id: uid(), name: name || cvData.meta.cvName, data: JSON.parse(JSON.stringify(cvData)), savedAt: Date.now() };
    setSavedCVs(prev => [...prev, cv]);
    return cv;
  }, [cvData]);

  const loadVersion = useCallback((id) => {
    const cv = savedCVs.find(c => c.id === id);
    if (cv) dispatch({ type: 'LOAD_CV', payload: cv.data });
  }, [savedCVs]);

  const deleteVersion = useCallback((id) => {
    setSavedCVs(prev => prev.filter(c => c.id !== id));
  }, []);

  const newCV = useCallback((template, color) => {
    dispatch({ type: 'NEW_CV', template, color });
    historyRef.current = { stack: [], index: -1 };
  }, []);

  return (
    <CVContext.Provider value={{
      cvData, dispatch,
      darkMode, setDarkMode: toggleDarkMode,
      savedCVs, saveVersion, loadVersion, deleteVersion, newCV,
      undo, redo, canUndo, canRedo,
      activeSection, setActiveSection,
      previewScale, setPreviewScale,
      DEFAULT_CV, uid
    }}>
      {children}
    </CVContext.Provider>
  );
}

// ---- Hook ----
export function useCV() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error('useCV must be used within CVProvider');
  return ctx;
}
