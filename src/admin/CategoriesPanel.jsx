import { useState } from 'react';
import { uniqueId } from '../lib/csv.js';
import { validateCategories } from '../lib/schema.js';
import { Errors, ImagePath, Repeater, Select, Text } from './shared.jsx';

export default function CategoriesPanel({ data, update }) {
  const [edit, setEdit] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [moveTo, setMoveTo] = useState('');
  const [errors, setErrors] = useState([]);
  const count = (id) => data.products.filter((p) => p.category === id).length;
  const close = () => { setEdit(null); setErrors([]); };

  const save = (e) => {
    e.preventDefault();
    const isNew = !edit.id;
    const subs = [...new Set(edit.subsText.split('\n').map((s) => s.trim()).filter(Boolean))];
    const { subsText, ...rest } = edit;
    const cat = { ...rest, name: edit.name.trim(), subcategories: subs, id: edit.id || uniqueId(edit.name, new Set(data.categories.map((c) => c.id))) };
    const categories = isNew ? [...data.categories, cat] : data.categories.map((c) => (c.id === cat.id ? cat : c));
    const found = validateCategories(categories);
    if (found.length) return setErrors(found);
    const old = data.categories.find((c) => c.id === cat.id)?.subcategories || [];
    const gone = new Set(old.filter((s) => !subs.includes(s)));
    const hit = data.products.filter((p) => p.category === cat.id && gone.has(p.subcategory));
    if (hit.length && !window.confirm(`${hit.length} product(s) use a subcategory you removed or renamed. Their subcategory will be cleared. Continue?`)) return;
    update({ categories, products: data.products.map((p) => (hit.includes(p) ? { ...p, subcategory: '' } : p)) });
    close();
  };

  const remove = () => {
    const categories = data.categories.filter((c) => c.id !== removing.id);
    update({
      categories,
      products: data.products.map((p) => (p.category === removing.id ? { ...p, category: moveTo, subcategory: '' } : p)),
      settings: { ...data.settings, home: { ...data.settings.home, categoryIds: data.settings.home.categoryIds.filter((i) => i !== removing.id) } },
    });
    setRemoving(null); setMoveTo('');
  };

  if (edit)
    return (
      <form onSubmit={save} className="panel space-y-4">
        <h2 className="text-2xl">{edit.id ? 'Edit category' : 'Add category'}</h2>
        <Text label="Category name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
        <Text label="Description" area value={edit.description} onChange={(v) => setEdit({ ...edit, description: v })} />
        <Text label="Subcategories, one per line" area value={edit.subsText} onChange={(v) => setEdit({ ...edit, subsText: v })} />
        <ImagePath label="Category image (optional)" value={edit.image} onChange={(v) => setEdit((x) => ({ ...x, image: v }))} folder="banners" nameHint={edit.name} />
        <Errors list={errors} />
        <div className="flex gap-3"><button className="btn btn-primary">Save category</button><button type="button" className="btn btn-secondary" onClick={close}>Cancel</button></div>
      </form>
    );

  return (
    <div className="space-y-4">
      <button className="btn btn-primary" onClick={() => setEdit({ id: '', name: '', description: '', image: '', subsText: '' })}>Add category</button>
      {removing && (
        <div className="panel space-y-3 border-red-800" role="alertdialog" aria-label="Delete category">
          <p>Delete <strong>{removing.name}</strong>? It has {count(removing.id)} product(s).</p>
          {count(removing.id) > 0 && <Select label="Move its products to" value={moveTo} onChange={setMoveTo} options={[['', 'Choose a category'], ...data.categories.filter((c) => c.id !== removing.id).map((c) => [c.id, c.name])]} />}
          <div className="flex gap-3">
            <button className="btn btn-sm bg-red-800 text-white" disabled={count(removing.id) > 0 && !moveTo} onClick={remove}>Delete category</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setRemoving(null)}>Cancel</button>
          </div>
        </div>
      )}
      <Repeater title="Categories in display order" items={data.categories} onChange={(next) => next.length === data.categories.length ? update({ categories: next }) : (setRemoving(data.categories.find((c) => !next.includes(c))), setMoveTo(''), window.scrollTo(0, 0))}
        render={(c) => (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span><strong>{c.name}</strong> <span className="text-sm text-gray-600">{count(c.id)} products, {c.subcategories.length} subcategories</span></span>
            <button type="button" className="btn btn-secondary btn-sm" aria-label={`Edit ${c.name}`} onClick={() => setEdit({ ...c, subsText: c.subcategories.join('\n') })}>Edit</button>
          </div>
        )} />
    </div>
  );
}
