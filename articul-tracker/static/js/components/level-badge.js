const svgPlant = (c) => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" style="width:1.25rem;height:1.25rem"><path d="M12 22v-8M7 14l5-6 5 6"/><path d="M7 14h10"/></svg>`;
const svgGear = (c) => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" style="width:1.25rem;height:1.25rem"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`;
const svgFire = (c) => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.25rem;height:1.25rem"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
const svgDiamond = (c) => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.25rem;height:1.25rem"><path d="M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0Z"/><path d="M12 8 7 3 2 8l10 10 10-10-5-5-5 5"/></svg>`;
const svgCrown = (c) => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.25rem;height:1.25rem"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M2 4h20"/></svg>`;
const svgLightning = (c) => `<svg viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.25rem;height:1.25rem"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

export const LEVELS = [
  { number: 1, name: 'Новичок',     icon: (c) => svgPlant(c || '#69abbb'),  min: 0,    max: 299,       color: '#69abbb',  desc: '0 – 299 артикулов' },
  { number: 2, name: 'Работяга',    icon: (c) => svgGear(c || '#fcf5bc'),    min: 300,  max: 599,       color: '#fcf5bc',  desc: '300 – 599 артикулов' },
  { number: 3, name: 'Мастер',      icon: (c) => svgFire(c || '#a53080'),    min: 600,  max: 999,       color: '#a53080',  desc: '600 – 999 артикулов' },
  { number: 4, name: 'Легенда',    icon: (c) => svgDiamond(c || '#6462bb'), min: 1000, max: 1999,      color: '#6462bb',  desc: '1000 – 1999 артикулов' },
  { number: 5, name: 'Император',   icon: (c) => svgCrown(c || '#c32934'),   min: 2000, max: 4999,      color: '#c32934',  desc: '2000 – 4999 артикулов' },
  { number: 6, name: 'Бессмертный', icon: (c) => svgLightning(c || '#f5c842'), min: 5000, max: Infinity, color: '#f5c842',  desc: 'от 5000 артикулов' },
];

export function getLevel(allTimeCount) {
  return LEVELS.find(l => allTimeCount >= l.min && allTimeCount <= l.max) || LEVELS[0];
}

export function createLevelBadge(allTimeCount, openModalFn, closeModalFn) {
  const lv  = getLevel(allTimeCount || 0);
  const btn = document.createElement('button');
  btn.className = 'level-badge';
  btn.style.setProperty('--lv-color', lv.color);
  btn.innerHTML = `<span style="font-size:.65rem;opacity:.7;font-weight:400">Lv.</span><span>${lv.number}</span>`;
  btn.title = `Уровень ${lv.number} — ${lv.name}. Нажми для подробностей.`;
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    showAllLevels(allTimeCount, openModalFn);
  });
  return btn;
}

function showAllLevels(currentCount, openModalFn) {
  const html = `
    <div style="font-family:var(--font-body);font-size:.8rem;
      color:rgba(255,255,255,.45);margin-bottom:16px;line-height:1.5">
      Уровни начисляются за суммарное количество артикулов за всё время.<br/>
      Они никогда не сбрасываются.
    </div>
    ${LEVELS.map(l => {
      const isCurrent = currentCount >= l.min && currentCount <= l.max;
      return `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;
          border-radius:10px;margin-bottom:5px;
          background:${isCurrent ? 'rgba(255,255,255,.06)' : 'transparent'};
          border:1px solid ${isCurrent ? l.color+'55' : 'transparent'}">
          <span style="display:flex;align-items:center;justify-content:center;width:26px">${typeof l.icon === 'function' ? l.icon(l.color) : l.icon}</span>
          <div style="
            font-family:var(--font-display);font-size:.68rem;font-weight:700;
            color:var(--text-muted);min-width:28px">Lv.${l.number}</div>
          <div style="flex:1">
            <div style="font-family:var(--font-display);font-size:.8rem;
              font-weight:700;color:${l.color}">${l.name}</div>
            <div style="font-family:var(--font-body);font-size:.72rem;
              color:rgba(255,255,255,.38);margin-top:2px">${l.desc}</div>
          </div>
          ${isCurrent
            ? `<div style="width:7px;height:7px;border-radius:50%;
                background:${l.color};flex-shrink:0"></div>`
            : ''}
        </div>`;
    }).join('')}`;
  const overlay = openModalFn(html, 'Система уровней');
  if (overlay?.querySelector('.modal-body')) overlay.querySelector('.modal-body').style.paddingBottom = '8px';
}
