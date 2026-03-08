export function renderActivityChart(container, dailyCounts) {
  // Build a 30-day map
  const map = {};
  (dailyCounts || []).forEach(d => { map[d.date] = d.count; });
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    days.push({ date: key, count: map[key] || 0, label: d.getDate() });
  }
  const max = Math.max(...days.map(d => d.count), 1);

  // Show every ~5th day label
  container.innerHTML = `
    <div class="chart-bars">
      ${days.map((d, i) => `
        <div class="chart-bar-wrap" title="${d.date}: ${d.count} арт.">
          <div class="chart-bar" style="height:${Math.max(2, (d.count/max)*80)}px;opacity:${d.count>0?0.85:0.2}"></div>
          <div class="chart-label">${(i%7===0 || i===29) ? d.label : ''}</div>
        </div>
      `).join('')}
    </div>
  `;
}
