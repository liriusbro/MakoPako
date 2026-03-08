import { api } from '../api.js';
import { openModal, closeModal } from '../components/modal.js';

const svgLightning = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.6rem;height:1.6rem"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
const svgLink = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.6rem;height:1.6rem"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
const svgFire = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.6rem;height:1.6rem"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>';
const svgStar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.6rem;height:1.6rem"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
const svgCrown = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.6rem;height:1.6rem"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><path d="M2 4h20"/></svg>';
const svgMedal = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1.2rem;height:1.2rem;vertical-align:middle;margin-right:6px"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>';
const svgCheck = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:1rem;height:1rem;color:var(--accent-y)"><polyline points="20 6 9 17 4 12"/></svg>';
const svgLock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:1rem;height:1rem;opacity:.25"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

const ALL_ACHIEVEMENTS = [
  { key: 'daily_20',  icon: svgLightning, name: 'День работяги',       desc: 'Сделать 20 артикулов за один день', type: 'daily',  target: 20 },
  { key: 'streak_2',  icon: svgLink,     name: 'Начало серии',         desc: '2 дня подряд',                      type: 'streak', target: 2  },
  { key: 'streak_3',  icon: svgLightning, name: 'Три в ряд',            desc: '3 дня подряд',                      type: 'streak', target: 3  },
  { key: 'streak_5',  icon: svgFire,     name: 'Пятидневка',           desc: '5 дней подряд',                     type: 'streak', target: 5  },
  { key: 'streak_7',  icon: svgStar,     name: 'Неделя силы',           desc: '7 дней подряд',                     type: 'streak', target: 7  },
  { key: 'streak_14', icon: svgStar,     name: 'Две недели',            desc: '14 дней подряд',                    type: 'streak', target: 14 },
  { key: 'streak_30', icon: svgCrown,    name: 'Месяц без остановок',   desc: '30 дней подряд',                    type: 'streak', target: 30 },
];

export async function openAchievementsPage() {
  const page = document.createElement('div');
  page.className = 'slide-page';
  document.body.appendChild(page);
  requestAnimationFrame(() => page.classList.add('open'));

  page.innerHTML = `
    <div class="slide-header">
      <button class="slide-back" id="ach-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="slide-title">${svgMedal}Достижения</span>
    </div>
    <div id="ach-body" style="padding:16px">
      <div class="loading"><div class="spinner"></div></div>
    </div>`;

  page.querySelector('#ach-back').addEventListener('click', () => {
    page.classList.remove('open');
    setTimeout(() => page.remove(), 400);
  });

  try {
    const [achList, progress] = await Promise.all([
      api.getAchievements(),
      api.getDailyProgress(),
    ]);
    const unlockedKeys = new Set((achList || []).map(a => a.achievement_key));
    const body = page.querySelector('#ach-body');

    body.innerHTML = `
      <div class="profile-section" style="margin-bottom:16px">
        <div class="section-title">Сегодня</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <span style="font-family:var(--font-body);font-size:.85rem">Дневная цель</span>
          <span style="font-family:var(--font-display);font-weight:700;color:var(--primary)">${progress.today_count} / 20</span>
        </div>
        <div style="height:8px;background:var(--surface-2);border-radius:8px;overflow:hidden">
          <div style="height:100%;width:${Math.min(100,(progress.today_count/20)*100)}%;
            background:linear-gradient(90deg,var(--primary),var(--accent-p));
            border-radius:8px;transition:width .6s var(--ease-out)"></div>
        </div>
        <div style="margin-top:10px;font-family:var(--font-body);font-size:.78rem;color:var(--text-muted);display:flex;gap:16px;flex-wrap:wrap">
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:.9rem;height:.9rem;vertical-align:middle;margin-right:4px;color:var(--accent-y)"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>Серия: <strong style="color:var(--accent-y)">${progress.streak} дней</strong></span>
          <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:.9rem;height:.9rem;vertical-align:middle;margin-right:4px;color:var(--primary)"><path d="M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M6 3h12v6a6 6 0 0 1-12 0V3z"/><path d="M12 15v6M8 21h8"/></svg>Рекорд дня: <strong style="color:var(--primary)">${progress.personal_best} арт.</strong>
            ${progress.personal_best_date ? `<span style="color:rgba(255,255,255,.35);font-size:.7rem">(${new Date(progress.personal_best_date+'T00:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short',year:'numeric'})})</span>` : ''}
          </span>
        </div>
      </div>

      <div class="section-title" style="padding-bottom:12px">Все достижения</div>
      ${ALL_ACHIEVEMENTS.map((a, i) => {
        const unlocked = unlockedKeys.has(a.key);
        let progressHTML = '';
        if (!unlocked) {
          const cur = a.type === 'streak' ? progress.streak : progress.today_count;
          const pct = Math.min(100, (cur / a.target) * 100);
          progressHTML = `
            <div style="height:3px;background:var(--surface-2);border-radius:3px;overflow:hidden;margin-top:7px">
              <div style="height:100%;width:${pct}%;
                background:${a.type === 'streak' ? 'var(--secondary)' : 'var(--primary)'};
                border-radius:3px;transition:width .5s var(--ease-out)"></div>
            </div>
            <div style="font-size:.7rem;color:var(--text-muted);margin-top:3px">${cur} / ${a.target}${a.type === 'streak' ? ' дней' : ' арт.'}</div>`;
        }
        return `
          <div class="achievement-card ${unlocked ? 'unlocked' : 'locked'}" style="animation-delay:${i * 0.05}s">
            <div style="display:flex;align-items:center;${unlocked ? 'color:var(--accent-y)' : 'filter:grayscale(1);opacity:.35;color:var(--text-muted)'}">${a.icon}</div>
            <div style="flex:1">
              <div style="font-family:var(--font-display);font-size:.78rem;font-weight:700;
                ${unlocked ? 'color:var(--accent-y)' : 'color:var(--text-muted)'}">${a.name}</div>
              <div style="font-family:var(--font-body);font-size:.74rem;color:var(--text-muted);margin-top:2px">${a.desc}</div>
              ${progressHTML}
            </div>
            <div style="font-size:.95rem;display:flex;align-items:center">${unlocked ? svgCheck : svgLock}</div>
          </div>`;
      }).join('')}`;
  } catch(e) {
    page.querySelector('#ach-body').innerHTML = `<p class="text-muted text-sm" style="padding:20px">${e.message}</p>`;
  }
}
