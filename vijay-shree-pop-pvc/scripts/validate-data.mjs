import { readFileSync, existsSync } from 'node:fs';
import { validateAll } from '../src/lib/schema.js';

const data = {};
for (const name of ['products', 'categories', 'settings', 'gallery']) {
  try {
    data[name] = JSON.parse(readFileSync(`public/data/${name}.json`, 'utf8'));
  } catch (e) {
    console.error(`public/data/${name}.json could not be read: ${e.message}`);
    process.exit(1);
  }
}
const errors = validateAll(data);
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
// Missing images are warnings only: the site shows a placeholder.
const paths = [
  ...data.products.flatMap((p) => [p.image, ...(p.images || [])]),
  ...data.categories.map((c) => c.image),
  ...data.gallery.map((g) => g.image),
  ...data.settings.hero.images,
].filter((p) => p && !/^https?:/.test(p));
for (const p of paths) if (!existsSync(`public/${p}`)) console.warn(`Warning: image not found: public/${p}`);
console.log(`Data OK: ${data.products.length} products, ${data.categories.length} categories.`);
