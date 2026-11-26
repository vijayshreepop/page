import { useStore } from '../store.jsx';
import { go } from '../lib/router.js';
import { orderBlock, isFixed } from '../lib/pricing.js';
import { Img, Price, SampleBadge, Stock } from './ui.jsx';
import { whatsappLink } from './Layout.jsx';

export function ProductCard({ product: p }) {
  const { add, settings, categoryName, text } = useStore();
  const url = `#/product/${encodeURIComponent(p.id)}`;
  const blocked = orderBlock(p);
  const quick = `Hello ${settings.company.name}, please share the price of ${p.name} (code ${p.code})${p.sample ? ' [SAMPLE LISTING]' : ''}.`;
  return (
    <article className="flex min-w-0 flex-col border border-line bg-surface">
      <a href={url} tabIndex={-1} aria-hidden="true"><Img src={p.image} alt={p.name} className="aspect-[4/3] w-full" /></a>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <h3 className="text-lg"><a href={url} className="hover:underline">{p.name}</a></h3>
        <p className="text-xs break-words text-muted">Code {p.code}<br />{categoryName(p.category)}</p>
        {p.sample && <div><SampleBadge /></div>}
        <Price product={p} />
        <Stock product={p} />
        <div className="mt-auto grid gap-2 pt-2">
          {isFixed(p) ? (
            <>
              <button className="btn btn-secondary btn-sm" disabled={!!blocked} onClick={() => add(p)}>{text.addToCart}</button>
              <button className="btn btn-primary btn-sm" disabled={!!blocked} onClick={() => go('/checkout', { buy: p.id, qty: 1 })}>{text.buyNow}</button>
            </>
          ) : (
            <>
              <a className="btn btn-primary btn-sm" href={`${url}?enquire=1`} aria-label={`Enquire for price: ${p.name}`}>{text.requestQuote}</a>
              <a className="btn btn-secondary btn-sm" href={whatsappLink(settings, quick)} target="_blank" rel="noopener noreferrer">{text.whatsappEnquiry}</a>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export const ProductGrid = ({ products, className = 'lg:grid-cols-4' }) => (
  <div className={`grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-5 md:grid-cols-3 ${className}`}>
    {products.map((p) => <ProductCard key={p.id} product={p} />)}
  </div>
);

export function CategoryTiles({ categories }) {
  const { products } = useStore();
  return (
    <ul className="grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-3 lg:grid-cols-5">
      {categories.map((c) => {
        const n = products.filter((p) => p.category === c.id).length;
        return (
          <li key={c.id} className="bg-surface">
            <a href={`#/category/${c.id}`} className="group flex h-full flex-col hover:bg-surface-2">
              {c.image ? <Img src={c.image} alt={c.name} className="aspect-[4/3] w-full" /> : <span aria-hidden className="flutes mx-4 mt-4 block h-2 w-14 transition-[width] group-hover:w-24" />}
              <span className="block p-4">
                <span className="block font-display text-lg leading-snug">{c.name}</span>
                <span className="mt-1 block text-sm text-muted">{n} {n === 1 ? 'product' : 'products'}</span>
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
