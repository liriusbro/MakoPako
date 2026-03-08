import { api } from '../api.js';
import { renderHome } from './home.js';
import { showToast } from '../components/modal.js';
import { setCurrentUser } from '../app.js';

export function renderAuth(container) {
  container.innerHTML = `
    <div class="page auth-page active" id="auth-page">
      <div class="auth-logo">Articul</div>
      <p class="auth-tagline">Трекер ваших артикулов</p>
      <div class="auth-card">
        <div class="auth-tabs">
          <button class="auth-tab active" data-tab="login">Войти</button>
          <button class="auth-tab" data-tab="register">Регистрация</button>
        </div>
        <div id="login-form">
          <div class="form-group">
            <label class="form-label">Имя пользователя</label>
            <input class="form-input" id="login-username" type="text" placeholder="username" autocomplete="username"/>
          </div>
          <div class="form-group">
            <label class="form-label">Пароль</label>
            <input class="form-input" id="login-password" type="password" placeholder="••••••" autocomplete="current-password"/>
          </div>
          <button class="btn btn-primary" id="login-btn">Войти</button>
        </div>
        <div id="register-form" style="display:none">
          <div class="form-group">
            <label class="form-label">Имя пользователя</label>
            <input class="form-input" id="reg-username" type="text" placeholder="username" autocomplete="username"/>
          </div>
          <div class="form-group">
            <label class="form-label">Пароль</label>
            <input class="form-input" id="reg-password" type="password" placeholder="••••••" autocomplete="new-password"/>
          </div>
          <button class="btn btn-primary" id="register-btn">Создать аккаунт</button>
        </div>
        <p class="error-msg" id="auth-error"></p>
      </div>
    </div>
  `;

  // Tab switching
  container.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('login-form').style.display = tab.dataset.tab === 'login' ? 'block' : 'none';
      document.getElementById('register-form').style.display = tab.dataset.tab === 'register' ? 'block' : 'none';
      document.getElementById('auth-error').textContent = '';
    });
  });

  // Enter key support
  ['login-username','login-password','reg-username','reg-password'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const isLogin = document.getElementById('login-form').style.display !== 'none';
        document.getElementById(isLogin ? 'login-btn' : 'register-btn').click();
      }
    });
  });

  async function doAuth(type) {
    const errEl = document.getElementById('auth-error');
    errEl.textContent = '';
    let username, password;
    if (type === 'login') {
      username = document.getElementById('login-username').value.trim();
      password = document.getElementById('login-password').value;
    } else {
      username = document.getElementById('reg-username').value.trim();
      password = document.getElementById('reg-password').value;
    }
    if (!username || !password) { errEl.textContent = 'Заполните все поля'; return; }
    try {
      const result = type === 'login'
        ? await api.login(username, password)
        : await api.register(username, password);
      setCurrentUser(result.user);
      renderHome(container, result.user);
    } catch (e) {
      errEl.textContent = e.message;
    }
  }

  document.getElementById('login-btn').addEventListener('click', () => doAuth('login'));
  document.getElementById('register-btn').addEventListener('click', () => doAuth('register'));
}
