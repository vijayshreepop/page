import { money, unitLabel } from './pricing.js';
import { normalizeMobile } from './forms.js';

export const DEFAULT_NUMBER = '919429093121';
export const cleanNumber = (n) => String(n || '').replace(/\D/g, '') || DEFAULT_NUMBER;

export const waUrl = (number, text) =>
  `https://wa.me/${cleanNumber(number)}${text ? `?text=${encodeURIComponent(text.toWellFormed ? text.toWellFormed() : text)}` : ''}`;

// Keeps a typed value on one line so it cannot imitate other parts of the message.
const one = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const mobile = (v) => (normalizeMobile(v) ? `+91 ${normalizeMobile(v)}` : one(v));

export function orderMessage({ company, order, customer, categoryName, test = false }) {
  const out = [`*${company}*`, '*NEW CUSTOMER ORDER*'];
  if (test) out.push('*TEST - sent from admin preview*');
  out.push('', '*ORDER INFORMATION*');
  order.lines.forEach((l, i) => {
    const p = l.product;
    const unit = unitLabel(p);
    out.push(
      '',
      `*${i + 1}. ${one(p.name)}*${p.sample ? ' (SAMPLE LISTING)' : ''}`,
      `Code: ${one(p.code)}`,
      `Category: ${one(categoryName(p.category))}`,
      `Quantity: ${l.qty}`,
      `Unit: ${unit}`,
      `Price: ${money(l.unitPrice)} / ${unit}${l.unitPrice < l.listPrice ? ` (regular ${money(l.listPrice)})` : ''}`,
      `Subtotal: ${money(l.total)}`,
    );
  });
  out.push(
    '', '*CUSTOMER INFORMATION*',
    `Full Name: ${one(customer.name)}`,
    `Mobile: ${mobile(customer.mobile)}`,
    `Email: ${one(customer.email)}`,
    `Address: ${one(customer.address)}`,
    `City: ${one(customer.city)}`,
    `State: ${one(customer.state)}`,
    `PIN Code: ${one(customer.pin)}`,
  );
  if (one(customer.company)) out.push(`Company: ${one(customer.company)}`);
  if (one(customer.gst)) out.push(`GST Number: ${one(customer.gst).toUpperCase()}`);
  out.push(`Additional Instructions: ${one(customer.instructions) || 'None'}`);
  out.push(
    '', '*ORDER SUMMARY*',
    `Total Items: ${order.count}`,
    `Subtotal: ${money(order.subtotal)}`,
    `Discount: ${money(order.discount)}`,
    `*Estimated Total: ${money(order.total)}*`,
    '', 'Please confirm pricing, availability, payment and delivery.',
  );
  return out.join('\n');
}

export function enquiryMessage({ company, product, form, categoryName, test = false }) {
  const out = ['*PRODUCT PRICE ENQUIRY*'];
  if (test) out.push('*TEST - sent from admin preview*');
  out.push(
    '', `Company: ${company}`, '',
    `Product Name: ${one(product.name)}${product.sample ? ' (SAMPLE LISTING)' : ''}`,
    `Product Code: ${one(product.code)}`,
    `Category: ${one(categoryName(product.category))}`,
    `Required Quantity: ${one(form.quantity)} ${unitLabel(product)}`,
    '',
    `Customer Name: ${one(form.name)}`,
    `Mobile: ${mobile(form.mobile)}`,
    `Email: ${one(form.email) || 'Not given'}`,
    '',
    `Customer Message: ${String(form.message || '').trim() || 'None'}`,
  );
  return out.join('\n');
}

/** Must be called directly from a click or submit handler so the browser allows it. */
export function openWhatsApp(url) {
  const w = window.open(url, '_blank');
  if (w) w.opener = null;
  return !!w;
}
