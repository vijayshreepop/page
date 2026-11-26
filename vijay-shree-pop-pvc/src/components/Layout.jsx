import { useEffect, useState } from 'react';
import { LuMenu, LuX, LuShoppingCart, LuSearch, LuPhone, LuMapPin, LuMail, LuMessageCircle, LuInstagram, LuFacebook, LuYoutube } from 'react-icons/lu';
import { useStore } from '../store.jsx';
import { safeLink } from '../lib/catalog.js';
import { waUrl } from '../lib/whatsapp.js';
import { go } from '../lib/router.js';

const NAV = [['/', 'Home'], ['/shop', 'Shop'], ['/products', 'All products'], ['/categories', 'Categories'], ['/projects', 'Projects'], ['/about', 'About us'], ['/contact', 'Contact us']];
const LOGO = './assets/logo/vijay-shree-logo.png';

export const tel = (p) => `tel:${String(p).replace(/[^\d+]/g, '')}`;
export const whatsappLink = (settings, text = '') =>
  (!text && safeLink(settings.social.whatsapp)) || waUrl(settings.contact.whatsappNumber, text);

export function socialLinks(s) {
  return [
    ['WhatsApp', LuMessageCircle, whatsappLink(s)],
    ['Instagram', LuInstagram, safeLink(s.social.instagram)],
    ['Facebook', LuFacebook, safeLink(s.social.facebook)],
    ['YouTube', LuYoutube, safeLink(s.social.youtube)],
    ['Google Maps', LuMapPin, safeLink(s.social.googleMaps)],
  ].filter(([, , url]) => url);
}

