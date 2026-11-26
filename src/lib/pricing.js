export const UNITS = ['Piece', 'Sheet', 'Box', 'Bag', 'Roll', 'Square Foot', 'Running Foot', 'Custom Unit'];
export const AVAILABILITY = {
  in_stock: 'In stock',
  limited: 'Limited stock',
  made_to_order: 'Made to order',
  out_of_stock: 'Out of stock',
};
const DECIMAL_UNITS = ['Square Foot', 'Running Foot'];
export const MAX_QTY = 100000;

export const unitLabel = (p) => (p.unit === 'Custom Unit' ? p.customUnit || 'Unit' : p.unit || 'Piece');
export const isFixed = (p) => p.pricingMode === 'fixed' && Number(p.price) > 0;
export const hasDiscount = (p) =>
  isFixed(p) && Number(p.discountPrice) > 0 && Number(p.discountPrice) < Number(p.price);
export const effectivePrice = (p) => (isFixed(p) ? Number(hasDiscount(p) ? p.discountPrice : p.price) : null);
export const allowsDecimal = (p) => DECIMAL_UNITS.includes(p.unit);

export const money = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: Number.isInteger(Number(n)) ? 0 : 2 });

const paise = (n) => Math.round(Number(n) * 100);

export function stockLimit(p) {
  const s = p.stockQuantity;
  return s === null || s === undefined || s === '' ? null : Number(s);
}

/** Returns an error string, or '' when the quantity can be ordered. */
export function quantityError(p, qty) {
  const n = Number(qty);
  if (!Number.isFinite(n) || n <= 0) return 'Enter a quantity greater than 0.';
  if (allowsDecimal(p)) {
    if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) return 'Use at most 2 decimal places.';
  } else if (!Number.isInteger(n)) return 'Enter a whole number.';
  if (n > MAX_QTY) return `The largest quantity is ${MAX_QTY}.`;
  const limit = stockLimit(p);
  if (limit !== null && n > limit) return `Only ${limit} available.`;
  return '';
}

/** Why a product cannot be ordered at all, or ''. */
export function orderBlock(p) {
  if (!p) return 'This product is no longer in the catalogue.';
  if (!isFixed(p)) return 'This product is now price on request. Send an enquiry instead.';
  if (p.availability === 'out_of_stock' || stockLimit(p) === 0) return 'This product is out of stock.';
  return '';
}

/** items: [{id, qty}] resolved against the loaded catalogue. */
export function buildOrder(items, products) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = items.map(({ id, qty }) => {
    const product = byId.get(id) || null;
    const error = orderBlock(product) || quantityError(product, qty);
    if (error) return { id, qty, product, error };
    const unitPrice = effectivePrice(product);
    return {
      id, qty: Number(qty), product, error: '',
      unitPrice,
      listPrice: Number(product.price),
      total: Math.round(paise(unitPrice) * Number(qty)) / 100,
      listTotal: Math.round(paise(product.price) * Number(qty)) / 100,
    };
  });
  const ok = lines.filter((l) => !l.error);
  const subtotal = ok.reduce((s, l) => s + paise(l.listTotal), 0) / 100;
  const total = ok.reduce((s, l) => s + paise(l.total), 0) / 100;
  return {
    lines, subtotal, total,
    discount: (paise(subtotal) - paise(total)) / 100,
    count: ok.length,
    valid: lines.length > 0 && ok.length === lines.length,
  };
}
