import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store.jsx';
import { Img as BaseImg, Empty, PageHead } from '../components/ui.jsx';
import { whatsappLink } from '../components/Layout.jsx';

export function GalleryGrid({ items, onOpen, Img = BaseImg }) {
  const { settings } = useStore();
  if (!items.length)
    return (
      <Empty title="Project photos coming soon">
        <p>Ask us on WhatsApp to see photos of ceiling and wall work.</p>
        <a className="btn btn-wa mt-4" target="_blank" rel="noopener noreferrer" href={whatsappLink(settings, `Hello ${settings.company.name}, please share photos of your interior projects.`)}>Ask for project photos</a>
      </Empty>
    );
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((g, i) => {
        const body = <><Img src={g.image} alt={g.title || 'Interior project'} className="aspect-[4/3] w-full" /><span className="block p-3 text-left"><span className="block font-display text-lg">{g.title}</span><span className="text-sm text-gray-600">{g.caption}</span></span></>;
        return <li key={g.id || i} className="border border-silver bg-white">{onOpen ? <button className="block w-full" onClick={() => onOpen(g)}>{body}</button> : <a href="#/projects" className="block">{body}</a>}</li>;
      })}
    </ul>
  );
}

export default function Projects() {
  const { gallery } = useStore();
  const [open, setOpen] = useState(null);
  const dialog = useRef(null);
  useEffect(() => { if (open && !dialog.current.open) dialog.current.showModal(); }, [open]);
  return (
    <>
      <PageHead title="Interior projects">Ceiling and wall work.</PageHead>
      <div className="wrap py-8">
        <GalleryGrid items={gallery} onOpen={setOpen} />
        <dialog ref={dialog} onClose={() => setOpen(null)} className="m-auto w-[min(56rem,95vw)] bg-white p-3 backdrop:bg-black/70" aria-label="Project photo">
          {open && <>
            <BaseImg src={open.image} alt={open.title || 'Interior project'} fit="object-contain" className="max-h-[70vh] w-full" eager />
            <div className="mt-3 flex items-start justify-between gap-3">
              <div><h2 className="text-xl">{open.title}</h2><p className="text-sm">{open.caption}</p></div>
              <button autoFocus className="btn btn-secondary btn-sm" onClick={() => dialog.current.close()}>Close</button>
            </div>
          </>}
        </dialog>
      </div>
    </>
  );
}
