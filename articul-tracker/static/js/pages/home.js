import { api }               from '../api.js';
import { renderSidebar }     from '../components/sidebar.js';
import { showToast, openModal, closeModal } from '../components/modal.js';

export async function renderHome(container, user) {
  container.innerHTML = `
    <div class="page active app-layout" id="home-page">
      <div class="main-content" id="main-content"></div>
    </div>
  `;

  const page = container.querySelector('#home-page');
  const main = container.querySelector('#main-content');

  // Sidebar
  renderSidebar(page, user, () => renderHome(container, user));

  // Header
  main.innerHTML = `
    <div class="main-header">
      <div>
        <div class="greeting">Привет, <span>${user.username}</span> 👋</div>
      </div>
    </div>
    <div class="articul-panel">
      <div class="articul-panel-header">
        <span class="panel-title">Мои артикулы</span>
        <div class="flex items-center gap-8">
          <span class="panel-count" id="count-badge">0</span>
          <button class="btn-add" id="add-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="articul-list" id="articul-list">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  await loadArticuls(user.id);

  main.querySelector('#add-btn').addEventListener('click', () => showAddModal());

  async function loadArticuls(userID) {
    const list = document.getElementById('articul-list');
    try {
      const articuls = await api.listArticuls();
      document.getElementById('count-badge').textContent = articuls.length;
      if (!articuls || articuls.length === 0) {
        list.innerHTML = `
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12h6M12 9v6"/></svg>
            <p>Нет артикулов. Нажмите + чтобы добавить</p>
          </div>`;
        return;
      }
      list.innerHTML = articuls.map((a, i) => renderArticulCard(a, i)).join('');
      list.querySelectorAll('.articul-card-header').forEach(header => {
        header.addEventListener('click', () => toggleCard(header.closest('.articul-card')));
      });
    } catch(e) {
      list.innerHTML = `<p class="text-muted text-sm" style="padding:20px">${e.message}</p>`;
    }
  }

  function renderArticulCard(a, i) {
    const date = new Date(a.created_at).toLocaleDateString('ru-RU', {day:'numeric',month:'short',year:'numeric'});
    return `
      <div class="articul-card" data-id="${a.id}" style="animation-delay:${i*0.04}s">
        <div class="articul-card-header">
          <span class="articul-number"># ${a.number}</span>
          <span class="articul-date">${date}</span>
          <div class="articul-toggle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
        </div>
        <div class="articul-changes">
          <div class="articul-changes-inner" id="changes-${a.id}">
            <div class="loading" style="padding:12px"><div class="spinner" style="width:20px;height:20px;border-width:2px"></div></div>
          </div>
        </div>
      </div>`;
  }

  function toggleCard(card) {
    const wasExpanded = card.classList.contains('expanded');
    document.querySelectorAll('.articul-card.expanded').forEach(c => c.classList.remove('expanded'));
    if (!wasExpanded) {
      card.classList.add('expanded');
      loadChanges(card.dataset.id);
    }
  }

  async function loadChanges(articulID) {
    const inner = document.getElementById(`changes-${articulID}`);
    try {
      const a = await api.getArticul(articulID);
      const changes = a.changes || [];
      if (changes.length === 0) {
        inner.innerHTML = `<p class="no-changes">Изменений нет</p>
          <button class="btn btn-ghost" style="margin-top:8px;width:100%;font-size:.8rem;padding:8px" data-add-change="${articulID}">+ Добавить изменение</button>`;
      } else {
        inner.innerHTML = changes.map(c => `
          <div class="change-item">
            <div class="change-dot"></div>
            <div>
              <div class="change-desc">${c.description}</div>
              <div class="change-time">${new Date(c.changed_at).toLocaleString('ru-RU')}</div>
            </div>
          </div>`).join('') +
          `<button class="btn btn-ghost" style="margin-top:12px;width:100%;font-size:.8rem;padding:8px" data-add-change="${articulID}">+ Добавить изменение</button>`;
      }
      inner.querySelector(`[data-add-change]`)?.addEventListener('click', () => showAddChangeModal(articulID));
    } catch(e) {
      inner.innerHTML = `<p class="no-changes">${e.message}</p>`;
    }
  }

  function showAddModal() {
    const overlay = openModal(`
      <div class="form-group">
        <label class="form-label">Номер артикула</label>
        <input class="form-input" id="new-articul-num" type="text" placeholder="например: 12345-ABC" autofocus/>
      </div>
      <button class="btn btn-primary" id="confirm-add-btn" style="margin-top:8px">Добавить</button>
    `, 'Новый артикул');

    const input = overlay.querySelector('#new-articul-num');
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') overlay.querySelector('#confirm-add-btn').click(); });
    overlay.querySelector('#confirm-add-btn').addEventListener('click', async () => {
      const num = input.value.trim();
      if (!num) { showToast('Введите номер артикула', 'error'); return; }
      try {
        await api.createArticul(num);
        closeModal(overlay);
        showToast('Артикул добавлен!');
        await loadArticuls(user.id);
      } catch(e) { showToast(e.message, 'error'); }
    });
  }

  function showAddChangeModal(articulID) {
    const overlay = openModal(`
      <div class="form-group">
        <label class="form-label">Описание изменения</label>
        <input class="form-input" id="change-desc" type="text" placeholder="Опишите изменение..." autofocus/>
      </div>
      <button class="btn btn-primary" id="confirm-change-btn" style="margin-top:8px">Сохранить</button>
    `, 'Добавить изменение');

    const input = overlay.querySelector('#change-desc');
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') overlay.querySelector('#confirm-change-btn').click(); });
    overlay.querySelector('#confirm-change-btn').addEventListener('click', async () => {
      const desc = input.value.trim();
      if (!desc) { showToast('Введите описание', 'error'); return; }
      try {
        await api.addChange(articulID, desc);
        closeModal(overlay);
        showToast('Изменение сохранено!');
        loadChanges(articulID);
      } catch(e) { showToast(e.message, 'error'); }
    });
  }
}
