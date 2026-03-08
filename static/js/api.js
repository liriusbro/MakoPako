const BASE = '';

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  register:          (username, password) => request('POST', '/api/register', { username, password }),
  login:             (username, password) => request('POST', '/api/login', { username, password }),
  logout:            ()                   => request('POST', '/api/logout'),
  getMe:             ()                   => request('GET',  '/api/me'),
  updateAvatar:      (avatar)             => request('PUT',  '/api/me/avatar', { avatar }),
  updateUsername:    (username)           => request('PUT',  '/api/me/username', { username }),
  changePassword:    (old_password, new_password) => request('PUT', '/api/me/password', { old_password, new_password }),
  getMyStats:        ()                   => request('GET',  '/api/me/stats'),

  listArticuls:      ()          => request('GET',  '/api/articuls'),
  createArticul:     (number)    => request('POST', '/api/articuls', { number }),
  getArticul:        (id)        => request('GET',  `/api/articuls/${id}`),
  addChange:         (id, desc)  => request('POST', `/api/articuls/${id}/changes`, { description: desc }),
  updateComment:     (id, comment) => request('PUT', `/api/articuls/${id}/comment`, { comment }),
  deleteArticul:     (id) => request('DELETE', `/api/articuls/${id}`),

  getLeaderboard:    ()          => request('GET',  '/api/leaderboard'),
  getSeasonalLeaders: ()        => request('GET',  '/api/leaderboard/seasonal'),
  getUser:           (id)        => request('GET',  `/api/users/${id}`),
  getUserStats:      (id)        => request('GET',  `/api/users/${id}/stats`),
  getUserArticuls:   (id)        => request('GET',  `/api/users/${id}/articuls`),
  getUserHistory:    (id)        => request('GET',  `/api/users/${id}/history`),
  getUserHistoryMonth: (id, y, m) => request('GET',  `/api/users/${id}/history/${y}/${m}`),

  getAchievements:   ()         => request('GET',  '/api/me/achievements'),
  getDailyProgress:  ()         => request('GET',  '/api/me/daily-progress'),
};
