/* ================================================
   ATSScore — ATS Compatibility visualisation
   ================================================ */
function ATSScore({ atsScore, atsDetails }) {
  const [anim, setAnim] = React.useState(0);
  React.useEffect(() => {
    let f; const s = performance.now();
    const run = (now) => { const p = Math.min((now - s) / 1000, 1); setAnim(Math.round((1 - Math.pow(1 - p, 3)) * atsScore)); if (p < 1) f = requestAnimationFrame(run); };
    f = requestAnimationFrame(run); return () => cancelAnimationFrame(f);
  }, [atsScore]);

  const barColor = atsScore >= 80 ? 'bg-emerald-500' : atsScore >= 60 ? 'bg-blue-500' : atsScore >= 40 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = atsScore >= 80 ? 'text-emerald-600 dark:text-emerald-400' : atsScore >= 60 ? 'text-blue-600 dark:text-blue-400' : atsScore >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';

  return React.createElement('div', { className: 'p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm' },
    React.createElement('div', { className: 'flex items-center justify-between mb-3' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center' },
          React.createElement('i', { className: 'fas fa-robot text-brand-600 dark:text-brand-400 text-sm' })
        ),
        React.createElement('h3', { className: 'font-bold text-sm' }, 'ATS Compatibility')
      ),
      React.createElement('span', { className: cn('text-2xl font-extrabold tabular-nums', textColor) }, anim + '%')
    ),
    // Progress bar
    React.createElement('div', { className: 'h-3 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden mb-4' },
      React.createElement('div', {
        className: cn('h-full rounded-full transition-all duration-1000 ease-out', barColor),
        style: { width: anim + '%' }
      })
    ),
    // Status
    React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
      React.createElement('i', { className: cn('fas', atsScore >= 60 ? 'fa-check-circle text-emerald-500' : 'fa-exclamation-triangle text-amber-500') }),
      React.createElement('span', { className: 'text-xs font-medium text-surface-600 dark:text-surface-400' },
        atsScore >= 80 ? 'Your CV is highly ATS-compatible' :
        atsScore >= 60 ? 'Good ATS compatibility with room for improvement' :
        'Your CV may struggle to pass ATS filters'
      )
    ),
    // Details list
    (atsDetails || []).length > 0 && React.createElement('div', { className: 'space-y-1.5 mt-3 pt-3 border-t border-surface-100 dark:border-surface-700' },
      atsDetails.slice(0, 5).map((d, i) =>
        React.createElement('div', { key: i, className: 'flex items-start gap-2 text-xs' },
          React.createElement('i', { className: cn('fas mt-0.5',
            d.type === 'error' ? 'fa-times-circle text-red-500' :
            d.type === 'warning' ? 'fa-exclamation-circle text-amber-500' :
            'fa-info-circle text-blue-500'
          ) }),
          React.createElement('span', { className: 'text-surface-600 dark:text-surface-400' }, d.msg)
        )
      )
    )
  );
}

window.ATSScore = ATSScore;
