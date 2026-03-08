import { openProfilePage }      from '../pages/profile.js';
import { openLeaderboardPage }  from '../pages/leaderboard.js';
import { api }                  from '../api.js';
import { renderAuth }           from '../pages/auth.js';
import { showToast }            from './modal.js';

export function renderSidebar(container, user, onRefresh) {
  const initials = (user.username || '?').slice(0,2).toUpperCase();
  const avatarContent = user.avatar_url
    ? `<img src="${user.avatar_url}" alt="avatar"/>`
    : initials;

  const sidebar = document.createElement('div');
  sidebar.className = 'sidebar';
  sidebar.innerHTML = `
    <button class="sidebar-btn" id="sb-profile" title="Профиль">
      <div style="width:36px;height:36px;border-radius:50%;background:rgba(105,171,187,0.2);border:2px solid var(--primary);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:.8rem;color:var(--primary);overflow:hidden">
        ${user.avatar_url ? `<img src="${user.avatar_url}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>` : initials}
      </div>
    </button>
    <button class="sidebar-btn" id="sb-leaderboard" title="Рейтинг">
      ${iconTrophy()}
    </button>
    <div class="sidebar-spacer"></div>
    <button class="sidebar-btn" id="sb-logout" title="Выйти">
      ${iconLogout()}
    </button>
  `;

  container.appendChild(sidebar);

  sidebar.querySelector('#sb-profile').addEventListener('click', () => {
    openProfilePage(user, user, true, onRefresh);
  });

  sidebar.querySelector('#sb-leaderboard').addEventListener('click', () => {
    openLeaderboardPage(user);
  });

  sidebar.querySelector('#sb-logout').addEventListener('click', async () => {
    await api.logout();
    showToast('До свидания!');
    const app = document.getElementById('app');
    const { renderAuth: ra } = await import('../pages/auth.js');
    ra(app);
  });
}

function iconTrophy() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 9H4a2 2 0 0 1-2-2V5h4M18 9h2a2 2 0 0 0 2-2V5h-4"/>
    <path d="M6 3h12v6a6 6 0 0 1-12 0V3z"/>
    <path d="M12 15v6M8 21h8"/>
  </svg>`;
}

function iconLogout() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>`;
}
