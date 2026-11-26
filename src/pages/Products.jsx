import { useEffect, useState } from 'react';
import { LuSlidersHorizontal } from 'react-icons/lu';
import { useStore } from '../store.jsx';
import { filterProducts, PAGE_SIZE } from '../lib/catalog.js';
import { AVAILABILITY } from '../lib/pricing.js';
import { replace } from '../lib/router.js';
import { Empty, PageHead } from '../components/ui.jsx';
import { ProductGrid } from '../components/Cards.jsx';

export default function Products({ query, categoryId }) {
  const { products, categories, settings } = useStore();
  const [show, setShow] = useState(false);
  const path = categoryId ? `/category/${categoryId}` : '/products';
  const f = { ...query, category: categoryId || query.category || '' };
  const category = categories.find((c) => c.id === f.category);
  const list = filterProducts(products, categories, f, settings.home.featuredProductIds);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, parseInt(query.page, 10) || 1), pages);
  const visible = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  // Filters live in the address, so Back and shared links keep them.
  const update = (patch) => {
    const next = { ...query, page: '', ...patch };
    if (categoryId && 'category' in patch) replace(patch.category ? `/category/${patch.category}` : '/products', { ...next, category: '' });
    else replace(path, next);
  };
  const select = (label, key, options, all) => (
    <label className="field">{label}
      <select className="input" value={f[key] || ''} onChange={(e) => update({ [key]: e.target.value, ...(key === 'category' ? { sub: '' } : {}) })}>
        <option value="">{all}</option>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  );
  const input = (label, key, props) => (
    <label className="field">{label}
      <input className="input" value={query[key] || ''} onChange={(e) => update({ [key]: e.target.value })} {...props} />
    </label>
  );

  if (categoryId && !category)
    return <div className="wrap py-10"><Empty title="Category not found"><a className="btn btn-primary" href="#/categories">See all categories</a></Empty></div>;

  return (
    <>
      <PageHead title={categoryId ? category.name : 'All products'}>{categoryId ? category.description : 'Search by product name, code, category or subcategory.'}</PageHead>
      <div className="wrap grid items-start gap-6 py-8 lg:grid-cols-[15rem_1fr]">
        <aside>
          <button className="btn btn-secondary w-full lg:hidden" aria-expanded={show} onClick={() => setShow(!show)}><LuSlidersHorizontal aria-hidden />{show ? 'Hide filters' : 'Show filters'}</button>
          <div className={`panel mt-3 space-y-4 lg:mt-0 lg:block ${show ? '' : 'hidden'}`}>
            {select('Category', 'category', categories.map((c) => [c.id, c.name]), 'All categories')}
            {category?.subcategories.length > 0 && select('Subcategory', 'sub', category.subcategories.map((s) => [s, s]), 'All subcategories')}
            {select('Product type', 'type', [['fixed', 'Fixed price'], ['quote', 'Price on request']], 'All types')}
            {select('Availability', 'availability', Object.entries(AVAILABILITY), 'Any availability')}
            <div className="grid grid-cols-2 gap-2">
              {input('Min price ₹', 'min', { type: 'number', min: 0, inputMode: 'numeric' })}
              {input('Max price ₹', 'max', { type: 'number', min: 0, inputMode: 'numeric' })}
            </div>
            <button className="link text-sm" onClick={() => replace(path)}>Clear filters</button>
          </div>
        </aside>
        <section aria-label="Results">
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_13rem]">
            {input('Search', 'q', { type: 'search', placeholder: 'Name, code or category' })}
            <label className="field">Sort by
              <select className="input" value={query.sort || 'featured'} onChange={(e) => update({ sort: e.target.value })}>
                <option value="featured">Featured</option><option value="newest">Newest</option>
                <option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
          <p className="mb-4 text-sm text-ink-2" role="status">{list.length} {list.length === 1 ? 'product' : 'products'}</p>
          {visible.length ? <ProductGrid products={visible} className="xl:grid-cols-4" /> : (
            <Empty title="No products match"><p>Try a shorter search or fewer filters.</p><button className="btn btn-primary mt-4" onClick={() => replace(path)}>Clear search and filters</button></Empty>
          )}
          {pages > 1 && (
            <nav aria-label="Pages" className="mt-8 flex items-center justify-center gap-3">
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => replace(path, { ...query, page: page - 1 })}>Previous</button>
              <span className="text-sm">Page {page} of {pages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => replace(path, { ...query, page: page + 1 })}>Next</button>
            </nav>
          )}
        </section>
      </div>
    </>
  );
}
