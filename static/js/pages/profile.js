import { api } from '../api.js';
import { showToast } from '../components/modal.js';
import { renderActivityChart } from '../components/chart.js';
import { createLevelBadge } from '../components/level-badge.js';
import { openModal, closeModal } from '../components/modal.js';
import { exportUserArticuls } from '../components/export.js';

export async function openProfilePage(viewingUser, selfUser, isOwnProfile, onUpdate) {
  const page = document.createElement('div');
  page.className = 'slide-page';
  document.body.appendChild(page);
  requestAnimationFrame(() => page.classList.add('open'));

  page.innerHTML = `
    <div class="slide-header">
      <button class="slide-back" id="profile-back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
      </button>
      <span class="slide-title">${isOwnProfile ? 'Мой профиль' : viewingUser.username}</span>
    </div>
    <div class="profile-content" id="profile-body">
      <div class="loading"><div class="spinner"></div></div>
    </div>
  `;

  page.querySelector('#profile-back').addEventListener('click', () => {
    page.classList.remove('open');
    setTimeout(() => page.remove(), 400);
  });

  await loadProfile();

  async function loadProfile() {
    const body = page.querySelector('#profile-body');
    try {
      const [stats, articuls] = await Promise.all([
        api.getUserStats(viewingUser.id),
        api.getUserArticuls(viewingUser.id),
      ]);

      let compareHTML = '';
      if (!isOwnProfile) {
        const myStats = await api.getMyStats();
        const myCount = myStats.total_articuls || 0;
        const theirCount = stats.total_articuls || 0;
        const maxVal = Math.max(myCount, theirCount, 1);
        compareHTML = `
          <div class="compare-card">
            <div class="compare-title">Сравнение с тобой</div>
            <div class="compare-row">
              <div class="compare-label">Ты</div>
              <div class="compare-bar-wrap"><div class="compare-bar me" style="width:${(myCount/maxVal)*100}%"></div></div>
              <div class="compare-val">${myCount}</div>
            </div>
            <div class="compare-row">
              <div class="compare-label">${viewingUser.username}</div>
              <div class="compare-bar-wrap"><div class="compare-bar them" style="width:${(theirCount/maxVal)*100}%"></div></div>
              <div class="compare-val">${theirCount}</div>
            </div>
          </div>`;
      }

      const initials = (viewingUser.username || '?').slice(0,2).toUpperCase();
      const avatarContent = viewingUser.avatar_url
        ? `<img src="${viewingUser.avatar_url}" alt="avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
        : initials;

      body.innerHTML = `
        <div class="profile-hero">
          <div class="avatar-container" ${isOwnProfile ? 'id="avatar-click"' : ''} style="${isOwnProfile ? 'cursor:pointer' : 'cursor:default'}">
            <div class="avatar">${avatarContent}</div>
            ${isOwnProfile ? '<div class="avatar-edit-badge"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>'
             : ''}
          </div>
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;justify-content:center" id="profile-username-row">
            <span class="profile-username">${viewingUser.username}</span>
          </div>
          <div class="profile-since">С нами с ${new Date(viewingUser.created_at).toLocaleDateString('ru-RU', {month:'long',year:'numeric'})}</div>
          <div class="profile-stat">
            <div class="stat-num">${stats.total_articuls || 0}</div>
            <div class="stat-label">Артикулов создано</div>
          </div>
          ${isOwnProfile ? `<button class="btn-export" id="export-btn" style="margin-top:12px">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
            Экспорт артикулов
          </button>` : ''}
        </div>

        ${compareHTML}

        <div class="profile-section">
          <div class="section-title">Активность (30 дней)</div>
          <div id="activity-chart" class="chart-container"></div>
        </div>

        <div class="profile-section">
          <div class="section-title">История по месяцам</div>
          <div id="history-container-${viewingUser.id}"></div>
        </div>

        <div class="profile-section">
          <div class="section-title">История артикулов</div>
          ${articuls && articuls.length > 0
            ? articuls.map(a => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                  <span style="font-family:var(--font-display);font-weight:600;font-size:.85rem;color:var(--primary)"># ${a.number}</span>
                  <span style="font-size:.75rem;color:var(--text-muted)">${new Date(a.created_at).toLocaleDateString('ru-RU')}</span>
                </div>`).join('')
            : '<p class="text-muted text-sm">Нет артикулов</p>'}
        </div>

        ${isOwnProfile ? renderEditSection() : ''}
      `;

      renderActivityChart(body.querySelector('#activity-chart'), stats.daily_counts);

      const badge = createLevelBadge(stats.all_time_count || 0, openModal, closeModal);
      badge.style.marginLeft = '8px';
      badge.style.verticalAlign = 'middle';
      body.querySelector('#profile-username-row').appendChild(badge);

      renderMonthlyHistory(body.querySelector(`#history-container-${viewingUser.id}`), viewingUser.id);

      if (isOwnProfile) {
        body.querySelector('#export-btn')?.addEventListener('click', async () => {
          const ok = await exportUserArticuls(api, viewingUser.id, viewingUser.username);
          showToast(ok ? 'Экспорт готов!' : 'Нет артикулов для экспорта');
        });
        bindEditActions(body, viewingUser, onUpdate, page);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        body.querySelector('#avatar-click').addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', async () => {
          const file = fileInput.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              await api.updateAvatar(e.target.result);
              showToast('Аватар обновлён!');
              if (onUpdate) onUpdate();
              viewingUser.avatar_url = e.target.result;
              await loadProfile();
            } catch(err) { showToast(err.message, 'error'); }
          };
          reader.readAsDataURL(file);
        });
      }
    } catch(e) {
      body.innerHTML = `<p class="text-muted text-sm" style="padding:24px">${e.message}</p>`;
    }
  }
}

