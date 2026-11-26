// Dark theme defaults. Change them in Admin > Design and text.
export const DEFAULT_THEME = { background: '#0a0f1c', text: '#f3f1ec', gold: '#d4af6a', waButton: '#0f6b4f' };
export const THEME_FIELDS = [
  ['background', 'Dark background'],
  ['text', 'Main text'],
  ['gold', 'Gold highlight and buttons'],
  ['waButton', 'WhatsApp buttons'],
];
const CSS_NAMES = { background: '--color-bg', text: '--color-fg', gold: '--color-gold', waButton: '--color-wa' };

export const isHex = (v) => /^#[0-9a-f]{6}$/i.test(String(v || ''));
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

export const resolveTheme = (theme) =>
  Object.fromEntries(Object.entries(DEFAULT_THEME).map(([k, v]) => [k, isHex(theme?.[k]) ? theme[k] : v]));

/** Rejects colour choices that would make text unreadable. */
export function validateTheme(theme) {
  if (theme === undefined) return [];
  if (!theme || typeof theme !== 'object') return ['Settings: theme must be an object.'];
  const bad = Object.keys(DEFAULT_THEME).filter((k) => theme[k] !== undefined && !isHex(theme[k]));
  if (bad.length) return bad.map((k) => `Settings: colour "${k}" must look like #131c28.`);
  const t = resolveTheme(theme);
  const errors = [];
  if (contrast(t.background, '#ffffff') < 12) errors.push('Settings: the background must be a dark colour.');
  if (contrast(t.text, t.background) < 9) errors.push('Settings: the text colour is too dark to read on this background.');
  if (contrast(t.gold, t.background) < 6) errors.push('Settings: the gold colour is too dark for this background.');
  if (contrast(t.waButton, '#ffffff') < 4.5) errors.push('Settings: the WhatsApp button colour is too light for white text.');
  return errors;
}

export function applyTheme(theme, root = document.documentElement) {
  const t = resolveTheme(theme);
  for (const [k, name] of Object.entries(CSS_NAMES)) root.style.setProperty(name, t[k]);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t.background);
}
