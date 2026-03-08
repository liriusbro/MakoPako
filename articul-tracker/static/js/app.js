import { api } from './api.js';
import { renderAuth } from './pages/auth.js';
import { renderHome } from './pages/home.js';

export let currentUser = null;

export function setCurrentUser(user) {
  currentUser = user;
}

async function init() {
  const app = document.getElementById('app');
  try {
    const user = await api.getMe();
    currentUser = user;
    renderHome(app, user);
  } catch {
    renderAuth(app);
  }
}

init();
