import { useState } from 'react';
import { mergeCsv, productsToCsv } from '../lib/csv.js';
import { FILES } from '../lib/draft.js';
import { validateAll, validateCategories, validateGallery, validateProducts, validateSettings } from '../lib/schema.js';
import { download, Errors, Select } from './shared.jsx';

const json = (v) => `${JSON.stringify(v, null, 2)}\n`;

export default function FilesPanel({ data, update, changed, reset, hasDraft }) {
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState('products');
  const problems = validateAll(data);

  const readFile = async (e, handler) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setErrors([]); setMessage('');
    try {
      if (file.size > 10_000_000) throw new Error('The file is larger than 10 MB.');
      handler(await file.text(), file.name);
    } catch (err) { setErrors([err.message]); }
  };
  const importJson = (text, fileName) => {
    const value = JSON.parse(text.replace(/^﻿/, ''));
    const check = { products: () => validateProducts(value, data.categories), categories: () => validateCategories(value), settings: () => validateSettings(value), gallery: () => validateGallery(value) };
    let found = check[target]();
    // A new category list must still cover every product.
    if (target === 'categories' && !found.length) found = validateProducts(data.products, value);
    if (found.length) return setErrors(found);
    if (!window.confirm(`Replace ${target} in your draft with ${fileName}?`)) return;
    update({ [target]: value });
    setMessage(`Imported ${fileName} as ${target}.json.`);
  };
  const importCsv = (text) => {
    const result = mergeCsv(data.products, text);
    const found = validateProducts(result.products, data.categories);
    if (found.length) return setErrors(found);
    if (!window.confirm(`This CSV adds ${result.added} and updates ${result.updated} product(s). No products are deleted. Apply to the draft?`)) return;
    update({ products: result.products });
    setMessage(`CSV applied: ${result.added} added, ${result.updated} updated.`);
  };
  const upload = (label, accept, handler) => (
    <label className="btn btn-secondary btn-sm cursor-pointer focus-within:outline-3 focus-within:outline-bronze">{label}<input type="file" accept={accept} className="sr-only" onChange={(e) => readFile(e, handler)} /></label>
  );

  return (
    <div className="space-y-5">
      <section className="panel space-y-3">
        <h2 className="text-2xl">Export and publish</h2>
        <p>{changed.length ? <>Changed in this draft: <strong>{changed.map((f) => `${f}.json`).join(', ')}</strong></> : 'No changes compared with the published website.'}</p>
        <Errors list={problems} />
        <div className="flex flex-wrap gap-2">
          {FILES.map((f) => <button key={f} className={`btn btn-sm ${changed.includes(f) ? 'btn-primary' : 'btn-secondary'}`} disabled={!!problems.length} onClick={() => download(`${f}.json`, json(data[f]))}>Export {f}.json</button>)}
          <button className="btn btn-secondary btn-sm" onClick={() => download('products.csv', productsToCsv(data.products), 'text/csv;charset=utf-8')}>Export product CSV</button>
        </div>
        <h3 className="pt-2">How to publish your changes</h3>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Upload any new photos first, into the folders shown when you prepared them.</li>
          <li>Export every file marked as changed (dark buttons). If you changed more than one, export all of them.</li>
          <li>In your GitHub repository open <code>public/data/</code>, choose Add file, then Upload files.</li>
          <li>Drag in the exported files. The names must be exactly the same. If your computer saved <code>products (1).json</code>, rename it to <code>products.json</code>.</li>
          <li>Choose Commit changes. Open the Actions tab and wait for the green tick.</li>
          <li>Reload the website. GitHub Pages can take a few minutes to show the new version.</li>
        </ol>
      </section>
      <section className="panel space-y-3">
        <h2 className="text-2xl">Import</h2>
        <div className="flex flex-wrap items-end gap-3">
          <Select label="JSON file to replace" value={target} onChange={setTarget} options={FILES.map((f) => [f, `${f}.json`])} />
          {upload('Import JSON', '.json,application/json', importJson)}
          {upload('Import product CSV', '.csv,text/csv', importCsv)}
        </div>
        <p className="text-sm">CSV rows match products by id, then product code. Export a CSV first and use it as your template. Save from your spreadsheet as CSV UTF-8. Category uses the category id.</p>
        <Errors list={errors} />
        {message && <p role="status" className="font-semibold">{message}</p>}
      </section>
      {hasDraft && <button className="link text-red-800" onClick={() => window.confirm('Discard all unpublished edits in this browser? Export first if you want to keep them.') && reset()}>Discard draft and start again from the published website</button>}
    </div>
  );
}
