import { useState } from 'react';
import { LuTrash2 } from 'react-icons/lu';
import { useStore } from '../store.jsx';
import { removeItem, setQty } from '../lib/cart.js';
import { buildOrder, money, unitLabel, orderBlock } from '../lib/pricing.js';
import { go } from '../lib/router.js';
import { Empty, Img, PageHead, QtyInput } from '../components/ui.jsx';
import Totals from '../components/Totals.jsx';

export default function Cart() {
  const { cart, setCart, products, text } = useStore();
  const [confirm, setConfirm] = useState(false);
  const order = buildOrder(cart, products);
  return (
    <>
      <PageHead title={text.cartTitle}>Prices come from the current catalogue.</PageHead>
      <div className="wrap py-8">
        {!cart.length ? (
          <Empty title="Your cart is empty"><p>Add priced products, then send them to us in one WhatsApp order.</p><a className="btn btn-primary mt-4" href="#/products">Browse products</a></Empty>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
            <ul className="space-y-3">
              {order.lines.map((l) => {
                const p = l.product;
                return (
                  <li key={l.id} className="panel grid grid-cols-[4.5rem_1fr] gap-3 sm:grid-cols-[6rem_1fr_auto]">
                    <Img src={p?.image} alt={p?.name || 'Removed product'} className="aspect-square w-full" />
                    <div className="min-w-0">
                      <h2 className="text-lg">{p ? <a href={`#/product/${encodeURIComponent(p.id)}`}>{p.name}</a> : 'Removed product'}</h2>
                      {p && <p className="text-sm break-words text-muted">Code {p.code}. Unit: {unitLabel(p)}{p.sample ? '. Sample listing' : ''}</p>}
                      {!l.error && <p className="text-sm">Price {money(l.unitPrice)} / {unitLabel(p)}{l.unitPrice < l.listPrice && <> <s className="text-muted">{money(l.listPrice)}</s></>}</p>}
                      {l.error && <p role="alert" className="mt-1 text-sm font-semibold text-red-300">{l.error}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {p && !orderBlock(p) && <QtyInput product={p} value={cart.find((i) => i.id === l.id).qty} label={`Quantity of ${p.name}`} onChange={(v) => setCart(setQty(cart, l.id, v))} />}
                        <button className="btn btn-sm text-red-300" onClick={() => setCart(removeItem(cart, l.id))}><LuTrash2 aria-hidden />Remove</button>
                      </div>
                    </div>
                    {!l.error && <p className="col-start-2 font-semibold sm:col-start-auto sm:text-right"><span className="text-sm font-normal">Subtotal </span>{money(l.total)}</p>}
                  </li>
                );
              })}
            </ul>
            <aside className="panel space-y-3">
              <Totals order={order} totalLabel="Grand total" />
              {!order.valid && <p className="text-sm text-red-300">Fix or remove the highlighted products to continue.</p>}
              <button className="btn btn-primary w-full" disabled={!order.valid} onClick={() => go('/checkout')}>Buy now: go to checkout</button>
              <a className="btn btn-secondary w-full" href="#/products">Continue shopping</a>
              {confirm ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">Remove all products?
                  <button className="btn btn-sm bg-red-700 text-white" onClick={() => { setCart([]); setConfirm(false); }}>Yes, clear cart</button>
                  <button className="btn btn-sm btn-secondary" onClick={() => setConfirm(false)}>Keep cart</button>
                </div>
              ) : <button className="link text-sm" onClick={() => setConfirm(true)}>Clear cart</button>}
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
