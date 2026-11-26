import { useEffect, useState } from 'react';
import { useStore } from '../store.jsx';
import { go } from '../lib/router.js';
import { isFixed, orderBlock, quantityError, unitLabel } from '../lib/pricing.js';
import { Empty, Img, Price, QtyInput, SampleBadge, Stock } from '../components/ui.jsx';
import { ProductGrid } from '../components/Cards.jsx';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { whatsappLink } from '../components/Layout.jsx';

export default function Product({ id, query }) {
  const { products, add, settings, categoryName, text } = useStore();
  const p = products.find((x) => x.id === id);
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);
  const [asking, setAsking] = useState(!!query.enquire);
  useEffect(() => { setQty(1); setShot(0); setAsking(!!query.enquire); }, [id, query.enquire]);
  useEffect(() => { if (query.enquire) requestAnimationFrame(() => document.getElementById('enquiry')?.scrollIntoView()); }, [id, query.enquire]);

  if (!p) return <div className="wrap py-10"><Empty title="Product not found"><p>It may have been removed.</p><a className="btn btn-primary mt-4" href="#/products">Browse all products</a></Empty></div>;

  const fixed = isFixed(p);
  const blocked = fixed ? orderBlock(p) : '';
  const qtyError = fixed && !blocked ? quantityError(p, qty) : '';
  const images = [p.image, ...(p.images || [])].filter(Boolean);
  const rows = [['Product code', p.code], ['Category', categoryName(p.category)], ['Subcategory', p.subcategory], ['Brand', p.brand], ['Material', p.material],
    ['Colour', p.colour], ['Size', p.size], ['Thickness', p.thickness], ['Unit', unitLabel(p)], ...(p.specifications || []).map((s) => [s.label, s.value])].filter(([, v]) => v);
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const quick = `Hello ${settings.company.name}, I have a question about ${p.name} (code ${p.code})${p.sample ? ' [SAMPLE LISTING]' : ''}.`;
  return (
    <div className="wrap py-6">
      <nav aria-label="Breadcrumb" className="text-sm"><a className="link" href="#/products">All products</a> / <a className="link" href={`#/category/${p.category}`}>{categoryName(p.category)}</a></nav>
      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <div>
          <Img src={images[shot]} alt={p.name} fit="object-contain" className="aspect-square w-full border border-line bg-surface" eager />
          {images.length > 1 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {images.map((src, i) => <li key={src + i}><button aria-label={`Show photo ${i + 1}`} aria-current={i === shot} onClick={() => setShot(i)} className={`block border-2 ${i === shot ? 'border-gold' : 'border-transparent'}`}><Img src={src} alt="" className="size-18" /></button></li>)}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <h1>{p.name}</h1>
          <p className="text-sm text-muted">Code {p.code}</p>
          {p.sample && <SampleBadge />}
          <Price product={p} large />
          <Stock product={p} />
          {p.description && <p className="max-w-xl whitespace-pre-line">{p.description}</p>}
          {fixed ? (
            <div className="space-y-3">
              {blocked ? <p className="font-semibold text-red-300">{blocked}</p> : <div><QtyInput product={p} value={qty} onChange={setQty} /> <span className="ml-2 text-sm">{unitLabel(p)}</span>{qtyError && <p role="alert" className="mt-1 text-sm text-red-300">{qtyError}</p>}</div>}
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-secondary" disabled={!!blocked || !!qtyError} onClick={() => add(p, qty)}>{text.addToCart}</button>
                <button className="btn btn-primary" disabled={!!blocked || !!qtyError} onClick={() => go('/checkout', { buy: p.id, qty })}>{text.buyNow}</button>
              </div>
              <button className="link text-sm" onClick={() => setAsking(!asking)} aria-expanded={asking}>Ask about this product</button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-primary" onClick={() => { setAsking(true); requestAnimationFrame(() => document.querySelector('#enquiry input')?.focus()); }}>{text.requestQuote}</button>
              <a className="btn btn-secondary" href={whatsappLink(settings, quick)} target="_blank" rel="noopener noreferrer">{text.whatsappEnquiry}</a>
            </div>
          )}
          <table className="w-full border-t border-line text-left text-sm">
            <caption className="sr-only">Specifications</caption>
            <tbody>{rows.map(([k, v], i) => <tr key={k + i} className="border-b border-line"><th scope="row" className="w-2/5 py-2 pr-3 font-semibold">{k}</th><td className="py-2 break-words">{v}</td></tr>)}</tbody>
          </table>
          {(asking || !fixed) && <EnquiryForm key={p.id} product={p} />}
        </div>
      </div>
      {related.length > 0 && <section className="mt-14"><h2 className="mb-5">More in this category</h2><ProductGrid products={related} /></section>}
    </div>
  );
}
