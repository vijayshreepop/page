import { allowsDecimal, orderBlock, quantityError, stockLimit, MAX_QTY } from './pricing.js';

export const CART_KEY = 'vs-cart-v1';

export function parseCart(raw) {
  try {
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v.filter((i) => i && typeof i.id === 'string' && Number(i.qty) >= 0).map((i) => ({ id: i.id, qty: Number(i.qty) }));
  } catch {
    return [];
  }
}

export function addItem(cart, product, qty = 1) {
  const blocked = orderBlock(product);
  if (blocked) return { cart, error: blocked };
  const existing = cart.find((i) => i.id === product.id);
  const next = Math.round(((existing?.qty || 0) + Number(qty)) * 100) / 100;
  const error = quantityError(product, qty) || quantityError(product, next);
  if (error) return { cart, error };
  return {
    cart: existing ? cart.map((i) => (i.id === product.id ? { ...i, qty: next } : i)) : [...cart, { id: product.id, qty: next }],
    error: '',
  };
}

export const setQty = (cart, id, qty) => cart.map((i) => (i.id === id ? { ...i, qty } : i));
export const removeItem = (cart, id) => cart.filter((i) => i.id !== id);

export function stepQty(product, qty, dir) {
  const min = allowsDecimal(product) ? 0.01 : 1;
  const max = Math.min(stockLimit(product) ?? MAX_QTY, MAX_QTY);
  let n = Math.round((Number(qty || 0) + dir) * 100) / 100;
  if (!allowsDecimal(product)) n = Math.round(n);
  if (dir < 0 && n < min) n = Number(qty) > 0 ? Number(qty) : 1;
  return Math.min(Math.max(n, min), max);
}
