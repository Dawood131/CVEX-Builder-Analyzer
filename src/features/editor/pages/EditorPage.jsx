// import React from "react";
// import { useCV } from "../../../context/CVContext";
// import { exportCVToPDF } from "../../../utils/exportPdf";
// import { CVPreview, SectionFormRouter, DesignPanel, Toggle } from "../components/DesignPanel";
// import { Button } from "../../../shared/ui/UIComponents";
// import { cn } from "../../../utils/helper";
// import { FaArrowLeft, FaSave, FaUndo, FaRedo, FaPalette, FaMoon, FaSun, FaExpand, FaChartLine, FaDownload, FaMinus, FaPlus } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// function EditorPage() {
//   const navigate = useNavigate(); // ✅ useNavigate for React Router v6
//   const {
//     cvData, dispatch, darkMode, setDarkMode,
//     undo, redo, canUndo, canRedo,
//     showToast, saveVersion,
//     activeSection, setActiveSection,
//     previewScale, setPreviewScale
//   } = useCV();

//   const [sidebarTab, setSidebarTab] = React.useState('sections');
//   const [mobileView, setMobileView] = React.useState('edit');
//   const [fullPreview, setFullPreview] = React.useState(false);
//   const previewRef = React.useRef(null);

//   // ---- Keyboard shortcuts ----
//   React.useEffect(() => {
//     const handler = (e) => {
//       if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
//       if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
//     };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, [undo, redo]);

//   const handleSave = () => {
//     const name = prompt('Save CV as:', cvData.meta.cvName);
//     if (name !== null) {
//       dispatch({ type: 'UPDATE_META', payload: { cvName: name || cvData.meta.cvName } });
//       saveVersion(name || cvData.meta.cvName);
//       showToast('CV saved successfully!', 'success');
//     }
//   };

//   const handleExport = async () => {
//     showToast('Generating PDF...', 'info');
//     const html = renderCVHTML(cvData);
//     const ok = await exportCVToPDF(html, cvData.meta.cvName);
//     if (ok) showToast('PDF exported successfully!', 'success');
//     else showToast('Export failed. Please try again.', 'error');
//   };

//   const adjustScale = (delta) => setPreviewScale(s => Math.max(0.2, Math.min(1, s + delta)));
//   const fitScale = () => {
//     if (previewRef.current) {
//       const w = previewRef.current.clientWidth - 40;
//       setPreviewScale(Math.min(0.85, w / 793.7));
//     }
//   };

//   const dragRef = React.useRef(null);
//   const onDragStart = (idx) => { dragRef.current = idx; };
//   const onDragOver = (e) => e.preventDefault();
//   const onDrop = (e, toIdx) => {
//     e.preventDefault();
//     const from = dragRef.current;
//     if (from !== null && from !== toIdx) {
//       const order = [...cvData.sectionOrder];
//       const [moved] = order.splice(from, 1);
//       order.splice(toIdx, 0, moved);
//       dispatch({ type: 'SET_SECTION_ORDER', payload: order });
//     }
//     dragRef.current = null;
//   };

//   const addCustom = () => {
//     const name = prompt('Custom section name:');
//     if (name) {
//       dispatch({ type: 'ADD_CUSTOM_SECTION', payload: name });
//       showToast('"' + name + '" section added!', 'success');
//     }
//   };

//   const sidebarTabs = [
//     ['sections', <FaArrowLeft />, 'Sections'],
//     ['design', <FaPalette />, 'Design'],
//   ];

//   const mobileNavItems = [
//     ['edit', <FaArrowLeft />, 'Edit'],
//     ['design', <FaPalette />, 'Design'],
//     ['preview', <FaExpand />, 'Preview'],
//     ['export', <FaDownload />, 'Export'],
//   ];

//   return (
//     <div className="animate-fadeIn h-screen flex flex-col">
//       {/* Toolbar */}
//       <div className="sticky top-0 z-50 glass border-b border-surface-200 dark:border-surface-800 shrink-0">
//         <div className="flex items-center justify-between h-14 px-3 sm:px-4 gap-2">
//           <div className="flex items-center gap-2 min-w-0">
//             <Button variant="ghost" size="sm" onClick={() => navigate('/templates')} title="Back">
//               <FaArrowLeft />
//             </Button>
//             <input
//               type="text"
//               className="bg-transparent border-none text-sm font-semibold focus:outline-none w-32 sm:w-48 truncate"
//               value={cvData.meta.cvName}
//               onChange={e => dispatch({ type: 'UPDATE_META', payload: { cvName: e.target.value } })}
//               placeholder="CV Name"
//             />
//           </div>

//           <div className="flex items-center gap-1 sm:gap-2">
//             <Button variant="ghost" size="sm" onClick={undo} disabled={!canUndo} title="Undo">
//               <FaUndo />
//             </Button>
//             <Button variant="ghost" size="sm" onClick={redo} disabled={!canRedo} title="Redo">
//               <FaRedo />
//             </Button>
//             <Button variant="ghost" size="sm" onClick={() => setSidebarTab('design')} title="Theme">
//               <FaPalette />
//             </Button>
//             <Button variant="ghost" size="sm" onClick={handleSave} title="Save">
//               <FaSave />
//             </Button>
//           </div>

