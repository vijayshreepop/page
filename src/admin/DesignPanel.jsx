import { useState } from 'react';
import { DEFAULT_THEME, THEME_FIELDS, isHex, resolveTheme } from '../lib/theme.js';
import { DEFAULT_LOGO, DEFAULT_TEXT, TEXT_GROUPS } from '../lib/text.js';
import { validateSettings } from '../lib/schema.js';
import { Errors, Text, Thumb } from './shared.jsx';

export default function DesignPanel({ data, update }) {
  const [theme, setTheme] = useState(() => ({ ...DEFAULT_THEME, ...data.settings.theme }));
  const [text, setText] = useState(() => ({ ...DEFAULT_TEXT, ...data.settings.text }));
  const [logo, setLogo] = useState(data.settings.company.logo || DEFAULT_LOGO);
  const [errors, setErrors] = useState([]);
  const [saved, setSaved] = useState(false);
  const color = (k) => (v) => { setSaved(false); setTheme((t) => ({ ...t, [k]: v })); };
  const shown = resolveTheme(theme);

  const save = (e) => {
    e.preventDefault();
    const settings = { ...data.settings, theme, text, company: { ...data.settings.company, logo: logo.trim() } };
    const found = validateSettings(settings);
    setErrors(found);
    if (!found.length) { update({ settings }); setSaved(true); }
  };

  return (
    <form onSubmit={save} noValidate className="space-y-5">
      <section className="panel space-y-4">
        <h2 className="text-2xl">Website colours</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {THEME_FIELDS.map(([k, label]) => (
            <div key={k} className="flex items-end gap-2">
              <input type="color" aria-label={`${label}: colour picker`} className="h-11 w-14 shrink-0 border border-line" value={isHex(theme[k]) ? theme[k] : DEFAULT_THEME[k]} onChange={(e) => color(k)(e.target.value)} />
              <div className="flex-1"><Text label={label} value={theme[k]} onChange={color(k)} maxLength="7" /></div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-line p-4" style={{ background: shown.background, color: shown.text }} aria-label="Colour sample">
          <p className="font-display text-2xl">Colour sample</p>
          <p className="my-2" style={{ color: shown.gold }}>Gold highlight text</p>
          <span className="inline-block rounded-md px-4 py-2 font-semibold" style={{ background: shown.gold, color: shown.background }}>Button</span>{' '}
          <span className="inline-block rounded-md px-4 py-2 text-white" style={{ background: shown.waButton }}>WhatsApp button</span>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSaved(false); setTheme({ ...DEFAULT_THEME }); }}>Reset to default dark colours</button>
      </section>
      <section className="panel space-y-3">
        <h2 className="text-2xl">Logo</h2>
        <div className="flex items-start gap-3"><span className="logo-plate shrink-0 p-1"><Thumb path={logo} /></span><div className="min-w-0 flex-1"><Text label="Logo file path" value={logo} onChange={(v) => { setSaved(false); setLogo(v); }} /></div></div>
        <p className="text-sm">To change the logo, upload your original file to <code>public/assets/logo/</code> in GitHub and type its path here. The website shows it without editing it.</p>
      </section>
      {TEXT_GROUPS.map(([group, fields]) => (
        <details key={group} className="panel">
          <summary className="font-display text-xl">{group}</summary>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {Object.entries(fields).map(([k, [label]]) => <Text key={k} label={label} value={text[k]} onChange={(v) => { setSaved(false); setText((t) => ({ ...t, [k]: v })); }} />)}
          </div>
        </details>
      ))}
      <p className="text-sm">An empty text box uses the original wording. Homepage content is under Homepage; phone numbers and links are under Contact and social.</p>
      <Errors list={errors} />
      <button className="btn btn-primary">Save to draft</button>
      {saved && <p role="status" className="text-sm">Saved to this browser's draft. Press Preview to check it, then export settings.json to publish.</p>}
    </form>
  );
}
