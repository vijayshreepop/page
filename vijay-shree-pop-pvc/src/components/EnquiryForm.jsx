import { useState } from 'react';
import { useStore } from '../store.jsx';
import { validateEnquiry } from '../lib/forms.js';
import { enquiryMessage, openWhatsApp, waUrl } from '../lib/whatsapp.js';
import { unitLabel } from '../lib/pricing.js';
import { Field, focusFirstError } from './ui.jsx';

export default function EnquiryForm({ product }) {
  const { settings, categoryName, preview, customer } = useStore();
  const [form, setForm] = useState({ name: customer.name, mobile: customer.mobile, email: customer.email, quantity: '1', message: '' });
  const [errors, setErrors] = useState({});
  const [url, setUrl] = useState('');
  const set = (k, v) => { setForm({ ...form, [k]: v }); setErrors({ ...errors, [k]: undefined }); setUrl(''); };
  const submit = (e) => {
    e.preventDefault();
    const found = validateEnquiry(form);
    setErrors(found);
    if (Object.keys(found).length) return focusFirstError(found);
    const u = waUrl(settings.contact.whatsappNumber, enquiryMessage({ company: settings.company.name, product, form, categoryName, test: preview }));
    openWhatsApp(u);
    setUrl(u);
  };
  const props = (name) => ({ name, value: form[name], onChange: set, error: errors[name] });
  return (
    <form id="enquiry" onSubmit={submit} noValidate className="panel space-y-4">
      <h2 className="text-2xl">Request a quote</h2>
      <p className="text-sm">Product: <strong>{product.name}</strong> (code {product.code})</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" required autoComplete="name" maxLength="80" {...props('name')} />
        <Field label="Mobile number" required type="tel" autoComplete="tel" maxLength="18" {...props('mobile')} />
        <Field label="Email" type="email" autoComplete="email" maxLength="120" {...props('email')} />
        <Field label={`Required quantity (${unitLabel(product)})`} required type="number" min="0" step="any" {...props('quantity')} />
      </div>
      <Field label="Message" as="textarea" rows="3" maxLength="600" {...props('message')} />
      <button className="btn btn-wa w-full">Send enquiry on WhatsApp</button>
      {url && (
        <p role="status" className="border-l-4 border-[#0f6b4f] bg-emerald-50 p-3">
          Your enquiry is ready in WhatsApp. Press <strong>SEND</strong> in WhatsApp to submit it. <a className="link" href={url} target="_blank" rel="noopener noreferrer">Open WhatsApp again</a>
        </p>
      )}
    </form>
  );
}
