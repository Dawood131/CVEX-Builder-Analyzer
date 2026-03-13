/* ================================================
   ImpactMetrics — Achievement quality analysis
   ================================================ */
function ImpactMetrics({ impactMetrics }) {
  const m = impactMetrics || { totalStatements: 0, quantified: 0, quantifiedPct: 0, actionLed: 0, actionLedPct: 0, resultOriented: 0, resultOrientedPct: 0 };

  const metrics = [
    { label: 'Quantified', value: m.quantified, pct: m.quantifiedPct, icon: 'fa-chart-bar', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20', tip: 'Statements with numbers, %, or metrics' },
    { label: 'Action-Led', value: m.actionLed, pct: m.actionLedPct, icon: 'fa-bolt', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20', tip: 'Starting with strong action verbs' },
    { label: 'Result-Oriented', value: m.resultOriented, pct: m.resultOrientedPct, icon: 'fa-bullseye', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20', tip: 'Showing impact or outcome' }
  ];

  return React.createElement('div', { className: 'p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm' },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center' },
          React.createElement('i', { className: 'fas fa-chart-line text-purple-600 dark:text-purple-400 text-sm' })
        ),
        React.createElement('h3', { className: 'font-bold text-sm' }, 'Impact Metrics')
      ),
      React.createElement('span', { className: 'text-xs text-surface-500 dark:text-surface-400' }, m.totalStatements + ' statements')
    ),
    m.totalStatements === 0
      ? React.createElement('div', { className: 'text-center py-6' },
          React.createElement('i', { className: 'fas fa-file-alt text-3xl text-surface-300 dark:text-surface-600 mb-2' }),
          React.createElement('p', { className: 'text-xs text-surface-400' }, 'Add experience descriptions to see impact metrics')
        )
      : React.createElement('div', { className: 'space-y-3' },
          metrics.map(mt =>
            React.createElement('div', { key: mt.label },
              React.createElement('div', { className: 'flex items-center justify-between mb-1' },
                React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement('div', { className: cn('w-6 h-6 rounded-md flex items-center justify-center', mt.bg) },
                    React.createElement('i', { className: cn('fas text-[10px]', mt.icon, mt.color) })
                  ),
                  React.createElement('span', { className: 'text-xs font-semibold' }, mt.label)
                ),
                React.createElement('div', { className: 'flex items-center gap-2' },
                  React.createElement('span', { className: cn('text-sm font-bold tabular-nums', mt.color) }, mt.pct + '%'),
                  React.createElement('span', { className: 'text-[10px] text-surface-400' }, '(' + mt.value + '/' + m.totalStatements + ')')
                )
              ),
              React.createElement('div', { className: 'h-2 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden' },
                React.createElement('div', {
                  className: cn('h-full rounded-full transition-all duration-700',
                    mt.pct >= 60 ? 'bg-emerald-500' : mt.pct >= 30 ? 'bg-amber-500' : 'bg-red-400'),
                  style: { width: Math.max(2, mt.pct) + '%' }
                })
              ),
              React.createElement('p', { className: 'text-[10px] text-surface-400 mt-0.5' }, mt.tip)
            )
          ),
          // Tips
          m.quantifiedPct < 50 && React.createElement('div', { className: 'mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800' },
            React.createElement('div', { className: 'flex items-start gap-2' },
              React.createElement('i', { className: 'fas fa-lightbulb text-amber-500 mt-0.5 text-xs' }),
              React.createElement('p', { className: 'text-[11px] text-amber-700 dark:text-amber-300' },
                'Tip: Add numbers and metrics to your achievements. E.g., "Increased revenue by 35%" or "Led a team of 12 engineers".'
              )
            )
          )
        )
  );
}

window.ImpactMetrics = ImpactMetrics;
