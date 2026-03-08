import { api }               from '../api.js';
import { renderSidebar }     from '../components/sidebar.js';
import { showToast, openModal, closeModal } from '../components/modal.js';
import { showPersonalRecordCelebration } from '../components/confetti.js';
import {
  getFolders, createFolder, renameFolder, deleteFolder,
  addArticulToFolder, removeArticulFromFolder
} from '../components/folders.js';

export async function renderHome(container, user) {
  let activeFolderID = null;
  let allArticuls = [];
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
        <div class="artix-brand">Artix</div>
      </div>
    </div>
    <div class="articul-panel">
      <div class="articul-panel-header">
        <span class="panel-title">Мои артикулы</span>
        <div class="flex items-center gap-8">
          <span class="panel-count" id="count-badge">0</span>
          <button class="btn-folder" id="folder-btn" title="Папки">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </button>
          <button class="btn-add" id="add-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
      <div id="panel-folder-title" class="articul-panel-toolbar" style="display:none;padding:8px 20px 0;font-family:var(--font-display);font-size:.8rem;font-weight:700;color:var(--secondary);letter-spacing:.03em"></div>
      <div class="articul-panel-toolbar" style="padding:10px 12px 0">
        <div style="position:relative">
          <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:15px;height:15px;color:var(--text-muted);pointer-events:none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input id="articul-search" class="form-input" style="padding-left:38px;padding-top:10px;padding-bottom:10px;font-size:.875rem" placeholder="Поиск по артикулу или комментарию…"/>
        </div>
      </div>
      <div class="articul-list" id="articul-list">
        <div class="loading"><div class="spinner"></div></div>
      </div>
    </div>
  `;

  await renderArticulList(user.id);

  main.querySelector('#add-btn').addEventListener('click', () => {
    const currentFolderID = activeFolderID;
    showAddModal(currentFolderID);
  });
  main.querySelector('#folder-btn').addEventListener('click', () => openFolderDrawer(user.id, allArticuls));
  document.getElementById('articul-search')?.addEventListener('input', () => renderArticulList(user.id));

  async function renderArticulList(userID, options = {}) {
    const newArticul = options.newArticul || options.mergeArticul;
    const list = document.getElementById('articul-list');
    const titleEl = document.getElementById('panel-folder-title');
    const countEl = document.getElementById('count-badge');
    if (!newArticul) list.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    try {
      const fetched = await api.listArticuls();
      if (newArticul && !fetched.some(a => a.id === newArticul.id)) {
        allArticuls = [newArticul, ...fetched];
      } else {
        allArticuls = fetched;
      }
    } catch(e) {
      if (newArticul) {
        allArticuls = [newArticul, ...allArticuls];
      } else {
        list.innerHTML = `<p class="text-muted text-sm" style="padding:20px">${e.message}</p>`;
        return;
      }
    }
    let displayed = allArticuls;
    if (activeFolderID !== null) {
      const folders = getFolders(userID);
      const folder = folders.find(f => f.id === activeFolderID);
      if (folder) {
        displayed = allArticuls.filter(a => folder.articulIDs.includes(a.id));
        if (titleEl) { titleEl.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:6px"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>${escapeHtml(folder.name)}`; titleEl.style.display = 'inline'; }
      } else {
        activeFolderID = null;
      }
    } else {
      if (titleEl) titleEl.style.display = 'none';
    }
    const searchVal = document.getElementById('articul-search')?.value?.trim().toLowerCase() || '';
    if (searchVal) {
      displayed = displayed.filter(a =>
        a.number.toLowerCase().includes(searchVal) ||
        (a.comment && a.comment.toLowerCase().includes(searchVal))
      );
    }
    countEl.textContent = displayed.length;
    if (displayed.length === 0) {
      const emptyIcon = activeFolderID
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>'
        : searchVal
          ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-state-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
      list.innerHTML = `
        <div class="empty-state">
          ${emptyIcon}
          <p>${activeFolderID ? 'Папка пуста. Используйте кнопку + в шапке, чтобы добавить артикул.' : searchVal ? 'Ничего не найдено' : 'Нет артикулов. Нажмите + в шапке, чтобы добавить'}</p>
        </div>`;
      return;
    }
    list.innerHTML = displayed.map((a, i) => renderArticulCard(a, i)).join('');
    list.querySelectorAll('.articul-card-header').forEach(header => {
      header.addEventListener('click', () => toggleCard(header.closest('.articul-card')));
    });
  }

  function openCreateFolderModal(userID, articuls, parentOverlay) {
    const subOverlay = openModal(`
      <div style="text-align:center;margin-bottom:20px">
        <div style="font-family:var(--font-display);font-size:1rem;font-weight:700;
          color:var(--text);margin-bottom:6px">Новая папка</div>
        <div style="font-family:var(--font-body);font-size:.82rem;color:var(--text-muted)">
          Придумайте название для папки
        </div>
      </div>
      <div class="form-group">
        <input id="create-folder-name" class="form-input"
          placeholder="Название папки…" autocomplete="off" spellcheck="false"/>
      </div>
      <button class="btn btn-primary" id="confirm-create-folder"
        style="margin-top:4px;letter-spacing:.04em">
        Создать
      </button>
    `, '');

    const input = subOverlay.querySelector('#create-folder-name');
    requestAnimationFrame(() => input.focus());

    const doCreate = () => {
      const name = input.value.trim();
      if (!name) { showToast('Введите название папки', 'error'); return; }
      createFolder(userID, name);
      closeModal(subOverlay);
      closeModal(parentOverlay);
      openFolderDrawer(userID, articuls);
      showToast(`Папка "${name}" создана`);
    };

    subOverlay.querySelector('#confirm-create-folder').addEventListener('click', doCreate);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') doCreate(); });
  }

  function openFolderDrawer(userID, articuls) {
    const folders = getFolders(userID);
    const overlay = openModal(`
      <div style="display:flex;align-items:center;justify-content:space-between;
        margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border)">
        <span style="font-family:var(--font-display);font-size:.8rem;font-weight:700;
          color:var(--text-muted);letter-spacing:.08em;text-transform:uppercase">Мои папки</span>
        <button id="open-create-folder-btn" style="
          width:32px;height:32px;border-radius:50%;background:var(--accent-p);
          border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:1.3rem;line-height:1;transition:all .2s var(--spring);
          -webkit-tap-highlight-color:transparent" title="Создать папку">+</button>
      </div>
      <div id="folder-list-wrap">
        <div class="folder-row ${activeFolderID === null ? 'active' : ''}" data-fid="__all__" style="margin-bottom:6px">
          <span class="folder-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg></span>
          <span class="folder-row-name">Все артикулы</span>
          <span class="folder-row-count">${articuls.length}</span>
        </div>
        ${folders.map(f => `
          <div class="folder-row ${activeFolderID === f.id ? 'active' : ''}" data-fid="${f.id}">
            <span class="folder-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
            <span class="folder-row-name">${escapeHtml(f.name)}</span>
            <span class="folder-row-count">${f.articulIDs.length}</span>
            <button class="folder-rename-btn" data-fid="${f.id}" title="Переименовать"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="folder-delete-btn" data-fid="${f.id}" title="Удалить"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg></button>
          </div>`).join('')}
      </div>
    `, '');
    overlay.querySelectorAll('.folder-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.folder-rename-btn') || e.target.closest('.folder-delete-btn')) return;
        const fid = row.dataset.fid;
        activeFolderID = fid === '__all__' ? null : fid;
        closeModal(overlay);
        renderArticulList(userID);
      });
    });
    overlay.querySelectorAll('.folder-rename-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fid = btn.dataset.fid;
        const f = getFolders(userID).find(f => f.id === fid);
        const row = btn.closest('.folder-row');
        const nameEl = row.querySelector('.folder-row-name');
        const input = document.createElement('input');
        input.className = 'form-input';
        input.value = f.name;
        input.style.cssText = 'flex:1;padding:6px 10px;font-size:.85rem;width:140px';
        nameEl.replaceWith(input);
        input.focus();
        const save = () => {
          const newName = input.value.trim();
          if (newName) renameFolder(userID, fid, newName);
          closeModal(overlay);
          openFolderDrawer(userID, allArticuls);
        };
        input.addEventListener('blur', save);
        input.addEventListener('keydown', e => { if (e.key === 'Enter') save(); });
      });
    });
    overlay.querySelector('#open-create-folder-btn').addEventListener('click', () => {
      openCreateFolderModal(userID, allArticuls, overlay);
    });
    const createBtn = overlay.querySelector('#open-create-folder-btn');
    createBtn.addEventListener('mouseenter', () => createBtn.style.transform = 'scale(1.12) rotate(90deg)');
    createBtn.addEventListener('mouseleave', () => createBtn.style.transform = '');

    overlay.querySelectorAll('.folder-delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fid = btn.dataset.fid;
        const folder = getFolders(userID).find(f => f.id === fid);
        const folderName = folder ? folder.name : '';

        const confirmOverlay = openModal(`
          <div style="text-align:center;padding:4px 0 8px">
            <div style="margin-bottom:14px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:48px;height:48px;color:var(--primary)"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
            <div style="font-family:var(--font-display);font-size:.9rem;font-weight:700;
              color:var(--accent-y);margin-bottom:10px">Удалить папку?</div>
            <div style="font-family:var(--font-body);font-size:.83rem;
              color:rgba(255,255,255,.6);margin-bottom:20px;line-height:1.5">
              Папка <strong style="color:var(--primary)">"${escapeHtml(folderName)}"</strong>
              будет удалена.<br/>Артикулы внутри <strong>не удаляются</strong>.
            </div>
            <div style="display:flex;gap:10px">
              <button class="btn btn-ghost" id="cancel-del-folder"
                style="flex:1;padding:11px">Отмена</button>
              <button class="btn btn-danger" id="confirm-del-folder"
                style="flex:1;padding:11px">Удалить</button>
            </div>
          </div>
        `, '');

        confirmOverlay.querySelector('#cancel-del-folder').addEventListener('click',
          () => closeModal(confirmOverlay));

        confirmOverlay.querySelector('#confirm-del-folder').addEventListener('click', () => {
          deleteFolder(userID, fid);
          if (activeFolderID === fid) activeFolderID = null;
          closeModal(confirmOverlay);
          closeModal(overlay);
          openFolderDrawer(userID, allArticuls);
          showToast('Папка удалена');
        });
      });
    });
  }

  function showFolderPickerModal(userID, articulID, currentFolderID, onDone) {
    const folders = getFolders(userID);
    if (folders.length === 0) {
      showToast('Сначала создайте папку', 'error');
      return;
    }
    const overlay = openModal(
      folders.map(f => `
        <div class="folder-row ${f.id === currentFolderID ? 'active' : ''}" data-fid="${f.id}" style="cursor:pointer">
          <span class="folder-row-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span>
          <span class="folder-row-name">${escapeHtml(f.name)}</span>
          <span class="folder-row-count">${f.articulIDs.length} арт.</span>
        </div>`).join(''),
      'Выбрать папку'
    );
    overlay.querySelectorAll('.folder-row[data-fid]').forEach(row => {
      row.addEventListener('click', () => {
        const fid = row.dataset.fid;
        folders.forEach(f => removeArticulFromFolder(userID, f.id, articulID));
        addArticulToFolder(userID, fid, articulID);
        closeModal(overlay);
        if (onDone) onDone();
      });
    });
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

  function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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
              <div class="change-desc">${escapeHtml(c.description)}</div>
              <div class="change-time">${new Date(c.changed_at).toLocaleString('ru-RU')}</div>
            </div>
          </div>`).join('') +
          `<button class="btn btn-ghost" style="margin-top:12px;width:100%;font-size:.8rem;padding:8px" data-add-change="${articulID}">+ Добавить изменение</button>`;
      }
      inner.querySelector(`[data-add-change]`)?.addEventListener('click', () => showAddChangeModal(articulID));

      const isOwner = a.user_id === user.id;
      const hasComment = a.comment && a.comment.trim().length > 0;
      const commentSection = document.createElement('div');
      commentSection.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.06)';
      commentSection.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <span style="font-family:var(--font-display);font-size:.68rem;font-weight:700;
            color:var(--secondary);letter-spacing:.07em;text-transform:uppercase">Комментарий</span>
          ${isOwner ? `<button class="comment-edit-btn" data-id="${a.id}" title="Редактировать комментарий"
            style="background:transparent;border:1px solid var(--border);border-radius:8px;
            padding:4px 10px;color:var(--text-muted);font-family:var(--font-body);font-size:.72rem;
            cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;gap:4px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:11px;height:11px"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Изменить</button>` : ''}
        </div>
        <div id="comment-text-${a.id}" style="font-family:var(--font-body);font-size:.85rem;
          color:${hasComment ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)'};
          font-style:${hasComment ? 'normal' : 'italic'};line-height:1.5">
          ${hasComment ? escapeHtml(a.comment) : 'Нет комментария'}
        </div>
        <div id="comment-editor-${a.id}" style="display:none;margin-top:10px">
          <textarea id="comment-input-${a.id}"
            style="width:100%;padding:10px 12px;background:rgba(255,255,255,0.06);
            border:1px solid var(--border);border-radius:10px;color:var(--text);
            font-family:var(--font-body);font-size:.85rem;resize:vertical;min-height:72px;
            outline:none;transition:border-color .2s;line-height:1.5"
            placeholder="Добавьте комментарий к артикулу...">${hasComment ? escapeHtml(a.comment) : ''}</textarea>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button class="btn btn-primary comment-save-btn" data-id="${a.id}"
              style="flex:1;padding:9px;font-size:.8rem">Сохранить</button>
            <button class="btn btn-ghost comment-cancel-btn" data-id="${a.id}"
              style="padding:9px 14px;font-size:.8rem">Отмена</button>
          </div>
        </div>`;
      inner.appendChild(commentSection);

      const editBtn = commentSection.querySelector('.comment-edit-btn');
      if (editBtn) {
        editBtn.addEventListener('click', () => {
          document.getElementById(`comment-editor-${a.id}`).style.display = 'block';
          document.getElementById(`comment-text-${a.id}`).style.display = 'none';
          editBtn.style.display = 'none';
          document.getElementById(`comment-input-${a.id}`).focus();
        });
      }
      const saveBtn = commentSection.querySelector('.comment-save-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
          const newComment = document.getElementById(`comment-input-${a.id}`).value.trim();
          try {
            await api.updateComment(a.id, newComment);
            document.getElementById(`comment-text-${a.id}`).textContent = newComment || 'Нет комментария';
            document.getElementById(`comment-text-${a.id}`).style.color =
              newComment ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.3)';
            document.getElementById(`comment-text-${a.id}`).style.fontStyle = newComment ? 'normal' : 'italic';
            document.getElementById(`comment-editor-${a.id}`).style.display = 'none';
            document.getElementById(`comment-text-${a.id}`).style.display = 'block';
            if (editBtn) editBtn.style.display = 'inline-flex';
            a.comment = newComment;
            showToast('Комментарий сохранён');
          } catch(e) { showToast(e.message, 'error'); }
        });
      }
      const cancelBtn = commentSection.querySelector('.comment-cancel-btn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          document.getElementById(`comment-editor-${a.id}`).style.display = 'none';
          document.getElementById(`comment-text-${a.id}`).style.display = 'block';
          if (editBtn) editBtn.style.display = 'inline-flex';
          document.getElementById(`comment-input-${a.id}`).value = a.comment || '';
        });
      }

      if (isOwner) {
        const folderAssign = document.createElement('div');
        folderAssign.style.cssText = 'margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.05)';
        const folders = getFolders(user.id);
        const folderOfThis = folders.find(f => f.articulIDs.includes(articulID));
        folderAssign.innerHTML = `
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
            <span style="font-family:var(--font-body);font-size:.72rem;color:var(--text-muted);display:inline-flex;align-items:center;gap:4px">
              ${folderOfThis ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;flex-shrink:0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>${escapeHtml(folderOfThis.name)}` : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:12px;height:12px;flex-shrink:0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>Не в папке'}
            </span>
            <button class="btn btn-ghost assign-folder-btn"
              style="padding:4px 10px;font-size:.72rem;border-radius:8px">
              ${folderOfThis ? 'Переместить' : 'В папку'}
            </button>
            ${folderOfThis ? `<button class="btn btn-ghost remove-folder-btn"
              style="padding:4px 10px;font-size:.72rem;border-radius:8px;color:var(--danger)">
              Убрать из папки</button>` : ''}
          </div>`;
        inner.appendChild(folderAssign);

        folderAssign.querySelector('.assign-folder-btn')?.addEventListener('click', () => {
          showFolderPickerModal(user.id, articulID, folderOfThis?.id || null, () => loadChanges(articulID));
        });
        folderAssign.querySelector('.remove-folder-btn')?.addEventListener('click', () => {
          if (folderOfThis) {
            removeArticulFromFolder(user.id, folderOfThis.id, articulID);
            loadChanges(articulID);
          }
        });
      }

      if (isOwner) {
        const deleteWrap = document.createElement('div');
        deleteWrap.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.05);display:flex;justify-content:flex-end';
        deleteWrap.innerHTML = `
          <button class="delete-articul-btn" data-id="${articulID}"
            style="display:inline-flex;align-items:center;gap:6px;
              padding:7px 14px;border-radius:10px;
              background:rgba(170,31,48,0.15);border:1px solid rgba(170,31,48,0.35);
              color:#ff7a8a;font-family:var(--font-body);font-size:.78rem;
              cursor:pointer;transition:all .2s var(--spring);">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" style="width:13px;height:13px">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Удалить
          </button>`;
        inner.appendChild(deleteWrap);

        deleteWrap.querySelector('.delete-articul-btn').addEventListener('click', () => {
          showDeleteArticulConfirm(articulID, a.number);
        });
      }
    } catch(e) {
      inner.innerHTML = `<p class="no-changes">${e.message}</p>`;
    }
  }

  async function createWithDuplicateCheck(number) {
    try {
      return await api.createArticul(number);
    } catch (e) {
      if (e.message && e.message.toLowerCase().includes('duplicate')) {
        showDuplicateWarning(number);
        return null;
      }
      throw e;
    }
  }

  function showDuplicateWarning(number) {
    const overlay = openModal(`
      <div style="text-align:center;padding:8px 0 4px">
        <div style="margin-bottom:14px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:40px;height:40px;color:var(--accent-y)"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <div style="font-family:var(--font-display);font-size:.9rem;color:var(--accent-y);margin-bottom:10px">Артикул уже существует</div>
        <div style="font-family:var(--font-body);color:rgba(255,255,255,.65);font-size:.85rem;margin-bottom:20px">
          Артикул <strong style="color:var(--primary)"># ${escapeHtml(number)}</strong> уже есть в вашем списке.
        </div>
        <button class="btn btn-ghost" id="dup-ok" style="width:100%">Понятно</button>
      </div>
    `, '');
    overlay.querySelector('#dup-ok').addEventListener('click', () => closeModal(overlay));
  }

  function showDeleteArticulConfirm(articulID, articulNumber) {
    const confirmOverlay = openModal(`
      <div style="text-align:center;padding:4px 0 8px">
        <div style="margin-bottom:14px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:40px;height:40px;color:var(--alert)"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
        <div style="font-family:var(--font-display);font-size:.9rem;font-weight:700;
          color:var(--alert);margin-bottom:10px">Удалить артикул?</div>
        <div style="font-family:var(--font-body);font-size:.83rem;
          color:rgba(255,255,255,.6);margin-bottom:20px;line-height:1.5">
          Артикул <strong style="color:var(--primary)"># ${escapeHtml(articulNumber)}</strong>
          будет удалён безвозвратно.<br/>
          <span style="color:rgba(255,255,255,.4);font-size:.76rem">
            Это действие нельзя отменить.
          </span>
        </div>
        <div style="display:flex;gap:10px">
          <button class="btn btn-ghost" id="cancel-del-art"
            style="flex:1;padding:12px">Отмена</button>
          <button class="btn btn-danger" id="confirm-del-art"
            style="flex:1;padding:12px;background:var(--danger)">Удалить</button>
        </div>
      </div>
    `, '');

    confirmOverlay.querySelector('#cancel-del-art').addEventListener('click',
      () => closeModal(confirmOverlay));

    confirmOverlay.querySelector('#confirm-del-art').addEventListener('click', async () => {
      try {
        await api.deleteArticul(articulID);
        const folders = getFolders(user.id);
        folders.forEach(f => removeArticulFromFolder(user.id, f.id, articulID));
        allArticuls = allArticuls.filter(a => a.id !== articulID);
        closeModal(confirmOverlay);
        showToast('Артикул удалён');
        await renderArticulList(user.id);
      } catch(e) {
        closeModal(confirmOverlay);
        showToast(e.message, 'error');
      }
    });
  }

  function showAddModal(prefillFolderID = null) {
    const folders = getFolders(user.id);
    const folder = prefillFolderID ? folders.find(f => f.id === prefillFolderID) : null;
    const overlay = openModal(`
      ${folder ? `<div style="font-size:.78rem;color:var(--primary);margin-bottom:12px;display:flex;align-items:center;gap:6px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;flex-shrink:0"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Будет добавлен в папку «${escapeHtml(folder.name)}»</div>` : ''}
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
        const result = await createWithDuplicateCheck(num);
        if (!result) return;
        const articul = result.articul || result;
        const articulID = articul.id;
        if (prefillFolderID && articulID) {
          const folders = getFolders(user.id);
          const folderExists = folders.some(f => f.id === prefillFolderID);
          if (folderExists) {
            addArticulToFolder(user.id, prefillFolderID, articulID);
          }
        }
        closeModal(overlay);
        const ach = result.achievements || {};
        if (ach.new_personal_record) {
          showPersonalRecordCelebration(ach.personal_record_count);
        } else if (ach.daily_completed) {
          showToast('Дневная цель выполнена! 20 артикулов!');
        } else if (ach.streak_milestone > 0) {
          showToast(`Серия ${ach.current_streak} дней подряд!`);
        } else if (prefillFolderID) {
          showToast('Артикул добавлен в папку');
        } else {
          showToast('Артикул добавлен!');
        }
        await renderArticulList(user.id, { newArticul: articul });
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
