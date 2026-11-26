import { useEffect, useId, useState } from 'react';
import { LuImage, LuMinus, LuPlus } from 'react-icons/lu';
import { assetUrl } from '../lib/draft.js';
import { allowsDecimal, effectivePrice, hasDiscount, isFixed, money, unitLabel, AVAILABILITY } from '../lib/pricing.js';
import { stepQty } from '../lib/cart.js';

export function Img({ src, alt, className = '', fit = 'object-cover', eager = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed)
    return (
      <div className={`noimg flex flex-col items-center justify-center gap-1 text-gold ${className}`} role="img" aria-label={`${alt}: photo coming soon`}>
        <LuImage aria-hidden className="size-6" />
        <span className="px-1 text-center text-xs">Photo coming soon</span>
      </div>
    );
  return <img src={assetUrl(src)} alt={alt} className={`${fit} ${className}`} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />;
}

export function Price({ product, large = false }) {
  if (!isFixed(product)) return <p className={`font-semibold text-gold ${large ? 'text-2xl' : ''}`}>Price on request</p>;
  return (
    <p className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-semibold ${large ? 'text-3xl' : 'text-lg'}`}>{money(effectivePrice(product))}</span>
      <span className="text-sm text-muted">/ {unitLabel(product)}</span>
      {hasDiscount(product) && <s className="text-sm text-muted"><span className="sr-only">Regular price </span>{money(product.price)}</s>}
    </p>
  );
}

export function Stock({ product }) {
  const out = product.availability === 'out_of_stock';
  return <span className={`text-sm ${out ? 'font-semibold text-red-300' : 'text-muted'}`}>{AVAILABILITY[product.availability]}</span>;
}

export const SampleBadge = () => (
  <span className="inline-block border border-gold bg-surface-2 px-1.5 text-xs font-semibold text-fg">Sample listing, not a real price or item</span>
);

export function QtyInput({ product, value, onChange, label = 'Quantity' }) {
  // Keeps exactly what is being typed (such as "0." on the way to "0.5").
  const [text, setText] = useState(String(value));
  useEffect(() => { setText((t) => (t !== '' && Number(t) === Number(value) ? t : String(value))); }, [value]);
  return (
    <div className="inline-flex items-stretch border border-line bg-surface">
      <button type="button" className="px-3" aria-label={`Decrease ${label.toLowerCase()}`} onClick={() => onChange(stepQty(product, value, -1))}><LuMinus aria-hidden /></button>
      <input className="h-11 w-16 border-x border-line text-center" type="number" inputMode={allowsDecimal(product) ? 'decimal' : 'numeric'}
        min="0" step={allowsDecimal(product) ? '0.01' : '1'} aria-label={label} value={text}
        onChange={(e) => { setText(e.target.value); onChange(e.target.value === '' ? '' : Number(e.target.value)); }} />
      <button type="button" className="px-3" aria-label={`Increase ${label.toLowerCase()}`} onClick={() => onChange(stepQty(product, value, 1))}><LuPlus aria-hidden /></button>
    </div>
  );
}

export function Field({ label, name, value, onChange, error, required, as = 'input', children, hint, ...rest }) {
  const id = useId();
  const Tag = as;
  return (
    <div>
      <label htmlFor={id} className="field">{label}{!required && <span className="font-normal text-muted"> (optional)</span>}</label>
      <Tag id={id} name={name} className="input" value={value} aria-required={required || undefined} aria-invalid={!!error}
        aria-describedby={error || hint ? `${id}-d` : undefined} onChange={(e) => onChange(name, e.target.value)} {...rest}>{children}</Tag>
      {(error || hint) && <p id={`${id}-d`} className={`mt-1 text-sm ${error ? 'text-red-300' : 'text-muted'}`}>{error || hint}</p>}
    </div>
  );
}

export function focusFirstError(errors) {
  const first = Object.keys(errors)[0];
  if (first) requestAnimationFrame(() => document.querySelector(`[name="${first}"]`)?.focus());
}

export function Empty({ title, children }) {
  return (
    <div className="panel noimg py-12 text-center">
      <h2 className="text-2xl">{title}</h2>
      <div className="mx-auto mt-3 max-w-md">{children}</div>
    </div>
  );
}

export function PageHead({ title, children }) {
  return (
    <header className="border-b border-line bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--color-gold)_14%,var(--color-bg))_0%,var(--color-bg)_60%)]">
      <div className="wrap py-8 sm:py-10">
        <h1>{title}</h1>
        {children && <p className="mt-2 max-w-2xl text-muted">{children}</p>}
      </div>
    </header>
  );
}
