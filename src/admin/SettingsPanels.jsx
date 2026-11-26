import { useState } from 'react';
import { safeLink } from '../lib/catalog.js';
import { validateSettings, validateGallery } from '../lib/schema.js';
import { Errors, ImagePath, ImageUpload, Repeater, Select, Text, Thumb } from './shared.jsx';

/** Edits a copy of settings.json and stores it only when it is valid. */
function useSettingsForm(data, update) {
  const [s, setS] = useState(() => structuredClone(data.settings));
  const [errors, setErrors] = useState([]);
  const [saved, setSaved] = useState(false);
  const set = (section, key) => (v) => { setSaved(false); setS((x) => ({ ...x, [section]: { ...x[section], [key]: typeof v === 'function' ? v(x[section][key]) : v } })); };
  const field = (label, section, key, props) => <Text label={label} value={s[section][key]} onChange={set(section, key)} {...props} />;
  const save = (extra = () => []) => (e) => {
    e.preventDefault();
    const found = [...validateSettings(s), ...extra(s)];
    setErrors(found);
    if (!found.length) { update({ settings: s }); setSaved(true); }
  };
  const footer = (
    <>
      <Errors list={errors} />
      <button className="btn btn-primary">Save to draft</button>
      {saved && <p role="status" className="text-sm">Saved to this browser's draft. Export settings.json and upload it to publish.</p>}
    </>
  );
  return { s, set, field, save, footer };
}

const badLinks = (s) => [
  ...Object.entries(s.social).filter(([, v]) => v && !/^https:\/\//i.test(v)).map(([k]) => `${k}: use a full link that starts with https://`),
  ...(s.contact.phones.some((p) => !p.trim()) || !s.contact.phones.length ? ['Add at least one phone number and remove empty ones.'] : []),
];

export function ContactPanel({ data, update }) {
  const { s, set, field, save, footer } = useSettingsForm(data, update);
  return (
    <form onSubmit={save(badLinks)} noValidate className="space-y-5">
      <section className="panel space-y-3"><h2 className="text-2xl">Company information</h2>
        {field('Company name', 'company', 'name')}{field('Tagline', 'company', 'tagline')}
        {field('In business since (year)', 'company', 'since', { inputMode: 'numeric' })}
        {field('Business category', 'company', 'category', { area: true })}{field('Address', 'company', 'address', { area: true })}
      </section>
      <section className="panel space-y-3"><h2 className="text-2xl">Contact details</h2>
        <Repeater title="Phone numbers" items={s.contact.phones} onChange={set('contact', 'phones')} blank={() => ''} addLabel="Add phone number"
          render={(v, change) => <input className="input" aria-label="Phone number" value={v} onChange={(e) => change(e.target.value)} />} />
        {field('Email address', 'contact', 'email', { type: 'email' })}
        {field('WhatsApp number for orders (country code, digits only)', 'contact', 'whatsappNumber', { inputMode: 'numeric' })}
        <p className="text-sm text-gray-600">All orders and enquiries go to this number once published. Check it carefully. If you set a WhatsApp link below, it is used only by the general chat buttons.</p>
      </section>
      <section className="panel space-y-3"><h2 className="text-2xl">Social media links</h2>
        <p className="text-sm">Empty links are hidden on the website.</p>
        {field('WhatsApp link (optional, such as a wa.me or catalogue link)', 'social', 'whatsapp')}{field('Instagram', 'social', 'instagram')}
        {field('Facebook', 'social', 'facebook')}{field('YouTube', 'social', 'youtube')}{field('Google Maps', 'social', 'googleMaps')}
      </section>
      {footer}
    </form>
  );
}

export function HomePanel({ data, update }) {
  const { s, set, field, save, footer } = useSettingsForm(data, update);
  const [pick, setPick] = useState('');
  const name = (id) => { const p = data.products.find((x) => x.id === id); return p ? `${p.name} (${p.code})` : id; };
  const matches = pick.trim().length < 2 ? [] : data.products.filter((p) => !s.home.featuredProductIds.includes(p.id) && `${p.name} ${p.code}`.toLowerCase().includes(pick.toLowerCase())).slice(0, 6);
  const buttonErrors = (x) => (x.hero.buttons.some((b) => !b.label.trim() || !safeLink(b.link)) ? ['Each button needs a label and a link starting with #/ or https://'] : []);
  return (
    <form onSubmit={save(buttonErrors)} noValidate className="space-y-5">
      <section className="panel space-y-3"><h2 className="text-2xl">Hero</h2>
        {field('Headline', 'hero', 'headline')}{field('Description', 'hero', 'description', { area: true })}
        <Repeater title="Banner images" items={s.hero.images} onChange={set('hero', 'images')}
          render={(v, change) => <div className="flex items-center gap-2"><Thumb path={v} /><input className="input min-w-0" aria-label="Banner path" value={v} onChange={(e) => change(e.target.value)} /></div>} />
        <ImageUpload folder="banners" label="Add banner photo" onPath={(path) => set('hero', 'images')((list) => [...list, path])} />
        <Repeater title="Buttons" items={s.hero.buttons} onChange={set('hero', 'buttons')} blank={() => ({ label: '', link: '#/products', style: 'secondary' })} addLabel="Add button"
          render={(b, change) => <div className="grid gap-2 sm:grid-cols-3"><Text label="Label" value={b.label} onChange={(v) => change({ ...b, label: v })} /><Text label="Link" value={b.link} onChange={(v) => change({ ...b, link: v })} /><Select label="Style" value={b.style} onChange={(v) => change({ ...b, style: v })} options={[['primary', 'Solid'], ['secondary', 'Outline']]} /></div>} />
      </section>
      <section className="panel space-y-3"><h2 className="text-2xl">Categories and featured products</h2>
        {field('Category section title', 'home', 'categoryTitle')}
        <fieldset><legend className="field">Categories on the homepage (none ticked shows all)</legend>
          <div className="grid sm:grid-cols-2">{data.categories.map((c) => <label key={c.id} className="flex gap-2 py-1"><input type="checkbox" checked={s.home.categoryIds.includes(c.id)} onChange={(e) => set('home', 'categoryIds')(e.target.checked ? [...s.home.categoryIds, c.id] : s.home.categoryIds.filter((i) => i !== c.id))} />{c.name}</label>)}</div>
        </fieldset>
        {field('Featured section title', 'home', 'featuredTitle')}
        <Repeater title="Featured products" items={s.home.featuredProductIds} onChange={set('home', 'featuredProductIds')} render={(id) => <span>{name(id)}</span>} />
        <Text label="Find a product to feature (type 2 letters)" value={pick} onChange={setPick} />
        <div className="flex flex-wrap gap-2">{matches.map((p) => <button type="button" key={p.id} className="btn btn-secondary btn-sm" onClick={() => { set('home', 'featuredProductIds')([...s.home.featuredProductIds, p.id]); setPick(''); }}>Add {p.name} ({p.code})</button>)}</div>
      </section>
      <section className="panel space-y-3"><h2 className="text-2xl">About, experience and why choose us</h2>
        {field('Homepage About title', 'home', 'aboutTitle')}{field('Homepage About text', 'home', 'aboutText', { area: true })}{field('Experience line', 'home', 'experienceText')}
        <Repeater title="About us page paragraphs" items={s.about.paragraphs} onChange={set('about', 'paragraphs')} blank={() => ''} addLabel="Add paragraph"
          render={(v, change) => <textarea className="input" rows="3" aria-label="Paragraph" value={v} onChange={(e) => change(e.target.value)} />} />
        {field('Why choose us title', 'home', 'whyTitle')}
        <Repeater title="Reasons" items={s.home.why} onChange={set('home', 'why')} blank={() => ({ title: '', text: '' })} addLabel="Add reason"
          render={(w, change) => <div className="space-y-2"><Text label="Title" value={w.title} onChange={(v) => change({ ...w, title: v })} /><Text label="Text" value={w.text} onChange={(v) => change({ ...w, text: v })} /></div>} />
        {field('Interior projects section title', 'home', 'projectsTitle')}
        <p className="text-sm">The homepage shows the first 3 gallery photos. Contact details and social links are under Contact and social.</p>
      </section>
      {footer}
    </form>
  );
}

export function GalleryPanel({ data, update }) {
  const [items, setItems] = useState(() => structuredClone(data.gallery));
  const [errors, setErrors] = useState([]);
  const [saved, setSaved] = useState(false);
  const change = (next) => { setSaved(false); setItems(next); };
  const save = () => { const found = validateGallery(items); setErrors(found); if (!found.length) { update({ gallery: items }); setSaved(true); } };
  return (
    <div className="space-y-4">
      <p>Add photos of your own interior projects. Only use photos you have permission to publish.</p>
      <ImageUpload folder="gallery" label="Add project photo" onPath={(path) => { setSaved(false); setItems((x) => [...x, { id: `g-${Date.now().toString(36)}`, image: path, title: '', caption: '' }]); }} />
      <Repeater title={`Gallery (${items.length})`} items={items} onChange={change}
        render={(g, set) => <div className="space-y-2"><ImagePath label="Image path" value={g.image} onChange={(v) => set({ ...g, image: v })} folder="gallery" /><Text label="Title" value={g.title} onChange={(v) => set({ ...g, title: v })} /><Text label="Caption" value={g.caption} onChange={(v) => set({ ...g, caption: v })} /></div>} />
      <Errors list={errors} />
      <button className="btn btn-primary" onClick={save}>Save to draft</button>
      {saved && <p role="status" className="text-sm">Saved to the draft. Export gallery.json to publish.</p>}
    </div>
  );
}
