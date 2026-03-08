export async function exportUserArticuls(api, userID, username) {
  const articuls = await api.getUserArticuls(userID);
  if (!articuls || articuls.length === 0) {
    return false;
  }
  const header = [
    `Статистика: ${username}`,
    `Дата экспорта: ${new Date().toLocaleDateString('ru-RU')}`,
    `Всего артикулов: ${articuls.length}`,
    ``,
  ];
  const lines = articuls.map((a, i) => `${i + 1}. ${a.number}`);
  const text = [...header, ...lines].join('\n');

  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `articuls_${username}_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
