import { useState } from 'react';
import { LuArrowUp, LuTrash2, LuPlus, LuUpload } from 'react-icons/lu';
import { pendingImages } from '../lib/draft.js';
import { slug } from '../lib/csv.js';
import { Img } from '../components/ui.jsx';

const FOLDERS = { 'pop-gypsum-materials': 'gypsum-materials', 'pvc-ceiling-panels': 'pvc-panels', 'other-interior-products': 'other-products' };
export const productFolder = (categoryId) => `products/${FOLDERS[categoryId] || slug(categoryId) || 'other-products'}`;

export function download(name, content, type = 'application/json') {
  const url = URL.createObjectURL(content instanceof Blob ? content : new Blob([content], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const toBlob = (canvas, type) => new Promise((r) => canvas.toBlob(r, type, 0.84));

/** Resizes to 1600px at most and compresses. The photo itself is not otherwise changed. */
async function optimise(file) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = Object.assign(document.createElement('canvas'), { width: Math.round(bitmap.width * scale), height: Math.round(bitmap.height * scale) });
  const g = canvas.getContext('2d');
  g.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  let blob = await toBlob(canvas, 'image/webp');
  if (blob?.type !== 'image/webp') {
    g.globalCompositeOperation = 'destination-over'; g.fillStyle = '#fff'; g.fillRect(0, 0, canvas.width, canvas.height);
    blob = await toBlob(canvas, 'image/jpeg');
  }
  return { blob, ext: blob.type === 'image/webp' ? 'webp' : 'jpg' };
}

export function ImageUpload({ folder, nameHint, onPath, label = 'Choose photo' }) {
  const [note, setNote] = useState('');
  const pick = async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const { blob, ext } = await optimise(file);
      const name = `${slug(nameHint || file.name.replace(/\.[^.]+$/, '')) || 'photo'}-${Date.now().toString(36).slice(-5)}.${ext}`;
      const path = `assets/${folder}/${name}`;
      pendingImages.set(path, URL.createObjectURL(blob));
      download(name, blob);
      onPath(path);
      setNote(`Downloaded ${name}. Upload it to public/assets/${folder}/ in GitHub.`);
    } catch { setNote('This file could not be read. Use a JPG, PNG or WebP photo.'); }
  };
  return (
    <div>
      <label className="btn btn-secondary btn-sm cursor-pointer focus-within:outline-3 focus-within:outline-gold"><LuUpload aria-hidden />{label}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={pick} />
      </label>
      {note && <p role="status" className="mt-1 text-sm break-all">{note}</p>}
    </div>
  );
}

export function Text({ label, value, onChange, area, ...rest }) {
  const Tag = area ? 'textarea' : 'input';
  return <label className="field">{label}<Tag className="input" value={value ?? ''} onChange={(e) => onChange(e.target.value)} {...(area ? { rows: 3 } : {})} {...rest} /></label>;
}

export function Select({ label, value, onChange, options }) {
  return <label className="field">{label}<select className="input" value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select></label>;
}

/** Add, remove and reorder rows of an array. */
export function Repeater({ title, items, onChange, blank, render, addLabel }) {
  const set = (i, v) => onChange(items.map((x, n) => (n === i ? v : x)));
  const up = (i) => { const next = [...items]; [next[i - 1], next[i]] = [next[i], next[i - 1]]; onChange(next); };
  return (
    <fieldset className="space-y-2">
      <legend className="field">{title}</legend>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-1 border border-line p-2">
          <div className="min-w-0 flex-1">{render(item, (v) => set(i, v), i)}</div>
          <button type="button" className="p-2 disabled:opacity-30" disabled={i === 0} onClick={() => up(i)} aria-label={`Move item ${i + 1} up`}><LuArrowUp aria-hidden /></button>
          <button type="button" className="p-2 text-red-300" onClick={() => onChange(items.filter((_, n) => n !== i))} aria-label={`Remove item ${i + 1}`}><LuTrash2 aria-hidden /></button>
        </div>
      ))}
      {addLabel && <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange([...items, blank()])}><LuPlus aria-hidden />{addLabel}</button>}
    </fieldset>
  );
}

export const Thumb = ({ path }) => <Img src={path} alt="" className="size-16 shrink-0" />;

export function ImagePath({ label, value, onChange, folder, nameHint }) {
  return (
    <div className="flex items-start gap-3">
      <Thumb path={value} />
      <div className="min-w-0 flex-1 space-y-2">
        <Text label={label} value={value} onChange={onChange} placeholder="assets/…/photo.webp" />
        <ImageUpload folder={folder} nameHint={nameHint} onPath={onChange} />
      </div>
    </div>
  );
}

export const Errors = ({ list }) => (list.length ? (
  <div role="alert" className="border-l-4 border-red-400 bg-red-950 p-3 text-sm">
    <p className="font-semibold">Fix these before saving:</p>
    <ul className="list-disc pl-5">{list.slice(0, 12).map((e, i) => <li key={i}>{e}</li>)}</ul>
    {list.length > 12 && <p>and {list.length - 12} more.</p>}
  </div>
) : null);
