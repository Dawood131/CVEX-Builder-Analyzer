/* ================================================
   SectionAnalysis — Per-section score breakdown
   ================================================ */
function SectionAnalysis({ sectionBreakdown }) {
  const sections = sectionBreakdown || {};
  const sectionKeys = Object.keys(sections);
  const [expanded, setExpanded] = React.useState(null);

  const getBarColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getIcon = (key) => {
    const icons = { personal: 'fa-user', summary: 'fa-align-left', experience: 'fa-briefcase', education: 'fa-graduation-cap', skills: 'fa-cogs', projects: 'fa-project-diagram', certifications: 'fa-certificate', languages: 'fa-globe', awards: 'fa-trophy' };
    return icons[key] || 'fa-puzzle-piece';
  };

  return React.createElement('div', { className: 'p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm' },
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center' },
        React.createElement('i', { className: 'fas fa-th-list text-indigo-600 dark:text-indigo-400 text-sm' })
      ),
      React.createElement('h3', { className: 'font-bold text-sm' }, 'Section Analysis')
    ),
    React.createElement('div', { className: 'space-y-2' },
      sectionKeys.map(key => {
        const sec = sections[key];
        const isExpanded = expanded === key;
        return React.createElement('div', { key, className: 'rounded-xl border border-surface-100 dark:border-surface-700 overflow-hidden transition-all' },
          React.createElement('button', {
            type: 'button',
            className: 'w-full flex items-center gap-3 p-3 hover:bg-surface-50 dark:hover:bg-surface-750 transition-colors text-left',
            onClick: () => setExpanded(isExpanded ? null : key)
          },
            React.createElement('i', { className: cn('fas w-4 text-center text-xs', getIcon(key), sec.score >= 60 ? 'text-surface-500' : 'text-amber-500') }),
            React.createElement('div', { className: 'flex-1 min-w-0' },
              React.createElement('div', { className: 'flex items-center justify-between mb-1' },
                React.createElement('span', { className: 'text-xs font-semibold truncate' }, sec.name),
                React.createElement('span', { className: cn('text-xs font-bold tabular-nums ml-2', sec.score >= 80 ? 'text-emerald-600' : sec.score >= 60 ? 'text-blue-600' : sec.score >= 40 ? 'text-amber-600' : 'text-red-600') }, sec.score + '%')
              ),
              React.createElement('div', { className: 'h-1.5 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden' },
                React.createElement('div', { className: cn('h-full rounded-full transition-all duration-700', getBarColor(sec.score)), style: { width: sec.score + '%' } })
              )
            ),
            React.createElement('i', { className: cn('fas fa-chevron-down text-[10px] text-surface-400 transition-transform', isExpanded && 'rotate-180') })
          ),
          // Expanded details
          isExpanded && sec.suggestions && sec.suggestions.length > 0 &&
            React.createElement('div', { className: 'px-3 pb-3 pt-0' },
              React.createElement('div', { className: 'pl-7 space-y-1.5' },
                sec.suggestions.map((s, i) =>
                  React.createElement('div', { key: i, className: 'flex items-start gap-2 text-[11px] text-surface-500 dark:text-surface-400' },
                    React.createElement('i', { className: 'fas fa-lightbulb text-amber-400 mt-0.5 text-[9px]' }),
                    React.createElement('span', null, s)
                  )
                )
              )
            )
        );
      })
    )
  );
}

window.SectionAnalysis = SectionAnalysis;
