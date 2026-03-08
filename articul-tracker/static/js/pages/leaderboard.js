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
      <span class="slide-title">🏆 Рейтинг</span>
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
    const entries = await api.getLeaderboard();
    const maxCount = entries.length > 0 ? Math.max(...entries.map(e => e.articul_count || 0), 1) : 1;

    const rankClass = (r) => r === 1 ? 'gold' : r === 2 ? 'silver' : r === 3 ? 'bronze' : 'other';
    const rankIcon  = (r) => r === 1 ? '🥇' : r === 2 ? '🥈' : r === 3 ? '🥉' : r;

    document.getElementById('lb-body').innerHTML = `
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

    document.querySelectorAll('.lb-card').forEach(card => {
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
