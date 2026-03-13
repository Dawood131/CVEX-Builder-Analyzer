/* ================================================
   DownloadReport — Export analysis as PDF report
   ================================================ */
function DownloadReport({ analysisResult, showToast }) {
  const [downloading, setDownloading] = React.useState(false);

  const generateReport = async () => {
    if (!analysisResult || !window.jspdf) {
      showToast && showToast('Unable to generate report', 'error');
      return;
    }
    setDownloading(true);
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
      const pw = 210;
      const margin = 15;
      const contentW = pw - margin * 2;
      let y = margin;

      // Helper
      const addText = (text, x, yPos, opts = {}) => {
        doc.setFontSize(opts.size || 10);
        doc.setFont('helvetica', opts.style || 'normal');
        doc.setTextColor(opts.color || '#1e293b');
        const lines = doc.splitTextToSize(text, opts.maxW || contentW);
        doc.text(lines, x, yPos);
        return yPos + lines.length * (opts.size || 10) * 0.45;
      };

      const checkPage = (needed) => {
        if (y + needed > 280) { doc.addPage(); y = margin; }
      };

      // ---- Title ----
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pw, 35, 'F');
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#ffffff');
      doc.text('CVEX AI Analysis Report', margin, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(new Date(analysisResult.timestamp).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' }), margin, 27);
      doc.text('CV: ' + (analysisResult.meta?.cvName || 'Untitled'), pw - margin, 27, { align: 'right' });
      y = 45;

      // ---- Overall Score ----
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(margin, y, contentW, 25, 3, 3, 'S');
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#1e293b');
      doc.text('Overall Score', margin + 5, y + 10);
      doc.setFontSize(24);
      const scoreColor = analysisResult.overallScore >= 80 ? '#10b981' : analysisResult.overallScore >= 60 ? '#3b82f6' : analysisResult.overallScore >= 40 ? '#f59e0b' : '#ef4444';
      doc.setTextColor(scoreColor);
      doc.text(analysisResult.overallScore + '/100 (' + analysisResult.grade + ')', contentW + margin - 5, y + 16, { align: 'right' });
      y += 32;

      // ---- Score Breakdown ----
      checkPage(40);
      y = addText('Score Breakdown', margin, y, { size: 13, style: 'bold' });
      y += 3;
      const scores = [
        ['Content', analysisResult.contentScore, '30%'],
        ['ATS Compatibility', analysisResult.atsScore, '25%'],
        ['Keywords', analysisResult.keywordScore, '20%'],
        ['Formatting', analysisResult.formattingScore, '15%'],
        ['Grammar/Writing', analysisResult.grammarScore, '10%']
      ];
      scores.forEach(([label, score, weight]) => {
        checkPage(8);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor('#475569');
        doc.text(label + ' (' + weight + ')', margin + 2, y);
        doc.text(score + '%', margin + contentW - 2, y, { align: 'right' });
        // Bar background
        doc.setFillColor(226, 232, 240);
        doc.roundedRect(margin + 2, y + 2, contentW - 4, 3, 1, 1, 'F');
        // Bar fill
        const barColor = score >= 80 ? [16, 185, 129] : score >= 60 ? [59, 130, 246] : score >= 40 ? [245, 158, 11] : [239, 68, 68];
        doc.setFillColor(...barColor);
        doc.roundedRect(margin + 2, y + 2, Math.max(1, (score / 100) * (contentW - 4)), 3, 1, 1, 'F');
        y += 10;
      });
      y += 5;

      // ---- Suggestions ----
      checkPage(20);
      y = addText('Improvement Suggestions', margin, y, { size: 13, style: 'bold' });
      y += 3;
      (analysisResult.suggestions || []).forEach((s, i) => {
        checkPage(12);
        const priorityLabel = s.priority === 'high' ? '⚠ HIGH' : s.priority === 'medium' ? '⚡ MED' : 'ℹ LOW';
        y = addText((i + 1) + '. [' + priorityLabel + '] ' + s.message, margin + 2, y, { size: 9, maxW: contentW - 4 });
        y += 2;
      });
      y += 5;

      // ---- Keywords ----
      checkPage(20);
      y = addText('Keyword Analysis', margin, y, { size: 13, style: 'bold' });
      y += 3;
      const matched = (analysisResult.matchedKeywords || []).map(k => k.keyword).slice(0, 15);
      const missing = (analysisResult.missingKeywords || []).map(k => k.keyword).slice(0, 15);
      if (matched.length) {
        y = addText('✓ Matched: ' + matched.join(', '), margin + 2, y, { size: 9, color: '#059669' });
        y += 2;
      }
      if (missing.length) {
        y = addText('✗ Missing: ' + missing.join(', '), margin + 2, y, { size: 9, color: '#dc2626' });
        y += 2;
      }

      // ---- Footer ----
      const pageCount = doc.internal.getNumberOfPages();
      for (let p = 1; p <= pageCount; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor('#94a3b8');
        doc.text('Generated by CVEX AI Analyzer — cvex.app', margin, 290);
        doc.text('Page ' + p + ' of ' + pageCount, pw - margin, 290, { align: 'right' });
      }

      const filename = (analysisResult.meta?.cvName || 'cv').replace(/[^a-zA-Z0-9]/g, '_') + '_analysis.pdf';
      doc.save(filename);
      showToast && showToast('Report downloaded!', 'success');
    } catch (err) {
      console.error('Report generation error:', err);
      showToast && showToast('Failed to generate report', 'error');
    } finally {
      setDownloading(false);
    }
  };

  return React.createElement('div', { className: 'p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 shadow-sm' },
    React.createElement('div', { className: 'flex items-center gap-2 mb-3' },
      React.createElement('div', { className: 'w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center' },
        React.createElement('i', { className: 'fas fa-file-pdf text-rose-600 dark:text-rose-400 text-sm' })
      ),
      React.createElement('h3', { className: 'font-bold text-sm' }, 'Download Report')
    ),
    React.createElement('p', { className: 'text-xs text-surface-500 dark:text-surface-400 mb-4' },
      'Get a detailed PDF report with all scores, suggestions, and keyword analysis.'
    ),
    React.createElement(Button, {
      variant: 'primary',
      className: 'w-full',
      onClick: generateReport,
      disabled: downloading || !analysisResult
    },
      downloading
        ? React.createElement(React.Fragment, null,
            React.createElement('i', { className: 'fas fa-spinner fa-spin' }), ' Generating...'
          )
        : React.createElement(React.Fragment, null,
            React.createElement('i', { className: 'fas fa-download' }), ' Download PDF Report'
          )
    ),
    // Pro upsell
    React.createElement('div', { className: 'mt-3 p-3 rounded-xl bg-gradient-to-r from-brand-50 to-purple-50 dark:from-brand-900/20 dark:to-purple-900/20 border border-brand-200 dark:border-brand-800' },
      React.createElement('div', { className: 'flex items-center gap-2' },
        React.createElement('i', { className: 'fas fa-crown text-amber-500' }),
        React.createElement('span', { className: 'text-[11px] font-semibold text-brand-700 dark:text-brand-300' }, 'Pro: Get detailed section-by-section analysis reports')
      )
    )
  );
}

window.DownloadReport = DownloadReport;
