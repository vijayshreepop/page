import { UNITS, AVAILABILITY } from './pricing.js';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const str = (v) => typeof v === 'string';
const optNum = (v) => v === null || v === undefined || v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0);

export function validateCategories(list) {
  if (!Array.isArray(list)) return ['categories.json must be a list.'];
  const errors = [];
  const ids = new Set();
  list.forEach((c, i) => {
    const at = `Category ${i + 1}${c?.name ? ` (${c.name})` : ''}`;
    if (!isObj(c)) return errors.push(`${at}: must be an object.`);
    if (!str(c.id) || !/^[a-z0-9-]+$/.test(c.id)) errors.push(`${at}: id must use lowercase letters, numbers and hyphens.`);
    if (!str(c.name) || !c.name.trim()) errors.push(`${at}: name is required.`);
    if (ids.has(c.id)) errors.push(`${at}: id "${c.id}" is used twice.`);
    ids.add(c.id);
    if (!Array.isArray(c.subcategories) || !c.subcategories.every(str)) errors.push(`${at}: subcategories must be a list of names.`);
  });
  return errors;
}

export function validateProducts(list, categories) {
  if (!Array.isArray(list)) return ['products.json must be a list.'];
  const errors = [];
  const cats = new Set((categories || []).map((c) => c.id));
  const ids = new Set();
  const codes = new Set();
  list.forEach((p, i) => {
    const at = `Product ${i + 1}${p?.code ? ` (${p.code})` : ''}`;
    if (!isObj(p)) return errors.push(`${at}: must be an object.`);
    for (const k of ['id', 'code', 'name', 'category']) if (!str(p[k]) || !p[k].trim()) errors.push(`${at}: ${k} is required.`);
    if (ids.has(p.id)) errors.push(`${at}: id "${p.id}" is used twice.`);
    ids.add(p.id);
    const code = String(p.code || '').toLowerCase();
    if (codes.has(code)) errors.push(`${at}: product code is used twice.`);
    codes.add(code);
    if (p.category && !cats.has(p.category)) errors.push(`${at}: category "${p.category}" does not exist.`);
    if (!['fixed', 'quote'].includes(p.pricingMode)) errors.push(`${at}: pricingMode must be "fixed" or "quote".`);
    if (p.pricingMode === 'fixed' && !(Number(p.price) > 0)) errors.push(`${at}: a fixed-price product needs a price above 0.`);
    if (!optNum(p.price) || !optNum(p.discountPrice)) errors.push(`${at}: prices must be numbers.`);
    if (p.pricingMode === 'fixed' && Number(p.discountPrice) > 0 && Number(p.discountPrice) >= Number(p.price))
      errors.push(`${at}: discount price must be lower than the price.`);
    if (!UNITS.includes(p.unit)) errors.push(`${at}: unit must be one of ${UNITS.join(', ')}.`);
    if (!AVAILABILITY[p.availability]) errors.push(`${at}: availability must be one of ${Object.keys(AVAILABILITY).join(', ')}.`);
    if (!optNum(p.stockQuantity)) errors.push(`${at}: stock quantity must be a number or empty.`);
    if (p.images !== undefined && !(Array.isArray(p.images) && p.images.every(str))) errors.push(`${at}: images must be a list of paths.`);
    if (p.specifications !== undefined && !(Array.isArray(p.specifications) && p.specifications.every((s) => isObj(s) && str(s.label) && str(s.value))))
      errors.push(`${at}: specifications must be a list of label and value pairs.`);
    for (const k of ['image', 'subcategory', 'description', 'size', 'thickness', 'material', 'brand', 'colour', 'customUnit', 'dateAdded'])
      if (p[k] !== undefined && !str(p[k])) errors.push(`${at}: ${k} must be text.`);
  });
  return errors;
}

export function validateSettings(s) {
  if (!isObj(s)) return ['settings.json must be an object.'];
  const errors = [];
  for (const k of ['company', 'contact', 'social', 'hero', 'home', 'about']) if (!isObj(s[k])) errors.push(`Settings: "${k}" is missing.`);
  if (errors.length) return errors;
  if (!str(s.company.name) || !s.company.name.trim()) errors.push('Settings: company name is required.');
  if (!/^\d{11,15}$/.test(String(s.contact.whatsappNumber || '')))
    errors.push('Settings: WhatsApp number must be digits only with country code, such as 919429093121.');
  const lists = [[s.contact.phones, 'contact.phones'], [s.hero.images, 'hero.images'], [s.hero.buttons, 'hero.buttons'],
    [s.home.categoryIds, 'home.categoryIds'], [s.home.featuredProductIds, 'home.featuredProductIds'], [s.home.why, 'home.why'], [s.about.paragraphs, 'about.paragraphs']];
  for (const [v, n] of lists) if (!Array.isArray(v)) errors.push(`Settings: ${n} must be a list.`);
  return errors;
}

export function validateGallery(list) {
  if (!Array.isArray(list)) return ['gallery.json must be a list.'];
  return list.flatMap((g, i) => (isObj(g) && str(g.image) && g.image ? [] : [`Gallery item ${i + 1}: image path is required.`]));
}

export function validateAll({ products, categories, settings, gallery }) {
  const c = validateCategories(categories);
  return [...c, ...validateProducts(products, Array.isArray(categories) ? categories.filter(isObj) : []), ...validateSettings(settings), ...validateGallery(gallery)];
}
