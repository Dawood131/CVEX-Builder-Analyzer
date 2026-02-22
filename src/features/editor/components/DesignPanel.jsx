// import React from "react";
// import { TEMPLATES, COLOR_THEMES, FONT_OPTIONS } from "../../../data/templates";
// import { TemplateThumbnail, Button, ColorSwatch } from "../../../shared/ui/UIComponents";

// function DesignPanel({ navigate }) {
//     const { cvData, dispatch } = useCV();
//     const d = cvData.design;

//     const applyTheme = (primary, secondary, accent) => {
//         dispatch({ type: 'UPDATE_DESIGN', payload: { primaryColor: primary, secondaryColor: secondary, accentColor: accent } });
//     };

//     const changeTpl = (id) => {
//         dispatch({ type: 'UPDATE_DESIGN', payload: { template: id } });
//     };

//     return (
//         <div className="space-y-6">
//             {/* Template */}
//             <div>
//                 <label className="block text-[0.8125rem] font-semibold text-surface-500 dark:text-surface-400 mb-3">Template</label>
//                 <div className="grid grid-cols-3 gap-2">
//                     {TEMPLATES.slice(0, 6).map(t => (
//                         <div
//                             key={t.id}
//                             className={cn('template-thumb cursor-pointer', d.template === t.id && 'selected')}
//                             style={{ aspectRatio: '210/297', borderRadius: '0.375rem' }}
//                             onClick={() => changeTpl(t.id)}
//                         >
//                             <TemplateThumbnail template={t} primaryColor={d.primaryColor} />
//                         </div>
//                     ))}
//                 </div>
//                 <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => navigate('/templates')}>
//                     <i className="fas fa-th" /> Browse All
//                 </Button>
//             </div>

//             {/* Color theme */}
//             <div>
//                 <label className="block text-[0.8125rem] font-semibold text-surface-500 dark:text-surface-400 mb-3">Color Theme</label>
//                 <div className="flex flex-wrap gap-2">
//                     {COLOR_THEMES.map(t => (
//                         <ColorSwatch
//                             key={t.name}
//                             color={t.primary}
//                             active={d.primaryColor === t.primary}
//                             onClick={() => applyTheme(t.primary, t.secondary, t.accent)}
//                             title={t.name}
//                         />
//                     ))}
//                 </div>
//                 <div className="mt-3">
//                     <label className="block text-[0.8125rem] font-semibold text-surface-500 dark:text-surface-400 mb-1.5">Custom Color</label>
//                     <div className="flex gap-2 items-center">
//                         <input
//                             type="color"
//                             value={d.primaryColor}
//                             onChange={e => applyTheme(e.target.value, e.target.value, e.target.value)}
//                             className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
//                         />
//                         <input
//                             type="text"
//                             value={d.primaryColor}
//                             onChange={e => applyTheme(e.target.value, e.target.value, e.target.value)}
//                             className="flex-1 px-3.5 py-2.5 border-[1.5px] border-surface-200 dark:border-surface-700 rounded-[0.625rem] text-sm bg-white dark:bg-surface-800 font-mono focus:outline-none focus:border-brand-500"
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Font */}
//             <div>
//                 <label className="block text-[0.8125rem] font-semibold text-surface-500 dark:text-surface-400 mb-1.5">Font Family</label>
//                 <select
//                     className="w-full px-3.5 py-2.5 border-[1.5px] border-surface-200 dark:border-surface-700 rounded-[0.625rem] text-sm bg-white dark:bg-surface-800 focus:outline-none focus:border-brand-500"
//                     value={d.fontFamily}
//                     onChange={e => dispatch({ type: 'UPDATE_DESIGN', payload: { fontFamily: e.target.value } })}
//                 >
//                     {FONT_OPTIONS.map(f => (
//                         <option key={f.id} value={f.id}>{f.name}</option>
//                     ))}
//                 </select>
//             </div>

//             {/* Font Size */}
//             <div>
//                 <label className="block text-[0.8125rem] font-semibold text-surface-500 dark:text-surface-400 mb-1.5">
//                     Font Size: {d.fontSize}px
//                 </label>
//                 <input
//                     type="range" min={10} max={18} step={1}
//                     value={d.fontSize}
//                     className="w-full accent-brand-500"
//                     onChange={e => dispatch({ type: 'UPDATE_DESIGN', payload: { fontSize: parseInt(e.target.value) } })}
//                 />
//             </div>

//             {/* Line Height */}
//             <div>
//                 <label className="block text-[0.8125rem] font-semibold text-surface-500 dark:text-surface-400 mb-1.5">
//                     Line Height: {d.lineHeight}
//                 </label>
//                 <input
//                     type="range" min={1.2} max={2.0} step={0.1}
//                     value={d.lineHeight}
//                     className="w-full accent-brand-500"
//                     onChange={e => dispatch({ type: 'UPDATE_DESIGN', payload: { lineHeight: parseFloat(e.target.value) } })}
//                 />
//             </div>

//             {/* Section Spacing */}
//             <div>
//                 <label className="block text-[0.8125rem] font-semibold text-surface-500 dark:text-surface-400 mb-1.5">
//                     Section Spacing: {d.sectionSpacing}px
//                 </label>
//                 <input
//                     type="range" min={8} max={32} step={2}
//                     value={d.sectionSpacing}
//                     className="w-full accent-brand-500"
//                     onChange={e => dispatch({ type: 'UPDATE_DESIGN', payload: { sectionSpacing: parseInt(e.target.value) } })}
//                 />
//             </div>

//             {/* Toggles */}
//             <div className="space-y-3">
//                 <Toggle label="Show Icons" active={d.showIcons} onChange={v => dispatch({ type: 'UPDATE_DESIGN', payload: { showIcons: v } })} />
//                 <Toggle label="Show Photo" active={d.showPhoto} onChange={v => dispatch({ type: 'UPDATE_DESIGN', payload: { showPhoto: v } })} />
//                 <div className="flex items-center justify-between">
//                     <span className="text-sm font-medium">Photo Shape</span>
//                     <select
//                         className="w-32 px-3 py-2 border-[1.5px] border-surface-200 dark:border-surface-700 rounded-[0.625rem] text-sm bg-white dark:bg-surface-800 focus:outline-none focus:border-brand-500"
//                         value={d.photoShape}
//                         onChange={e => dispatch({ type: 'UPDATE_DESIGN', payload: { photoShape: e.target.value } })}
//                     >
//                         <option value="circle">Circle</option>
//                         <option value="square">Square</option>
//                         <option value="rounded">Rounded</option>
//                     </select>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default DesignPanel;
