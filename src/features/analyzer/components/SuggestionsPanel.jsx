/* ================================================
   SuggestionsPanel — Prioritized improvement list
   ================================================ */
function SuggestionsPanel({ suggestions }) {
  const items = suggestions || [];
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all' ? items : items.filter(s => s.priority === filter);

  const priorityConfig = {
    high: { icon: 'fa-exclamation-circle', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', label: 'High Priority' },
    medium: { icon: 'fa-exclamation-triangle', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', label: 'Medium Priority' },
    low: { icon: 'fa-info-circle', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', label: 'Low Priority' }
  };

  const counts = { high: items.filter(s => s.priority === 'high').length, medium: items.filter(s => s.priority === 'medium').length, low: items.filter(s => s.priority === 'low').length };

  return React.createElement('div', { className: 'p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm' },
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center' },
        React.createElement('i', { className: 'fas fa-magic text-emerald-600 dark:text-emerald-400 text-sm' })
      ),
      React.createElement('h3', { className: 'font-bold text-sm' }, 'Improvement Suggestions'),
      React.createElement('span', { className: 'ml-auto text-xs font-medium text-surface-400' }, items.length + ' tips')
    ),
    // Filter pills
    React.createElement('div', { className: 'flex gap-1.5 mb-3 overflow-x-auto' },
      [{ key: 'all', label: 'All', count: items.length },
       { key: 'high', label: 'Critical', count: counts.high },
       { key: 'medium', label: 'Important', count: counts.medium },
       { key: 'low', label: 'Nice-to-have', count: counts.low }
      ].map(f =>
        React.createElement('button', {
          key: f.key, type: 'button',
          className: cn('px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all',
            filter === f.key
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-surface-100 dark:bg-surface-700 text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-600'),
          onClick: () => setFilter(f.key)
        }, f.label, ' (', f.count, ')')
      )
    ),
    // Suggestions list
    filtered.length > 0
      ? React.createElement('div', { className: 'space-y-2 max-h-80 overflow-y-auto' },
          filtered.map((s, i) => {
            const cfg = priorityConfig[s.priority] || priorityConfig.low;
            return React.createElement('div', {
              key: i,
              className: cn('flex items-start gap-2.5 p-3 rounded-xl border transition-all hover:shadow-sm', cfg.bg, cfg.border)
            },
              React.createElement('i', { className: cn('fas mt-0.5 text-xs', cfg.icon, cfg.color) }),
              React.createElement('div', { className: 'flex-1 min-w-0' },
                React.createElement('p', { className: 'text-xs font-medium text-surface-700 dark:text-surface-300 leading-relaxed' }, s.message),
                React.createElement('span', { className: cn('text-[10px] font-semibold mt-1 inline-block', cfg.color) }, cfg.label)
              )
            );
          })
        )
      : React.createElement('div', { className: 'text-center py-6' },
          React.createElement('i', { className: 'fas fa-check-circle text-3xl text-emerald-400 mb-2' }),
          React.createElement('p', { className: 'text-xs text-surface-400' }, 'No suggestions in this category — great job!')
        )
  );
}

window.SuggestionsPanel = SuggestionsPanel;
