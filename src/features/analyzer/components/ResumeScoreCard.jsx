/* ================================================
   ResumeScoreCard — Animated circular score display
   ================================================ */
function ResumeScoreCard({ score, grade, label }) {
  const [animScore, setAnimScore] = React.useState(0);

  React.useEffect(() => {
    let frame;
    const start = performance.now();
    const duration = 1200;
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return { stroke: '#10b981', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400', glow: 'shadow-emerald-200' };
    if (s >= 60) return { stroke: '#3b82f6', bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', glow: 'shadow-blue-200' };
    if (s >= 40) return { stroke: '#f59e0b', bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', glow: 'shadow-amber-200' };
    return { stroke: '#ef4444', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', glow: 'shadow-red-200' };
  };
  const color = getColor(score);

  return React.createElement('div', { className: cn('relative p-6 rounded-2xl border border-surface-200 dark:border-surface-700', color.bg, 'shadow-lg', color.glow, 'transition-all duration-500') },
    React.createElement('div', { className: 'flex flex-col items-center' },
      // SVG Circle
      React.createElement('div', { className: 'relative' },
        React.createElement('svg', { width: '180', height: '180', className: 'transform -rotate-90' },
          React.createElement('circle', { cx: '90', cy: '90', r: radius, fill: 'none', stroke: 'currentColor', strokeWidth: '8', className: 'text-surface-200 dark:text-surface-700' }),
          React.createElement('circle', {
            cx: '90', cy: '90', r: radius, fill: 'none',
            stroke: color.stroke, strokeWidth: '8',
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            strokeLinecap: 'round',
            className: 'transition-all duration-1000 ease-out',
            style: { filter: 'drop-shadow(0 0 6px ' + color.stroke + '40)' }
          })
        ),
        React.createElement('div', { className: 'absolute inset-0 flex flex-col items-center justify-center' },
          React.createElement('span', { className: cn('text-5xl font-extrabold tabular-nums', color.text) }, animScore),
          grade && React.createElement('span', { className: cn('text-lg font-bold mt-0.5', color.text) }, grade),
          React.createElement('span', { className: 'text-xs text-surface-500 dark:text-surface-400 mt-0.5' }, 'out of 100')
        )
      ),
      label && React.createElement('p', { className: 'mt-3 text-sm font-semibold text-surface-700 dark:text-surface-300 text-center' }, label),
      // Score interpretation
      React.createElement('p', { className: cn('mt-1 text-xs font-medium', color.text) },
        score >= 80 ? 'Excellent — Ready to apply!' :
        score >= 60 ? 'Good — Minor improvements needed' :
        score >= 40 ? 'Fair — Significant improvements recommended' :
        'Needs Work — Major revisions required'
      )
    )
  );
}

window.ResumeScoreCard = ResumeScoreCard;
