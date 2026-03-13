/* ================================================
   AnalysisHistory — Past scan results management
   ================================================ */
function AnalysisHistory({ history, onLoadScan, onDeleteScan, onClearAll, currentScanId }) {
  const items = history || [];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' ' +
           d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return React.createElement('div', { className: 'p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm' },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center' },
          React.createElement('i', { className: 'fas fa-history text-cyan-600 dark:text-cyan-400 text-sm' })
        ),
        React.createElement('h3', { className: 'font-bold text-sm' }, 'Analysis History')
      ),
      items.length > 0 && onClearAll && React.createElement('button', {
        type: 'button',
        className: 'text-[10px] font-medium text-red-500 hover:text-red-600 transition-colors',
        onClick: onClearAll
      }, 'Clear All')
    ),
    items.length === 0
      ? React.createElement('div', { className: 'text-center py-6' },
          React.createElement('i', { className: 'fas fa-clock text-3xl text-surface-300 dark:text-surface-600 mb-2' }),
          React.createElement('p', { className: 'text-xs text-surface-400' }, 'No analysis history yet'),
          React.createElement('p', { className: 'text-[10px] text-surface-400 mt-1' }, 'Run your first scan to get started')
        )
      : React.createElement('div', { className: 'space-y-2 max-h-72 overflow-y-auto' },
          items.map((scan, i) =>
            React.createElement('div', {
              key: scan.scanId || i,
              className: cn('flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer group',
                currentScanId === scan.scanId
                  ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20 shadow-sm'
                  : 'border-surface-100 dark:border-surface-700 hover:border-brand-300 hover:bg-surface-50 dark:hover:bg-surface-800'),
              onClick: () => onLoadScan && onLoadScan(scan)
            },
              // Score badge
              React.createElement('div', { className: 'w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700 flex flex-col items-center justify-center shrink-0' },
                React.createElement('span', { className: cn('text-lg font-extrabold tabular-nums leading-none', getScoreColor(scan.overallScore)) }, scan.overallScore),
                React.createElement('span', { className: 'text-[8px] font-semibold text-surface-400' }, scan.grade)
              ),
              // Info
              React.createElement('div', { className: 'flex-1 min-w-0' },
                React.createElement('p', { className: 'text-xs font-semibold truncate' }, scan.meta?.cvName || 'Untitled CV'),
                React.createElement('div', { className: 'flex items-center gap-2 mt-0.5' },
                  React.createElement('span', { className: 'text-[10px] text-surface-400' }, formatDate(scan.timestamp)),
                  scan.meta?.industry && React.createElement('span', { className: 'text-[10px] px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-surface-500 capitalize' }, scan.meta.industry)
                )
              ),
              // Actions
              React.createElement('div', { className: 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity' },
                onDeleteScan && React.createElement('button', {
                  type: 'button',
                  className: 'w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors',
                  onClick: (e) => { e.stopPropagation(); onDeleteScan(scan.scanId); },
                  title: 'Delete scan'
                }, React.createElement('i', { className: 'fas fa-trash-alt text-[10px]' }))
              )
            )
          )
        )
  );
}

window.AnalysisHistory = AnalysisHistory;
