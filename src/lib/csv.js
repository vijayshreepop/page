export const CSV_COLUMNS = ['id', 'code', 'name', 'category', 'subcategory', 'pricingMode', 'price', 'discountPrice', 'unit', 'customUnit',
  'availability', 'stockQuantity', 'size', 'thickness', 'material', 'brand', 'colour', 'description', 'specifications', 'image', 'images', 'dateAdded', 'sample'];
const NUMERIC = ['price', 'discountPrice', 'stockQuantity'];

export const slug = (v) => String(v || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const specsToText = (s = []) => s.map((x) => `${x.label}: ${x.value}`).join(' | ');
export const textToSpecs = (v) =>
  String(v || '').split(/\||\n/).map((part) => {
    const i = part.indexOf(':');
    return i < 0 ? null : { label: part.slice(0, i).trim(), value: part.slice(i + 1).trim() };
  }).filter((x) => x && x.label && x.value);

// A leading apostrophe stops spreadsheet apps running a cell as a formula.
const guard = (s) => (/^[=+\-@\t\r]/.test(s) ? `'${s}` : s);
const unguard = (s) => (/^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s);
const cell = (v) => {
  const s = guard(String(v ?? ''));
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function productsToCsv(products) {
  const rows = products.map((p) =>
    CSV_COLUMNS.map((k) => cell(k === 'specifications' ? specsToText(p[k]) : k === 'images' ? (p[k] || []).join(' | ') : p[k])).join(','));
  return '﻿' + [CSV_COLUMNS.join(','), ...rows].join('\r\n') + '\r\n';
}

export function parseCsv(text) {
  const s = String(text).replace(/^﻿/, '');
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"' && field === '') quoted = true;
    else if (ch === ',') { row.push(field); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += ch;
  }
  if (quoted) throw new Error('The CSV has a quotation mark that is never closed.');
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export const blankProduct = () => ({
  id: '', code: '', name: '', category: '', subcategory: '', image: '', images: [], description: '', specifications: [],
  size: '', thickness: '', material: '', brand: '', colour: '', unit: 'Piece', customUnit: '', pricingMode: 'quote',
  price: null, discountPrice: null, availability: 'in_stock', stockQuantity: null, dateAdded: new Date().toISOString().slice(0, 10), sample: false,
});

export function uniqueId(base, taken) {
  const root = slug(base) || 'item';
  let id = root, n = 2;
  while (taken.has(id)) id = `${root}-${n++}`;
  return id;
}

/** Rows update products matched by id, then code. Only columns present in the file change. */
export function mergeCsv(existing, text) {
  const [head, ...rows] = parseCsv(text);
  if (!head) throw new Error('The CSV file is empty.');
  const cols = head.map((h) => h.trim());
  if (!cols.includes('code')) throw new Error('The CSV needs a "code" column. Export a CSV first and use it as the template.');
  const products = existing.map((p) => ({ ...p }));
  const taken = new Set(products.map((p) => p.id));
  let added = 0, updated = 0;
  for (const r of rows) {
    const patch = {};
    cols.forEach((k, i) => {
      if (!CSV_COLUMNS.includes(k) || i >= r.length) return;
      const v = unguard(r[i]);
      if (NUMERIC.includes(k)) {
        const n = Number(v.replace(/[₹,\s]/g, ''));
        patch[k] = v.trim() === '' ? null : Number.isFinite(n) ? n : v;
      } else if (k === 'specifications') patch[k] = textToSpecs(v);
      else if (k === 'images') patch[k] = v.split('|').map((x) => x.trim()).filter(Boolean);
      else if (k === 'sample') patch[k] = /^(true|yes|1)$/i.test(v.trim());
      else patch[k] = v.trim();
    });
    const code = String(patch.code || '').toLowerCase();
    const found = products.find((p) => patch.id && p.id === patch.id) || products.find((p) => code && p.code.toLowerCase() === code);
    if (found) {
      delete patch.id;
      Object.assign(found, patch);
      updated++;
    } else {
      const p = { ...blankProduct(), ...patch };
      p.id = uniqueId(patch.id || p.code || p.name, taken);
      taken.add(p.id);
      products.push(p);
      added++;
    }
  }
  return { products, added, updated };
}
