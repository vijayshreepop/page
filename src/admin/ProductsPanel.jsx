import { useState } from 'react';
import { filterProducts } from '../lib/catalog.js';
import { blankProduct, specsToText, textToSpecs, uniqueId } from '../lib/csv.js';
import { AVAILABILITY, UNITS, isFixed, money } from '../lib/pricing.js';
import { validateProducts } from '../lib/schema.js';
import { Errors, ImagePath, ImageUpload, Repeater, Select, Text, Thumb, productFolder } from './shared.jsx';

const PER = 25;
const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

function Editor({ initial, isNew, data, onSave, onCancel }) {
  const [p, setP] = useState({ ...blankProduct(), ...initial });
  const [specs, setSpecs] = useState(specsToText(initial.specifications).replaceAll(' | ', '\n'));
  const [errors, setErrors] = useState([]);
  const set = (k) => (v) => setP((x) => ({ ...x, [k]: v }));
  const cat = data.categories.find((c) => c.id === p.category);
  const text = (label, k, props) => <Text label={label} value={p[k]} onChange={set(k)} {...props} />;

  const save = (e) => {
    e.preventDefault();
    const id = isNew ? uniqueId(p.code || p.name, new Set(data.products.map((x) => x.id))) : p.id;
    const clean = { ...p, id, code: p.code.trim(), name: p.name.trim(), price: num(p.price), discountPrice: num(p.discountPrice), stockQuantity: num(p.stockQuantity),
      specifications: textToSpecs(specs), images: (p.images || []).map((s) => s.trim()).filter(Boolean) };
    const products = isNew ? [clean, ...data.products] : data.products.map((x) => (x.id === id ? clean : x));
    const found = validateProducts(products, data.categories);
    setErrors(found);
    if (!found.length) onSave(products);
  };
  const folder = productFolder(p.category);
  return (
    <form onSubmit={save} noValidate className="panel space-y-4">
      <h2 className="text-2xl">{isNew ? 'Add product' : `Edit ${initial.name}`}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        {text('Product name', 'name')}{text('Product code', 'code')}
        <Select label="Category" value={p.category} onChange={(v) => setP({ ...p, category: v, subcategory: '' })} options={[['', 'Choose a category'], ...data.categories.map((c) => [c.id, c.name])]} />
        {text('Subcategory', 'subcategory', { list: 'subs' })}
        <datalist id="subs">{cat?.subcategories.map((s) => <option key={s} value={s} />)}</datalist>
      </div>
      <fieldset className="grid gap-4 border border-bronze p-3 sm:grid-cols-3">
        <legend className="field px-1">Pricing</legend>
        <Select label="Pricing mode" value={p.pricingMode} onChange={set('pricingMode')} options={[['fixed', 'Fixed price'], ['quote', 'Request a quote']]} />
        {text('Price (₹)', 'price', { type: 'number', min: 0, step: 'any', disabled: p.pricingMode !== 'fixed' })}
        {text('Discount price (₹)', 'discountPrice', { type: 'number', min: 0, step: 'any', disabled: p.pricingMode !== 'fixed' })}
        <Select label="Unit" value={p.unit} onChange={set('unit')} options={UNITS.map((u) => [u, u])} />
        {p.unit === 'Custom Unit' && text('Custom unit name', 'customUnit')}
        <Select label="Availability" value={p.availability} onChange={set('availability')} options={Object.entries(AVAILABILITY)} />
        {text('Stock quantity (optional limit)', 'stockQuantity', { type: 'number', min: 0, step: 'any' })}
      </fieldset>
      {text('Description', 'description', { area: true })}
      <div className="grid gap-4 sm:grid-cols-3">
        {text('Size', 'size')}{text('Thickness', 'thickness')}{text('Material', 'material')}{text('Brand', 'brand')}{text('Colour', 'colour')}{text('Date added', 'dateAdded', { type: 'date' })}
      </div>
      <Text label="Specifications, one per line as Label: Value" area value={specs} onChange={setSpecs} />
      <ImagePath label="Main image" value={p.image} onChange={set('image')} folder={folder} nameHint={p.code} />
      <Repeater title="Additional images" items={p.images || []} onChange={set('images')}
        render={(src, change) => <div className="flex items-center gap-2"><Thumb path={src} /><input className="input min-w-0" aria-label="Image path" value={src} onChange={(e) => change(e.target.value)} /></div>} />
      <ImageUpload folder={folder} nameHint={p.code} label="Add another photo" onPath={(path) => setP((x) => ({ ...x, images: [...(x.images || []), path] }))} />
      <label className="flex items-center gap-2"><input type="checkbox" checked={!!p.sample} onChange={(e) => set('sample')(e.target.checked)} />This is a sample listing (untick once the name, photo and price are real)</label>
      <Errors list={errors} />
      <div className="flex gap-3"><button className="btn btn-primary">Save product</button><button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

export default function ProductsPanel({ data, update }) {
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const list = filterProducts(data.products, data.categories, { q, sort: 'newest' });
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const at = Math.min(page, pages);
  const samples = data.products.filter((p) => p.sample).length;

  // Removing products also removes them from the homepage's featured list.
  const removeWhere = (test) => {
    const products = data.products.filter((p) => !test(p));
    const ids = new Set(products.map((p) => p.id));
    update({ products, settings: { ...data.settings, home: { ...data.settings.home, featuredProductIds: data.settings.home.featuredProductIds.filter((i) => ids.has(i)) } } });
  };

  if (editing)
    return <Editor key={editing.id || 'new'} initial={editing} isNew={!editing.id} data={data} onCancel={() => setEditing(null)}
      onSave={(products) => { update({ products }); setEditing(null); window.scrollTo(0, 0); }} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <button className="btn btn-primary" onClick={() => setEditing(blankProduct())}>Add product</button>
        <div className="min-w-48 flex-1"><Text label="Find a product" value={q} onChange={(v) => { setQ(v); setPage(1); }} type="search" /></div>
        {samples > 0 && <button className="btn btn-secondary btn-sm text-red-800" onClick={() => window.confirm(`Delete all ${samples} sample listings from the draft?`) && removeWhere((p) => p.sample)}>Delete all {samples} samples</button>}
      </div>
      <ul className="divide-y divide-silver border border-silver bg-white">
        {list.slice((at - 1) * PER, at * PER).map((p) => (
          <li key={p.id} className="flex flex-wrap items-center gap-3 p-3">
            <Thumb path={p.image} />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{p.name}</p>
              <p className="text-sm break-words text-gray-600">{p.code}. {isFixed(p) ? `${money(p.price)}${Number(p.discountPrice) > 0 ? `, discount price ${money(p.discountPrice)}` : ''}` : 'Request a quote'}{p.sample ? '. Sample' : ''}</p>
            </div>
            <button className="btn btn-secondary btn-sm" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)}>Edit</button>
            <button className="btn btn-sm text-red-800" aria-label={`Delete ${p.name}`} onClick={() => window.confirm(`Delete ${p.name} (${p.code})?`) && removeWhere((x) => x.id === p.id)}>Delete</button>
          </li>
        ))}
        {!list.length && <li className="p-4">No products found.</li>}
      </ul>
      {pages > 1 && <div className="flex items-center gap-3"><button className="btn btn-secondary btn-sm" disabled={at === 1} onClick={() => setPage(at - 1)}>Previous</button>Page {at} of {pages}<button className="btn btn-secondary btn-sm" disabled={at === pages} onClick={() => setPage(at + 1)}>Next</button></div>}
    </div>
  );
}