function Header({ path }) {
  const { cart, settings } = useStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  useEffect(() => setOpen(false), [path]);
  const search = (e) => { e.preventDefault(); setOpen(false); go('/products', { q: q.trim() }); };
  const link = ([to, label]) => (
    <a key={to} href={`#${to}`} aria-current={path === to ? 'page' : undefined}
      className={`border-b-2 py-2 text-sm font-semibold ${path === to ? 'border-bronze' : 'border-transparent hover:border-champagne'}`}>{label}</a>
  );
  const searchForm = (cls) => (
    <form onSubmit={search} role="search" className={`items-center border border-silver bg-white ${cls}`}>
      <input className="min-w-0 flex-1 px-3 py-2 text-sm" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Product name or code" aria-label="Search products" />
      <button className="p-2.5" aria-label="Search"><LuSearch aria-hidden /></button>
    </form>
  );
  return (
    <header className="sticky top-0 z-30 border-b border-silver bg-white">
      <div className="wrap flex h-18 items-center gap-3">
        <a href="#/" className="flex min-w-0 items-center gap-2">
          <img src={LOGO} alt={`${settings.company.name} logo`} width="64" height="64" className="size-16 shrink-0" />
          <span className="font-display text-base font-bold leading-tight sm:text-lg">{settings.company.name}</span>
        </a>
        {searchForm('ml-auto hidden w-72 md:flex')}
        <a href="#/cart" className="btn btn-secondary btn-sm relative ml-auto md:ml-0" aria-label={`Cart, ${cart.length} ${cart.length === 1 ? 'product' : 'products'}`}>
          <LuShoppingCart aria-hidden className="size-5" /><span className="hidden sm:inline">Cart</span>
          {cart.length > 0 && <span className="min-w-5 rounded-full bg-bronze px-1.5 text-xs text-white">{cart.length}</span>}
        </a>
        <button className="p-2 lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label="Menu">
          {open ? <LuX className="size-6" aria-hidden /> : <LuMenu className="size-6" aria-hidden />}
        </button>
      </div>
      <nav aria-label="Main" className="wrap hidden gap-7 lg:flex">{NAV.map(link)}</nav>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="wrap flex flex-col items-start gap-1 pb-4 lg:hidden">
          {searchForm('mb-2 flex w-full md:hidden')}
          {NAV.map(link)}
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { settings: s, categories } = useStore();
  return (
    <footer className="mt-16 bg-ink pb-24 text-gray-200 sm:pb-8">
      <div className="flutes h-3" aria-hidden />
      <div className="wrap grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl text-white">{s.company.name}</p>
          <p className="mt-2 text-sm">{s.company.tagline}</p>
          <p className="mt-1 text-sm text-champagne">Since {s.company.since}</p>
        </div>
        <nav aria-label="Categories">
          <h2 className="text-lg text-white">Categories</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {categories.slice(0, 7).map((c) => <li key={c.id}><a className="hover:underline" href={`#/category/${c.id}`}>{c.name}</a></li>)}
            <li><a className="text-champagne underline" href="#/categories">All categories</a></li>
          </ul>
        </nav>
        <div className="text-sm">
          <h2 className="text-lg text-white">Visit or call</h2>
          <p className="mt-2">{s.company.address}</p>
          {s.contact.phones.map((p) => <p key={p} className="mt-1"><a className="inline-flex items-center gap-2 hover:underline" href={tel(p)}><LuPhone aria-hidden />{p}</a></p>)}
          {s.contact.email && <p className="mt-1"><a className="inline-flex items-center gap-2 hover:underline" href={`mailto:${s.contact.email}`}><LuMail aria-hidden />{s.contact.email}</a></p>}
        </div>
        <div>
          <h2 className="text-lg text-white">Follow us</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {socialLinks(s).map(([name, Icon, url]) => (
              <li key={name}><a href={url} target="_blank" rel="noopener noreferrer" aria-label={name} title={name} className="flex size-11 items-center justify-center border border-gray-500 hover:border-champagne"><Icon aria-hidden className="size-5" /></a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="wrap flex flex-wrap justify-between gap-2 border-t border-gray-700 pt-4 text-xs text-gray-400">
        <p>© {new Date().getFullYear()} {s.company.name}</p>
        <a href="#/admin" className="underline">Admin editor</a>
      </div>
    </footer>
  );
}

export default function Layout({ path, children }) {
  const { settings, toast, preview, previewRequested, togglePreview, products } = useStore();
  const hasSamples = products.some((p) => p.sample);
  // Pages with a long form or order button at the bottom keep the floating buttons out of the way on phones.
  const quiet = ['/checkout', '/cart', '/admin'].includes(path);
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:block focus:bg-white focus:p-3" onClick={(e) => { e.preventDefault(); document.getElementById('main').focus(); }}>Skip to content</a>
      {previewRequested && (
        <div role="status" className="bg-amber-300 px-4 py-2 text-center text-sm font-semibold text-black">
          {preview ? 'Preview of your unpublished admin edits. Only this browser tab sees them.' : 'No valid admin draft to preview. Showing the published website.'}{' '}
          <button className="underline" onClick={() => togglePreview(false)}>Exit preview</button>
        </div>
      )}
      {hasSamples && path !== '/admin' && (
        <p className="bg-amber-50 px-4 py-1.5 text-center text-sm text-amber-950">This catalogue includes sample listings. Their prices and details are examples only.</p>
      )}
      <Header path={path} />
      <main id="main" tabIndex={-1} className="min-h-[60vh] outline-none">{children}</main>
      <Footer />
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4">
        {toast && (
          <div key={toast.key} className="pointer-events-auto flex gap-3 bg-ink px-4 py-3 text-sm text-white shadow-lg">
            <span>{toast.text}</span>
            {toast.link && <a className="shrink-0 font-semibold text-glow underline" href={toast.link.href}>{toast.link.label}</a>}
          </div>
        )}
      </div>
      <div className={`fixed right-3 bottom-3 z-40 flex-col gap-2 ${quiet ? 'hidden sm:flex' : 'flex'}`}>
        <a className="flex size-13 items-center justify-center rounded-full bg-ink text-white shadow-lg" href={tel(settings.contact.phones[0] || '')} aria-label={`Call ${settings.contact.phones[0] || ''}`}><LuPhone aria-hidden className="size-6" /></a>
        <a className="flex size-13 items-center justify-center rounded-full bg-[#0f6b4f] text-white shadow-lg" href={whatsappLink(settings)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"><LuMessageCircle aria-hidden className="size-6" /></a>
      </div>
    </>
  );
}
