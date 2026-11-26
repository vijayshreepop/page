import { AVAILABILITY, effectivePrice, isFixed } from './pricing.js';

export const PAGE_SIZE = 24;

/** Allows only safe link types from editable JSON. */
export function safeLink(v) {
  const s = String(v || '').trim();
  return /^(https?:\/\/|#\/|mailto:|tel:)/i.test(s) ? s : '';
}

export function filterProducts(products, categories, f = {}, featuredIds = []) {
  const names = new Map(categories.map((c) => [c.id, c.name]));
  const words = String(f.q || '').toLowerCase().split(/\s+/).filter(Boolean);
  const min = f.min === '' || f.min == null ? null : Number(f.min);
  const max = f.max === '' || f.max == null ? null : Number(f.max);
  const list = products.filter((p) => {
    if (f.category && p.category !== f.category) return false;
    if (f.sub && p.subcategory !== f.sub) return false;
    if (f.type && (isFixed(p) ? 'fixed' : 'quote') !== f.type) return false;
    if (f.availability && AVAILABILITY[f.availability] && p.availability !== f.availability) return false;
    if (min !== null || max !== null) {
      const price = effectivePrice(p);
      if (price === null || (min !== null && price < min) || (max !== null && price > max)) return false;
    }
    if (words.length) {
      const hay = [p.name, p.code, names.get(p.category), p.subcategory].join(' ').toLowerCase();
      if (!words.every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  const rank = new Map(featuredIds.map((id, i) => [id, i]));
  const newest = (a, b) => String(b.dateAdded || '').localeCompare(String(a.dateAdded || ''));
  // Price-on-request items always come after priced items.
  const byPrice = (dir) => (a, b) => {
    const x = effectivePrice(a);
    const y = effectivePrice(b);
    if (x === null || y === null) return (x === null) - (y === null);
    return (x - y) * dir;
  };
  const sorters = {
    'price-asc': byPrice(1),
    'price-desc': byPrice(-1),
    newest,
    featured: (a, b) => (rank.get(a.id) ?? 1e9) - (rank.get(b.id) ?? 1e9) || newest(a, b),
  };
  return list.sort(sorters[f.sort] || sorters.featured);
}
