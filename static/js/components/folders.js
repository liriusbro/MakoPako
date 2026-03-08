// ─── Storage helpers ───────────────────────────────────────────────────────
function foldersKey(userID) { return `folders_${userID}`; }

export function getFolders(userID) {
  try {
    return JSON.parse(localStorage.getItem(foldersKey(userID))) || [];
  } catch { return []; }
}

export function saveFolders(userID, folders) {
  localStorage.setItem(foldersKey(userID), JSON.stringify(folders));
}

export function createFolder(userID, name) {
  const folders = getFolders(userID);
  const id = 'f_' + Date.now();
  folders.push({ id, name, articulIDs: [] });
  saveFolders(userID, folders);
  return id;
}

export function renameFolder(userID, folderID, newName) {
  const folders = getFolders(userID);
  const f = folders.find(f => f.id === folderID);
  if (f) { f.name = newName; saveFolders(userID, folders); }
}

export function deleteFolder(userID, folderID) {
  const folders = getFolders(userID).filter(f => f.id !== folderID);
  saveFolders(userID, folders);
  return;
}

export function addArticulToFolder(userID, folderID, articulID) {
  const folders = getFolders(userID);
  const f = folders.find(f => f.id === folderID);
  if (f && !f.articulIDs.includes(articulID)) {
    f.articulIDs.push(articulID);
    saveFolders(userID, folders);
  }
}

export function removeArticulFromFolder(userID, folderID, articulID) {
  const folders = getFolders(userID);
  const f = folders.find(f => f.id === folderID);
  if (f) {
    f.articulIDs = f.articulIDs.filter(id => id !== articulID);
    saveFolders(userID, folders);
  }
}
