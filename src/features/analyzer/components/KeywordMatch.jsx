/* ================================================
   KeywordMatch — Keyword analysis display
   ================================================ */
function KeywordMatch({ keywordScore, matchedKeywords, missingKeywords }) {
  const [tab, setTab] = React.useState('matched');
  const matched = matchedKeywords || [];
  const missing = missingKeywords || [];

  const typeColors = {
    technical: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    soft_skill: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    action_verb: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    job_match: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  };

  const typeIcons = {
    technical: 'fa-code', soft_skill: 'fa-brain', action_verb: 'fa-bolt', job_match: 'fa-bullseye'
  };

  return React.createElement('div', { className: 'p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm' },
    // Header
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center' },
          React.createElement('i', { className: 'fas fa-key text-amber-600 dark:text-amber-400 text-sm' })
        ),
        React.createElement('h3', { className: 'font-bold text-sm' }, 'Keyword Analysis')
      ),
      React.createElement('span', { className: 'text-lg font-bold text-brand-600 dark:text-brand-400' }, keywordScore + '%')
    ),
    // Stats
    React.createElement('div', { className: 'grid grid-cols-2 gap-3 mb-4' },
      React.createElement('div', { className: 'text-center p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20' },
        React.createElement('div', { className: 'text-xl font-bold text-emerald-600 dark:text-emerald-400' }, matched.length),
        React.createElement('div', { className: 'text-[10px] font-medium text-emerald-600/70 dark:text-emerald-400/70' }, 'Matched')
      ),
      React.createElement('div', { className: 'text-center p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20' },
        React.createElement('div', { className: 'text-xl font-bold text-red-600 dark:text-red-400' }, missing.length),
        React.createElement('div', { className: 'text-[10px] font-medium text-red-600/70 dark:text-red-400/70' }, 'Missing')
      )
    ),
    // Tabs
    React.createElement('div', { className: 'flex border-b border-surface-200 dark:border-surface-700 mb-3' },
      ['matched', 'missing'].map(t =>
        React.createElement('button', {
          key: t, type: 'button',
          className: cn('flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors capitalize',
            tab === t ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-surface-400 hover:text-surface-600'),
          onClick: () => setTab(t)
        }, t === 'matched' ? '✓ Matched (' + matched.length + ')' : '✗ Missing (' + missing.length + ')')

      )
    ),
    // Tags
    React.createElement('div', { className: 'flex flex-wrap gap-1.5 max-h-36 overflow-y-auto' },
      (tab === 'matched' ? matched : missing).slice(0, 20).map((kw, i) =>
        React.createElement('span', {
          key: i,
          className: cn('inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium',
            tab === 'matched' ? (typeColors[kw.type] || 'bg-surface-100 text-surface-600') : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400')
        },
          React.createElement('i', { className: cn('fas text-[8px]', typeIcons[kw.type] || 'fa-tag') }),
          kw.keyword
        )
      ),
      (tab === 'matched' ? matched : missing).length === 0 &&
        React.createElement('p', { className: 'text-xs text-surface-400 italic py-2' },
          tab === 'matched' ? 'No keywords matched yet' : 'All relevant keywords found!'
        )
    )
  );
}

window.KeywordMatch = KeywordMatch;
