import React, { createContext, useContext, useReducer, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from "../context/AuthContext";
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

    case 'UPDATE_META':
      return { ...state, meta: { ...state.meta, ...action.payload, updatedAt: now } };

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
        design: {
          ...DEFAULT_CV.design,
          template: action.template || 'professional',
          primaryColor: action.color || '#4f46e5',
          layout: action.layout || 'single',
        },
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
  const { user } = useAuth();
  const currentUserIdRef = useRef(null);
  const [cvData, dispatch] = useReducer(cvReducer, null, () =>
    JSON.parse(JSON.stringify(DEFAULT_CV))
  );

  const [darkMode, setDarkModeState] = useState(() =>
    localStorage.getItem('cvex_darkMode') === 'true'
  );

  useEffect(() => {
    const newUserId = user?.id || null;

   if (currentUserIdRef.current !== newUserId) {
  currentUserIdRef.current = newUserId;

  if (!newUserId) {
    dispatch({ type: 'NEW_CV' });
    return;
  }
}
    if (newUserId) {
      const key = `cvex_cvData_${newUserId}`;
      const saved = localStorage.getItem(key);

      if (saved) {
        dispatch({ type: 'LOAD_CV', payload: JSON.parse(saved) });
      }
    }

  }, [user?.id]);

  useEffect(() => {
  if (!cvData || !user) return;

  if (currentUserIdRef.current !== user.id) return;

  const key = `cvex_cvData_${user.id}`;
  localStorage.setItem(key, JSON.stringify(cvData));

}, [cvData, user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('cvex_darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => setDarkModeState(prev => !prev), []);

  const initialSnap = useRef(JSON.stringify(cvData));
  const historyRef = useRef({ stack: [initialSnap.current], index: 0 });
  const lastSnap = useRef(initialSnap.current);

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

  const newCV = useCallback((template, color, layout = 'single') => {
    dispatch({ type: 'NEW_CV', template, color, layout });
    const freshSnap = JSON.stringify({
      ...JSON.parse(JSON.stringify(DEFAULT_CV)),
      design: {
        ...DEFAULT_CV.design,
        template: template || 'professional',
        primaryColor: color || '#4f46e5',
        layout: layout || 'single',
      },
    });
    historyRef.current = { stack: [freshSnap], index: 0 };
    lastSnap.current = freshSnap;
  }, []);

  const [activeSection, setActiveSection] = useState('personal');
  const [previewScale, setPreviewScale] = useState(0.55);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <CVContext.Provider value={{
      cvData,
      dispatch,
      darkMode,
      setDarkMode: toggleDarkMode,
      undo,
      redo,
      canUndo,
      canRedo,
      newCV,
      activeSection,
      setActiveSection,
      previewScale,
      setPreviewScale,
      DEFAULT_CV,
      uid,
      showToast,
      toast,
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