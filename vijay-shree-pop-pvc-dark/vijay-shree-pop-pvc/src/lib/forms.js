export function normalizeMobile(v) {
  let d = String(v || '').replace(/[\s\-()]/g, '');
  if (d.startsWith('+91')) d = d.slice(3);
  else if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : '';
}
export const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
export const validPin = (v) => /^[1-9]\d{5}$/.test(String(v || '').trim());
export const validGst = (v) => /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(String(v || '').trim().toUpperCase());

const t = (v) => String(v || '').trim();

export function validateCustomer(c) {
  const e = {};
  if (t(c.name).length < 2) e.name = 'Enter your full name.';
  if (!normalizeMobile(c.mobile)) e.mobile = 'Enter a 10-digit Indian mobile number, such as 98765 43210.';
  if (!validEmail(c.email)) e.email = 'Enter an email address, such as name@example.com.';
  if (t(c.address).length < 8) e.address = 'Enter your full address, including house or shop number and street.';
  if (!t(c.city)) e.city = 'Enter your city.';
  if (!t(c.state)) e.state = 'Choose or type your state.';
  if (!validPin(c.pin)) e.pin = 'Enter a 6-digit PIN code.';
  if (t(c.gst) && !validGst(c.gst)) e.gst = 'A GST number has 15 characters. Correct it or leave this empty.';
  return e;
}

export function validateEnquiry(f) {
  const e = {};
  if (t(f.name).length < 2) e.name = 'Enter your name.';
  if (!normalizeMobile(f.mobile)) e.mobile = 'Enter a 10-digit Indian mobile number.';
  if (t(f.email) && !validEmail(f.email)) e.email = 'Check this email address or leave it empty.';
  if (!(Number(f.quantity) > 0)) e.quantity = 'Enter the quantity you need.';
  return e;
}
