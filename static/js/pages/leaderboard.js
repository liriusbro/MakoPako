import { api } from '../api.js';
import { openProfilePage } from './profile.js';

export async function openLeaderboardPage(selfUser) {
  const page = document.createElement('div');
  page.className = 'slide-page';
  document.body.appendChild(page);
  requestAnimationFrame(() => page.classList.add('open'));

  page.innerHTML = `
    <div class="slide-header">
      <button class="slide-back" id="lb-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="slide-title">Рейтинг</span>
    </div>
    <div id="lb-body">
      <div class="loading"><div class="spinner"></div></div>
    </div>
  `;

  page.querySelector('#lb-back').addEventListener('click', () => {
    page.classList.remove('open');
    setTimeout(() => page.remove(), 400);
  });

  try {
    const [entries, leaders] = await Promise.all([
      api.getLeaderboard(),
      api.getSeasonalLeaders().catch(() => ({})),
    ]);
    const maxCount = entries.length > 0 ? Math.max(...entries.map(e => e.articul_count || 0), 1) : 1;

    const lbBody = document.getElementById('lb-body');
    lbBody.innerHTML = '';

    renderSeasonalSection(lbBody, leaders, selfUser);

    const rankClass = (r) => r === 1 ? 'gold' : r === 2 ? 'silver' : r === 3 ? 'bronze' : 'other';
    const rankIcon  = (r) => r;

    const listSection = document.createElement('div');
    listSection.className = 'leaderboard-list-wrap';
    listSection.innerHTML = `
      <div class="leaderboard-list">
        ${entries.map((e, i) => {
          const initials = (e.user.username||'?').slice(0,2).toUpperCase();
          const avatarContent = e.user.avatar_url
            ? `<img src="${e.user.avatar_url}" alt="av"/>`
            : initials;
          const count = e.articul_count || 0;
          return `
            <div class="lb-card" data-uid="${e.user.id}" style="animation-delay:${i*0.05}s">
              <div class="lb-rank ${rankClass(e.rank)}">${rankIcon(e.rank)}</div>
              <div class="lb-avatar">${avatarContent}</div>
              <div class="lb-info">
                <div class="lb-name">${e.user.username}${e.user.id === selfUser.id ? ' <span style="font-size:.7rem;color:var(--primary)">(ты)</span>' : ''}</div>
                <div class="lb-count">${count} артикулов</div>
              </div>
              <div class="lb-bar-wrap">
                <div class="lb-bar" style="width:${Math.max(4,(count/maxCount)*100)}%"></div>
              </div>
            </div>`;
        }).join('')}
      </div>`;

    lbBody.appendChild(listSection);

    listSection.querySelectorAll('.lb-card').forEach(card => {
      card.addEventListener('click', async () => {
        const uid = card.dataset.uid;
        const entry = entries.find(e => e.user.id === uid);
        if (!entry) return;
        const isOwn = entry.user.id === selfUser.id;
        openProfilePage(entry.user, selfUser, isOwn, null);
      });
    });
  } catch(e) {
    document.getElementById('lb-body').innerHTML = `<p class="text-muted text-sm" style="padding:24px">${e.message}</p>`;
  }
}

function renderSeasonalSection(container, leaders, selfUser) {
  const daySvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="seasonal-icon"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
  const weekSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="seasonal-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const monthSvg = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="seasonal-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const items = [
    { icon: daySvg, label: 'Лидер дня',    data: leaders?.day_leader,   color: 'var(--accent-y)' },
    { icon: weekSvg, label: 'Лидер недели', data: leaders?.week_leader,  color: 'var(--primary)' },
    { icon: monthSvg, label: 'Лидер месяца', data: leaders?.month_leader, color: 'var(--accent-p)' },
  ];

  const section = document.createElement('div');
  section.style.cssText = 'padding:16px 16px 8px;border-bottom:1px solid var(--border);';
  section.innerHTML = `
    <div style="font-family:var(--font-display);font-size:.62rem;color:var(--primary);letter-spacing:.1em;margin-bottom:10px">СЕЗОННЫЙ РЕЙТИНГ</div>
    ${items.map(item => {
      if (!item.data) return `
        <div class="seasonal-card" style="--sc:#888">
          <span style="font-size:1.2rem;width:26px;text-align:center">${item.icon}</span>
          <div>
            <div style="font-family:var(--font-body);font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">${item.label}</div>
            <div style="font-family:var(--font-body);font-size:.8rem;color:var(--text-muted);font-style:italic">Нет данных</div>
          </div>
        </div>`;
      const av = item.data.user?.avatar_url;
      const init = (item.data.user?.username || '?').slice(0, 2).toUpperCase();
      return `
        <div class="seasonal-card" style="--sc:${item.color}" data-uid="${item.data.user?.id}">
          <span style="font-size:1.2rem;width:26px;text-align:center">${item.icon}</span>
          <div class="lb-avatar" style="border-color:${item.color};width:34px;height:34px;min-width:34px;font-size:.75rem">
            ${av ? `<img src="${av}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : init}
          </div>
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font-body);font-size:.68rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:.06em">${item.label}</div>
            <div style="font-family:var(--font-display);font-size:.82rem;font-weight:700;color:${item.color};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
              ${item.data.user?.username || '?'}${item.data.user?.id === selfUser?.id ? ' (ты)' : ''}
            </div>
          </div>
          <div style="font-family:var(--font-display);font-size:1rem;font-weight:700;color:${item.color};flex-shrink:0">${item.data.count}</div>
        </div>`;
    }).join('')}`;
  container.prepend(section);

  section.querySelectorAll('.seasonal-card[data-uid]').forEach(card => {
    card.addEventListener('click', async () => {
      const uid = card.dataset.uid;
      if (!uid) return;
      const user = await api.getUser(uid);
      openProfilePage(user, selfUser, uid === selfUser?.id, null);
    });
  });
}
