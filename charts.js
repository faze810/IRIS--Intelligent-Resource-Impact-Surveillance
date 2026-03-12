// IRIS - Charts JS (Light Theme + Fixed date labels)

const CHART_DEFAULTS = {
  color: 'rgba(26,86,219,0.75)',
  borderColor: '#1a56db',
  gridColor: 'rgba(30,60,140,0.07)',
  tickColor: '#6b7280',
  font: "'DM Sans', sans-serif"
};

// Format a timestamp string to a short readable date like "Mar 06"
function fmtLabel(ts) {
  if (!ts) return '';
  // handles "2026-03-06 21:34:36.221184" or "2026-03-06T21:34:36"
  const raw = ts.replace('T', ' ').split(' ')[0]; // "2026-03-06"
  const parts = raw.split('-');
  if (parts.length < 3) return raw;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = parseInt(parts[1], 10) - 1;
  return `${months[m]} ${parseInt(parts[2], 10)}`;
}

function baseChartOptions(title = '') {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.97)',
        borderColor: 'rgba(26,86,219,0.18)',
        borderWidth: 1,
        titleColor: '#111827',
        bodyColor: '#374151',
        titleFont: { family: "'DM Sans', sans-serif", size: 12, weight: '600' },
        bodyFont: { family: "'DM Mono', monospace", size: 13 },
        padding: 10,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      },
      title: title
        ? { display: true, text: title, color: '#6b7280', font: { size: 12, family: "'DM Sans', sans-serif" }, padding: { bottom: 10 } }
        : { display: false }
    },
    scales: {
      x: {
        grid: { color: CHART_DEFAULTS.gridColor },
        ticks: {
          color: CHART_DEFAULTS.tickColor,
          font: { family: CHART_DEFAULTS.font, size: 11 },
          maxRotation: 0,    // never rotate labels
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7
        }
      },
      y: {
        grid: { color: CHART_DEFAULTS.gridColor },
        ticks: { color: CHART_DEFAULTS.tickColor, font: { family: CHART_DEFAULTS.font, size: 11 } }
      }
    }
  };
}

function createBarChart(canvasId, labels, datasets, title = '') {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: datasets.map(d => ({
        label: d.label || '',
        data: d.data,
        backgroundColor: d.color || CHART_DEFAULTS.color,
        borderColor: d.borderColor || d.color || CHART_DEFAULTS.borderColor,
        borderWidth: 1.5, borderRadius: 6, borderSkipped: false,
      }))
    },
    options: { ...baseChartOptions(title), animation: { duration: 700 } }
  });
}

function createLineChart(canvasId, labels, datasets, title = '') {
  const ctx = document.getElementById(canvasId)?.getContext('2d');
  if (!ctx) return null;
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: datasets.map(d => ({
        label: d.label || '',
        data: d.data,
        borderColor: d.color || CHART_DEFAULTS.borderColor,
        backgroundColor: d.bg || 'rgba(26,86,219,0.06)',
        borderWidth: 2, pointRadius: 4,
        pointBackgroundColor: d.color || CHART_DEFAULTS.borderColor,
        fill: true, tension: 0.4
      }))
    },
    options: { ...baseChartOptions(title), animation: { duration: 700 } }
  });
}

function destroyChart(chart) {
  if (chart) { chart.destroy(); return null; }
  return null;
}