//           <div className="flex items-center gap-1 sm:gap-2">
//             <Button variant="ghost" size="sm" onClick={setDarkMode}>
//               {darkMode ? <FaSun /> : <FaMoon />}
//             </Button>
//             <Button variant="primary" size="sm" onClick={handleExport}>
//               <FaDownload className="mr-1" /> Export PDF
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Main Layout */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Sidebar */}
//         <div className={cn(
//           'w-full lg:w-[380px] shrink-0 border-r border-surface-200 dark:border-surface-800 flex flex-col overflow-hidden bg-white dark:bg-surface-900',
//           mobileView !== 'edit' && 'hidden lg:flex'
//         )}>
//           {/* Tabs */}
//           <div className="flex border-b border-surface-200 dark:border-surface-800 shrink-0">
//             {sidebarTabs.map(([tab, icon, label]) => (
//               <button
//                 key={tab}
//                 className={cn(
//                   'flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-colors',
//                   sidebarTab === tab
//                     ? 'border-brand-500 text-brand-600 dark:text-brand-400'
//                     : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
//                 )}
//                 onClick={() => setSidebarTab(tab)}
//               >
//                 {icon} {label}
//               </button>
//             ))}
//           </div>

//           <div className="flex-1 overflow-y-auto p-4 space-y-3">
//             {sidebarTab === 'sections' ? (
//               <>
//                 {cvData.sectionOrder.map((sec, idx) => {
//                   const meta = SECTION_META[sec] || (sec.startsWith('custom_')
//                     ? { icon: 'fa-folder', label: (cvData.customSections.find(c => c.id === sec) || {}).name || 'Custom', mandatory: false }
//                     : null);
//                   if (!meta) return null;
//                   const isEnabled = cvData.enabledSections[sec];
//                   const isActive = activeSection === sec;

//                   return (
//                     <div
//                       key={sec}
//                       className={cn(
//                         'border-[1.5px] rounded-xl overflow-hidden transition-all',
//                         isActive
//                           ? 'border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-950/20'
//                           : 'border-surface-200 dark:border-surface-700 hover:border-brand-200 dark:hover:border-brand-800'
//                       )}
//                       draggable
//                       onDragStart={() => onDragStart(idx)}
//                       onDragOver={onDragOver}
//                       onDrop={(e) => onDrop(e, idx)}
//                     >
//                       <div
//                         className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
//                         onClick={() => setActiveSection(isActive ? null : sec)}
//                       >
//                         <div className="flex items-center gap-3">
//                           <i className="fas fa-grip-vertical text-surface-400 hover:text-surface-600 cursor-grab" />
//                           <i className={cn('fas', meta.icon, 'text-sm', isActive ? 'text-brand-500' : 'text-surface-400')} />
//                           <span className="font-semibold text-sm">{meta.label}</span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           {!meta.mandatory ? (
//                             <Toggle
//                               active={isEnabled}
//                               onChange={(v) => dispatch({ type: 'UPDATE_ENABLED', payload: { [sec]: v } })}
//                             />
//                           ) : (
//                             <span className="text-[10px] font-medium text-surface-400 uppercase">Required</span>
//                           )}
//                           <i className={cn('fas text-xs text-surface-400', isActive ? 'fa-chevron-up' : 'fa-chevron-down')} />
//                         </div>
//                       </div>

//                       {isActive && (
//                         <div className="p-4 border-t border-surface-100 dark:border-surface-800 animate-slideDown">
//                           <SectionFormRouter section={sec} />
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//                 <Button variant="secondary" className="w-full mt-4" onClick={addCustom}>
//                   <FaPlus /> Add Custom Section
//                 </Button>
//               </>
//             ) : (
//               <DesignPanel />
//             )}
//           </div>
//         </div>

//         {/* Preview */}
//         <div
//           ref={previewRef}
//           className={cn(
//             'flex-1 bg-surface-100 dark:bg-surface-950 overflow-auto flex flex-col items-center py-6 px-4',
//             mobileView !== 'preview' && 'hidden lg:flex'
//           )}
//         >
//           <div className="mb-4 flex items-center gap-3 shrink-0">
//             <Button variant="ghost" size="sm" onClick={() => adjustScale(-0.05)}><FaMinus /></Button>
//             <span className="text-sm font-medium text-surface-500">{Math.round(previewScale * 100)}%</span>
//             <Button variant="ghost" size="sm" onClick={() => adjustScale(0.05)}><FaPlus /></Button>
//             <Button variant="ghost" size="sm" onClick={fitScale}>Fit</Button>
//           </div>
//           <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center', transition: 'transform 0.3s ease' }}>
//             <CVPreview />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default EditorPage;