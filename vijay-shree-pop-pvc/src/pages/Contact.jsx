import { useState } from 'react';
import { useStore } from '../store.jsx';
import { PageHead, Field } from '../components/ui.jsx';
import ContactBlock from '../components/ContactBlock.jsx';
import { whatsappLink } from '../components/Layout.jsx';
import { openWhatsApp } from '../lib/whatsapp.js';

export default function Contact() {
  const { settings: s } = useStore();
  const [f, setF] = useState({ name: '', message: '' });
  const [url, setUrl] = useState('');
  const set = (k, v) => { setF({ ...f, [k]: v }); setUrl(''); };
  const send = (e) => {
    e.preventDefault();
    const u = whatsappLink(s, `Hello ${s.company.name},\nMy name is ${f.name.trim()}.\n\n${f.message.trim()}`);
    openWhatsApp(u); setUrl(u);
  };
  return (
    <>
      <PageHead title="Contact us">Visit the shop, call us or send a WhatsApp message.</PageHead>
      <div className="wrap space-y-8 py-10">
        <ContactBlock />
        <form onSubmit={send} className="panel max-w-xl space-y-4">
          <h2 className="text-2xl">Write to us on WhatsApp</h2>
          <Field label="Your name" name="name" required value={f.name} onChange={set} autoComplete="name" />
          <Field label="Message" name="message" required as="textarea" rows="4" value={f.message} onChange={set} />
          <button className="btn btn-wa" disabled={!f.name.trim() || !f.message.trim()}>Open in WhatsApp</button>
          {url && <p role="status">Press SEND in WhatsApp to deliver your message. <a className="link" href={url} target="_blank" rel="noopener noreferrer">Open WhatsApp again</a></p>}
        </form>
      </div>
    </>
  );
}
