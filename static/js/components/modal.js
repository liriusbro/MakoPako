export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

export function openModal(html, title) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-handle"></div>
      ${title ? `<div class="modal-title">${title}</div>` : ''}
      <div class="modal-body">${html}</div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('open'));
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay);
  });
  return overlay;
}

export function closeModal(overlay) {
  overlay.classList.remove('open');
  setTimeout(() => overlay.remove(), 400);
}
