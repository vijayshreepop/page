import { useEffect, useState } from 'react';
import { useStore } from '../store.jsx';
import { buildOrder, money, unitLabel, orderBlock } from '../lib/pricing.js';
import { validateCustomer } from '../lib/forms.js';
import { orderMessage, openWhatsApp, waUrl } from '../lib/whatsapp.js';
import { go } from '../lib/router.js';
import { Empty, Field, focusFirstError, PageHead, QtyInput } from '../components/ui.jsx';
import Totals from '../components/Totals.jsx';

const STATES = ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'];

export default function Checkout({ query }) {
  const { cart, products, settings, categoryName, customer, setCustomer, setLastOrder, preview } = useStore();
  const buyId = query.buy;
  const [buyQty, setBuyQty] = useState(Number(query.qty) || 1);
  const [errors, setErrors] = useState({});
  useEffect(() => { setBuyQty(Number(query.qty) || 1); }, [buyId, query.qty]);
  // Buy now orders only the chosen product and leaves the cart as it is.
  const items = buyId ? [{ id: buyId, qty: buyQty }] : cart;
  const order = buildOrder(items, products);

  if (!items.length)
    return <div className="wrap py-10"><Empty title="Your cart is empty"><p>Add a product before checkout.</p><a className="btn btn-primary mt-4" href="#/products">Browse products</a></Empty></div>;

  const set = (k, v) => { setCustomer({ ...customer, [k]: v }); setErrors({ ...errors, [k]: undefined }); };
  const props = (name) => ({ name, value: customer[name], onChange: set, error: errors[name] });

  const submit = (e) => {
    e.preventDefault();
    const found = validateCustomer(customer);
    setErrors(found);
    if (Object.keys(found).length) return focusFirstError(found);
    if (!order.valid) return;
    const message = orderMessage({ company: settings.company.name, order, customer, categoryName, test: preview });
    const url = waUrl(settings.contact.whatsappNumber, message);
    const opened = openWhatsApp(url);
    setLastOrder({ url, message, opened, fromCart: !buyId });
    go('/order-ready');
  };

  const single = buyId ? order.lines[0] : null;
  return (
    <>
      <PageHead title="Checkout">Enter your details and check the order. Nothing is paid online.</PageHead>
      <form onSubmit={submit} noValidate className="wrap grid items-start gap-6 py-8 lg:grid-cols-[1fr_24rem]">
        <fieldset className="panel space-y-4">
          <legend className="sr-only">Your details</legend>
          <h2 className="text-2xl">Your details</h2>
          {Object.values(errors).some(Boolean) && <p role="alert" className="font-semibold text-red-800">Check the highlighted fields.</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required autoComplete="name" maxLength="80" {...props('name')} />
            <Field label="Mobile number" required type="tel" autoComplete="tel" maxLength="18" {...props('mobile')} />
          </div>
          <Field label="Email address" required type="email" autoComplete="email" maxLength="120" {...props('email')} />
          <Field label="Full address" required as="textarea" rows="3" autoComplete="street-address" maxLength="300" {...props('address')} />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="City" required autoComplete="address-level2" maxLength="60" {...props('city')} />
            <Field label="State" required autoComplete="address-level1" list="states" maxLength="60" {...props('state')} />
            <Field label="PIN code" required inputMode="numeric" autoComplete="postal-code" maxLength="6" {...props('pin')} />
          </div>
          <datalist id="states">{STATES.map((s) => <option key={s} value={s} />)}</datalist>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" autoComplete="organization" maxLength="100" {...props('company')} />
            <Field label="GST number" maxLength="15" {...props('gst')} />
          </div>
          <Field label="Delivery instructions" as="textarea" rows="2" maxLength="500" {...props('instructions')} />
          <p className="text-sm text-gray-600">This website does not save your details. They are placed in a WhatsApp message that you send yourself.</p>
        </fieldset>
        <section className="panel space-y-4" aria-label="Order summary">
          <h2 className="text-2xl">Order summary</h2>
          <ul className="divide-y divide-silver">
            {order.lines.map((l) => (
              <li key={l.id} className="py-3">
                <p className="font-semibold">{l.product?.name || 'Removed product'}</p>
                {l.product && <p className="text-sm break-words text-gray-600">Code {l.product.code}{l.product.sample ? ', sample listing' : ''}</p>}
                {l.error ? <p role="alert" className="text-sm text-red-800">{l.error}</p> : (
                  <div className="flex flex-wrap justify-between gap-2 text-sm">
                    <span>{l.qty} {unitLabel(l.product)} × {money(l.unitPrice)}{l.unitPrice < l.listPrice && <> (regular {money(l.listPrice)})</>}</span>
                    <strong>{money(l.total)}</strong>
                  </div>
                )}
              </li>
            ))}
          </ul>
          {single?.product && !orderBlock(single.product) && (
            <div><span className="field mb-1">Quantity</span><QtyInput product={single.product} value={buyQty} onChange={setBuyQty} /></div>
          )}
          <Totals order={order} />
          {!order.valid && <p className="text-sm text-red-800">{buyId ? 'Correct the quantity or choose another product.' : <>Go to your <a className="link" href="#/cart">cart</a> to fix the highlighted products.</>}</p>}
          <button className="btn btn-wa w-full text-base" disabled={!order.valid}>Send order on WhatsApp</button>
          <p className="text-sm">WhatsApp opens with your order written out. You must press <strong>SEND</strong> there.</p>
        </section>
      </form>
    </>
  );
}
