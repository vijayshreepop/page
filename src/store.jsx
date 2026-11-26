import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CART_KEY, parseCart, addItem } from './lib/cart.js';
import { FILES, isPreview, readDraft, setPreview } from './lib/draft.js';
import { validateAll } from './lib/schema.js';
import { applyTheme } from './lib/theme.js';
import { DEFAULT_LOGO, resolveText } from './lib/text.js';
import { assetUrl } from './lib/draft.js';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

const loadCart = () => { try { return parseCart(localStorage.getItem(CART_KEY)); } catch { return []; } };

export function StoreProvider({ children, fallback }) {
  const [published, setPublished] = useState(null);
  const [error, setError] = useState('');
  const [previewOn, setPreviewOn] = useState(isPreview);
  const [draftVersion, setDraftVersion] = useState(0);
  const [cart, setCartState] = useState(loadCart);
  const [toast, setToast] = useState(null);
  // Customer details stay in memory only. They are never written to storage or files.
  const [customer, setCustomer] = useState({ name: '', mobile: '', email: '', address: '', city: '', state: '', pin: '', company: '', gst: '', instructions: '' });
  const [lastOrder, setLastOrder] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const results = await Promise.all(FILES.map(async (f) => {
        const res = await fetch(`./data/${f}.json`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`${f}.json returned ${res.status}`);
        try { return await res.json(); } catch { throw new Error(`${f}.json is not valid JSON`); }
      }));
      const data = Object.fromEntries(FILES.map((f, i) => [f, results[i]]));
      const problems = validateAll(data);
      if (problems.length) throw new Error(problems.slice(0, 3).join(' '));
      setPublished(data);
    } catch (e) { setError(e.message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const draft = useMemo(() => (previewOn ? readDraft() : null), [previewOn, draftVersion]);
  const draftValid = !!draft && validateAll(draft.data).length === 0;
  const data = draftValid ? draft.data : published;

  const setCart = useCallback((next) => {
    setCartState(next);
    try { localStorage.setItem(CART_KEY, JSON.stringify(next)); } catch { /* cart then lasts for this visit only */ }
  }, []);
  useEffect(() => {
    const on = (e) => { if (e.key === CART_KEY) setCartState(parseCart(e.newValue)); };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const notify = useCallback((text, link) => setToast({ text, link, key: Date.now() }), []);

  const add = useCallback((product, qty = 1) => {
    const res = addItem(cart, product, qty);
    if (res.error) notify(res.error);
    else { setCart(res.cart); notify(`Added ${product.name} to cart.`, { href: '#/cart', label: 'View cart' }); }
    return !res.error;
  }, [cart, setCart, notify]);

  const togglePreview = useCallback((on) => { setPreview(on); setPreviewOn(on); setDraftVersion((v) => v + 1); }, []);

  useEffect(() => {
    if (!data) return;
    applyTheme(data.settings.theme);
    document.querySelector('link[rel="icon"]')?.setAttribute('href', assetUrl(data.settings.company.logo || DEFAULT_LOGO));
  }, [data]);

  if (!data) return fallback({ error, retry: load });

  const categoryName = (id) => data.categories.find((c) => c.id === id)?.name || id;
  const value = {
    ...data, published, text: resolveText(data.settings.text), logo: assetUrl(data.settings.company.logo || DEFAULT_LOGO), categoryName, cart, setCart, add, toast, notify, customer, setCustomer, lastOrder, setLastOrder,
    preview: draftValid, previewRequested: previewOn, togglePreview,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
