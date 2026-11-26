import { useEffect, useState } from 'react';
import { useStore } from '../store.jsx';
import { clearDraft, FILES, readDraft, same, writeDraft } from '../lib/draft.js';
import { fileFingerprint, fingerprint, reconcile } from '../lib/sync.js';
import { go } from '../lib/router.js';
import ProductsPanel from './ProductsPanel.jsx';
import CategoriesPanel from './CategoriesPanel.jsx';
import { ContactPanel, HomePanel, GalleryPanel } from './SettingsPanels.jsx';
import ImagesPanel from './ImagesPanel.jsx';
import DesignPanel from './DesignPanel.jsx';
import FilesPanel from './FilesPanel.jsx';

const TABS = [['products', 'Products', ProductsPanel], ['categories', 'Categories', CategoriesPanel], ['images', 'Images', ImagesPanel], ['design', 'Design and text', DesignPanel], ['home', 'Homepage', HomePanel],
  ['contact', 'Contact and social', ContactPanel], ['gallery', 'Gallery', GalleryPanel], ['files', 'Import and export', FilesPanel]];

const fresh = (published) => ({ data: structuredClone(published), base: fingerprint(published) });

export default function Admin() {
  const { published, togglePreview } = useStore();
  const [tab, setTab] = useState('products');
  const [draft, setDraft] = useState(() => {
    const saved = readDraft();
    return saved ? reconcile(saved, published) : fresh(published);
  });
  const [saveFailed, setSaveFailed] = useState(false);
  const [version, setVersion] = useState(0);
  const changed = FILES.filter((f) => !same(draft.data[f], published[f]));
  const conflicts = FILES.filter((f) => changed.includes(f) && draft.base[f] !== fileFingerprint(published[f]));

  useEffect(() => {
    if (!changed.length) { clearDraft(); setSaveFailed(false); return; }
    setSaveFailed(!writeDraft(draft));
  }, [draft]);

  // Picks up edits made in another admin tab.
  useEffect(() => {
    const on = () => { const s = readDraft(); if (s) { setDraft(reconcile(s, published)); setVersion((v) => v + 1); } };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, [published]);

  const update = (patch) => setDraft((d) => ({ ...d, data: { ...d.data, ...patch } }));
  const reset = () => { clearDraft(); setDraft(fresh(published)); setVersion((v) => v + 1); };
  const Panel = TABS.find((t) => t[0] === tab)[2];

  return (
    <div className="wrap space-y-5 py-6">
      <h1>Admin editor</h1>
      <div className="border-l-4 border-amber-500 bg-surface p-4">
        <p className="font-semibold">Edits here stay in this browser. They do not change the published website.</p>
        <p className="mt-1 text-sm">To publish, export the changed files and upload them to GitHub. This page has no password because it cannot change anything online: only someone who can sign in to your GitHub repository can publish.</p>
      </div>
      {saveFailed && <p role="alert" className="border-l-4 border-red-400 bg-red-950 p-3 font-semibold">This browser could not save your draft (storage is full or blocked). Export your files now, before closing the tab.</p>}
      {conflicts.length > 0 && <p role="alert" className="border-l-4 border-red-400 bg-red-950 p-3"><strong>The published {conflicts.map((f) => `${f}.json`).join(', ')} changed after you started editing.</strong> Uploading your export would overwrite those newer changes. Export a copy of your draft for reference, then discard the draft and make your edits again.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm">{changed.length ? `Unpublished changes in ${changed.length} file(s).` : 'Draft matches the published website.'}</span>
        <button className="btn btn-secondary btn-sm" disabled={!changed.length || saveFailed} onClick={() => { togglePreview(true); go('/'); }}>Preview website with draft</button>
      </div>
      <nav aria-label="Editor sections" className="flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(([id, label]) => <button key={id} aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)} className={`shrink-0 border-b-3 px-3 py-2 text-sm font-semibold ${tab === id ? 'border-gold' : 'border-transparent'}`}>{label}</button>)}
      </nav>
      <Panel key={`${tab}-${version}`} data={draft.data} update={update} changed={changed} reset={reset} hasDraft={changed.length > 0} />
    </div>
  );
}
