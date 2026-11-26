// The admin draft lives only in this browser. It never changes the published website by itself.
export const DRAFT_KEY = 'vs-admin-draft-v1';
export const PREVIEW_KEY = 'vs-admin-preview';
export const FILES = ['products', 'categories', 'settings', 'gallery'];

export function readDraft() {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY));
    return d && d.data && d.base ? d : null;
  } catch { return null; }
}
export function writeDraft(draft) {
  try { localStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); return true; } catch { return false; }
}
export const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* storage unavailable */ } };
export const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
export const isPreview = () => { try { return sessionStorage.getItem(PREVIEW_KEY) === '1'; } catch { return false; } };
export function setPreview(on) {
  try { on ? sessionStorage.setItem(PREVIEW_KEY, '1') : sessionStorage.removeItem(PREVIEW_KEY); } catch { /* storage unavailable */ }
}

// Images chosen in admin but not yet uploaded to GitHub, viewable only until the tab closes.
export const pendingImages = new Map();
export const assetUrl = (path) => pendingImages.get(path) || (/^(https?:|data:|blob:)/.test(path) ? path : `./${String(path).replace(/^\/+/, '')}`);
