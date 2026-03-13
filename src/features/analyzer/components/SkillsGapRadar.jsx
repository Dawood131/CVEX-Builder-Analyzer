/* ================================================
   SkillsGapRadar — Skills gap visualization
   (Canvas-based radar chart)
   ================================================ */
function SkillsGapRadar({ radarData }) {
  const canvasRef = React.useRef(null);
  const data = radarData || [];
  const [hovered, setHovered] = React.useState(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const size = 260;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 40;
    const n = data.length;
    const angleStep = (2 * Math.PI) / n;
    const isDark = document.documentElement.classList.contains('dark');

    ctx.clearRect(0, 0, size, size);

    // Draw grid
    for (let ring = 1; ring <= 4; ring++) {
      const r = (ring / 4) * maxR;
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.15)' : 'rgba(148,163,184,0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ring label
      if (ring % 2 === 0) {
        ctx.fillStyle = isDark ? 'rgba(148,163,184,0.4)' : 'rgba(100,116,139,0.4)';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((ring * 25) + '%', cx, cy - r - 4);
      }
    }

    // Draw axes
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxR * Math.cos(angle), cy + maxR * Math.sin(angle));
      ctx.strokeStyle = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Labels
      const labelR = maxR + 22;
      const lx = cx + labelR * Math.cos(angle);
      const ly = cy + labelR * Math.sin(angle);
      ctx.fillStyle = isDark ? '#cbd5e1' : '#334155';
      ctx.font = 'bold 9px Inter, sans-serif';
      ctx.textAlign = Math.abs(Math.cos(angle)) < 0.01 ? 'center' : Math.cos(angle) > 0 ? 'left' : 'right';
      ctx.textBaseline = Math.abs(Math.sin(angle)) < 0.01 ? 'middle' : Math.sin(angle) > 0 ? 'top' : 'bottom';
      // Word wrap for long labels
      const words = data[i].category.split(' ');
      if (words.length > 1) {
        ctx.fillText(words[0], lx, ly - 5);
        ctx.fillText(words.slice(1).join(' '), lx, ly + 5);
      } else {
        ctx.fillText(data[i].category, lx, ly);
      }
    }

    // Draw data polygon
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const idx = i % n;
      const angle = idx * angleStep - Math.PI / 2;
      const r = (data[idx].score / 100) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(99,102,241,0.3)');
    grad.addColorStop(1, 'rgba(99,102,241,0.08)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Data points
    for (let i = 0; i < n; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const r = (data[i].score / 100) * maxR;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#6366f1';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [data]);

  return React.createElement('div', { className: 'p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm' },
    React.createElement('div', { className: 'flex items-center gap-2 mb-4' },
      React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center' },
        React.createElement('i', { className: 'fas fa-radar text-indigo-600 dark:text-indigo-400 text-sm' })
      ),
      React.createElement('h3', { className: 'font-bold text-sm' }, 'Skills Gap Radar')
    ),
    // Canvas
    React.createElement('div', { className: 'flex justify-center mb-3' },
      React.createElement('canvas', { ref: canvasRef, className: 'max-w-full' })
    ),
    // Legend
    React.createElement('div', { className: 'grid grid-cols-1 gap-1.5' },
      data.map((d, i) =>
        React.createElement('div', {
          key: i,
          className: cn('flex items-center justify-between p-2 rounded-lg transition-colors cursor-default',
            hovered === i ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-surface-50 dark:hover:bg-surface-800'),
          onMouseEnter: () => setHovered(i),
          onMouseLeave: () => setHovered(null)
        },
          React.createElement('span', { className: 'text-[11px] font-medium text-surface-600 dark:text-surface-400' }, d.category),
          React.createElement('div', { className: 'flex items-center gap-2' },
            React.createElement('span', { className: 'text-[10px] text-surface-400' }, d.matched + '/' + d.total),
            React.createElement('span', { className: cn('text-xs font-bold tabular-nums',
              d.score >= 70 ? 'text-emerald-600' : d.score >= 40 ? 'text-amber-600' : 'text-red-600') }, d.score + '%')
          )
        )
      )
    )
  );
}

window.SkillsGapRadar = SkillsGapRadar;