function renderEditSection() {
  return `
    <div class="profile-section">
      <div class="section-title">Настройки</div>
      <div class="form-group">
        <label class="form-label">Новое имя пользователя</label>
        <input class="form-input" id="new-username" type="text" placeholder="username"/>
      </div>
      <button class="btn btn-primary" id="save-username-btn" style="margin-bottom:20px">Сохранить имя</button>
      <div class="divider"></div>
      <div class="form-group" style="margin-top:16px">
        <label class="form-label">Старый пароль</label>
        <input class="form-input" id="old-password" type="password" placeholder="••••••"/>
      </div>
      <div class="form-group">
        <label class="form-label">Новый пароль</label>
        <input class="form-input" id="new-password" type="password" placeholder="••••••"/>
      </div>
      <button class="btn btn-primary" id="save-password-btn">Сменить пароль</button>
    </div>`;
}

async function renderMonthlyHistory(container, userID) {
  if (!container) return;
  try {
    const months = await api.getUserHistory(userID);
    if (!months || months.length === 0) {
      container.innerHTML = '<p class="text-muted text-sm">История пока пуста — она появится после первого сброса в начале месяца.</p>';
      return;
    }
    const monthNames = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
    container.innerHTML = `
      <div class="month-scroll" id="month-chips">
        ${months.map(m => `
          <button class="month-chip" data-year="${m.year}" data-month="${m.month}">
            <span class="month-chip-name">${monthNames[m.month-1]} ${m.year}</span>
            <span class="month-chip-count">${m.count}</span>
          </button>`).join('')}
      </div>
      <div id="month-detail-view"></div>`;

    container.querySelectorAll('.month-chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        container.querySelectorAll('.month-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        const detail = container.querySelector('#month-detail-view');
        detail.innerHTML = '<div class="loading" style="padding:16px"><div class="spinner"></div></div>';
        const entries = await api.getUserHistoryMonth(userID, chip.dataset.year, chip.dataset.month);
        if (!entries || entries.length === 0) {
          detail.innerHTML = '<p class="text-muted text-sm" style="padding:8px 0">Нет данных за этот месяц.</p>';
          return;
        }
        detail.innerHTML = entries.map((e, i) => `
          <div class="history-row" style="animation-delay:${i * 0.025}s">
            <span class="history-num">${i + 1}.</span>
            <span class="history-articul"># ${e.articul_number}</span>
            <span class="history-time">${new Date(e.created_at).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}</span>
          </div>`).join('');
      });
    });
  } catch(e) {
    container.innerHTML = `<p class="text-muted text-sm">${e.message}</p>`;
  }
}

function bindEditActions(body, user, onUpdate, page) {
  body.querySelector('#save-username-btn')?.addEventListener('click', async () => {
    const val = body.querySelector('#new-username').value.trim();
    if (!val) { showToast('Введите имя', 'error'); return; }
    try {
      await api.updateUsername(val);
      showToast('Имя обновлено!');
      user.username = val;
      if (onUpdate) onUpdate();
    } catch(e) { showToast(e.message, 'error'); }
  });

  body.querySelector('#save-password-btn')?.addEventListener('click', async () => {
    const old_ = body.querySelector('#old-password').value;
    const new_ = body.querySelector('#new-password').value;
    if (!old_ || !new_) { showToast('Заполните оба поля', 'error'); return; }
    try {
      await api.changePassword(old_, new_);
      showToast('Пароль изменён!');
      body.querySelector('#old-password').value = '';
      body.querySelector('#new-password').value = '';
    } catch(e) { showToast(e.message, 'error'); }
  });
}
