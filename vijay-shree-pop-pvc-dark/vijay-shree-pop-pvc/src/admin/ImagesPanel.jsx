import { useState } from 'react';
import { pendingImages } from '../lib/draft.js';
import { Img } from '../components/ui.jsx';
import { ImageUpload, Select, productFolder, download } from './shared.jsx';

export default function ImagesPanel({ data }) {
  const folders = [...new Set([...data.categories.map((c) => productFolder(c.id)), 'banners', 'gallery'])];
  const [folder, setFolder] = useState(folders[0]);
  const [, refresh] = useState(0);
  const [page, setPage] = useState(1);
  const used = new Map();
  const note = (path, by) => path && used.set(path, [...(used.get(path) || []), by]);
  data.products.forEach((p) => [p.image, ...(p.images || [])].forEach((i) => note(i, p.code)));
  data.categories.forEach((c) => note(c.image, c.name));
  data.settings.hero.images.forEach((i) => note(i, 'Homepage banner'));
  data.gallery.forEach((g) => note(g.image, 'Gallery'));
  const all = [...used];
  const missingMain = data.products.filter((p) => !p.image).length;
  const redownload = async (path, url) => download(path.split('/').pop(), await (await fetch(url)).blob());
  return (
    <div className="space-y-5">
      <section className="panel space-y-3">
        <h2 className="text-2xl">Prepare photos</h2>
        <ol className="list-decimal space-y-1 pl-5">
          <li>Choose a folder, then a photo. It is resized to 1600px or less, compressed and downloaded with a safe file name.</li>
          <li>In GitHub, open <code>public/assets/{folder}/</code>, then choose Add file, Upload files.</li>
          <li>Upload the downloaded file without renaming it. Names are case-sensitive.</li>
          <li>Copy the path shown below into a product, banner or gallery item. Or use the photo button inside that editor, which fills the path for you.</li>
        </ol>
        <p className="text-sm font-semibold">A photo is not public until the file is committed to GitHub and the deployment finishes. Previews here disappear when you reload.</p>
        <Select label="Folder" value={folder} onChange={setFolder} options={folders.map((f) => [f, `public/assets/${f}/`])} />
        <ImageUpload folder={folder} onPath={() => refresh((n) => n + 1)} />
        {[...pendingImages].map(([path, url]) => (
          <div key={path} className="flex flex-wrap items-center gap-3"><img src={url} alt="" className="size-14 object-cover" /><code className="min-w-0 flex-1 text-sm break-all">{path}</code>
            <button className="btn btn-secondary btn-sm" onClick={() => redownload(path, url)}>Download again</button></div>
        ))}
      </section>
      <section className="panel">
        <h2 className="text-2xl">Images used by the website ({all.length})</h2>
        <p className="text-sm">{missingMain} product(s) have no main image. A path showing "Photo coming soon" means the file is not on the website yet.</p>
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {all.slice(0, page * 40).map(([path, by]) => <li key={path} className="text-xs break-all"><Img src={path} alt={path} className="aspect-square w-full" /><p>{path}</p><p className="text-muted">Used by {by.slice(0, 3).join(', ')}</p></li>)}
        </ul>
        {all.length > page * 40 && <button className="btn btn-secondary btn-sm mt-3" onClick={() => setPage(page + 1)}>Show more</button>}
      </section>
    </div>
  );
}
