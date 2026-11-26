import { useEffect, useState } from 'react';
import { useStore } from '../store.jsx';
import { safeLink } from '../lib/catalog.js';
import { assetUrl } from '../lib/draft.js';
import { CategoryTiles, ProductGrid } from '../components/Cards.jsx';
import { Img } from '../components/ui.jsx';
import ContactBlock from '../components/ContactBlock.jsx';
import { GalleryGrid } from './Projects.jsx';

const Head = ({ title, to, label }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
    <h2>{title}</h2>
    {to && <a className="link text-sm font-semibold" href={to}>{label}</a>}
  </div>
);

function HeroVisual({ images }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (images.length < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((x) => x + 1), 5000);
    return () => clearInterval(t);
  }, [images.length, paused]);
  if (images.length) {
    const at = i % images.length;
    return (
      <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)}>
        <img src={assetUrl(images[at])} alt={`Showroom banner ${at + 1}`} className="aspect-[4/3] w-full object-cover" />
        {images.length > 1 && (
          <div className="mt-2 flex justify-center">
            {images.map((_, n) => <button key={n} className="p-2" aria-label={`Show banner ${n + 1}`} aria-current={n === at} onClick={() => { setI(n); setPaused(true); }}><span className={`block h-1.5 w-8 ${n === at ? 'bg-gold' : 'bg-line'}`} /></button>)}
          </div>
        )}
      </div>
    );
  }
  // Without banner photos, an abstract ceiling-and-wall study based on the logo's shapes.
  return (
    <div aria-hidden className="relative grid aspect-[4/3] grid-cols-[1fr_2.4fr_1fr] overflow-hidden rounded-lg border border-line bg-bg">
      <div className="flutes" />
      <div className="flex items-center justify-center bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-gold)_30%,var(--color-bg))_0%,var(--color-bg)_75%)]">
        <div className="cove w-[88%]"><i /><i /><i /></div>
      </div>
      <div className="bg-[repeating-linear-gradient(90deg,var(--color-surface-2)_0_30px,var(--color-gold)_30px_32px,var(--color-bg)_32px_36px)]" />
    </div>
  );
}

export default function Home() {
  const { settings: s, categories, products, gallery } = useStore();
  const h = s.home;
  const chosen = h.categoryIds.map((id) => categories.find((c) => c.id === id)).filter(Boolean);
  const featured = h.featuredProductIds.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  const years = new Date().getFullYear() - Number(s.company.since);
  return (
    <>
      <section className="bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--color-gold)_16%,var(--color-bg))_0%,var(--color-bg)_55%)]">
        <div className="wrap grid items-center gap-8 py-10 lg:grid-cols-[1fr_1.05fr] lg:py-16">
          <div>
            <h1 className="lg:text-6xl">{s.hero.headline}</h1>
            <p className="mt-4 max-w-xl text-lg text-muted">{s.hero.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {s.hero.buttons.filter((b) => safeLink(b.link)).map((b) => (
                <a key={b.label + b.link} href={safeLink(b.link)} className={`btn ${b.style === 'secondary' ? 'btn-secondary' : 'btn-primary'}`}>{b.label}</a>
              ))}
            </div>
            <p className="mt-6 border-l-2 border-gold pl-3 font-display text-lg">{h.experienceText}</p>
          </div>
          <HeroVisual images={s.hero.images} />
        </div>
      </section>
      <section className="wrap pt-14">
        <Head title={h.categoryTitle} to="#/categories" label="See all categories" />
        <CategoryTiles categories={chosen.length ? chosen : categories} />
      </section>
      {featured.length > 0 && (
        <section className="wrap pt-14">
          <Head title={h.featuredTitle} to="#/products" label="See all products" />
          <ProductGrid products={featured} />
        </section>
      )}
      <section className="wrap grid gap-10 pt-16 lg:grid-cols-2">
        <div>
          <h2>{h.aboutTitle}</h2>
          <p className="mt-3 max-w-xl">{h.aboutText}</p>
          <p className="mt-6 flex items-center gap-4">
            <span className="font-display text-5xl text-gold">{years}</span>
            <span className="max-w-48 text-sm">years since we started in {s.company.since}</span>
          </p>
          <a className="btn btn-secondary mt-6" href="#/about">About us</a>
        </div>
        <div>
          <h2>{h.whyTitle}</h2>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {h.why.map((w) => <li key={w.title} className="py-4"><h3>{w.title}</h3><p className="text-muted">{w.text}</p></li>)}
          </ul>
        </div>
      </section>
      <section className="wrap pt-16">
        <Head title={h.projectsTitle} to="#/projects" label="Open projects gallery" />
        <GalleryGrid items={gallery.slice(0, 3)} Img={Img} />
      </section>
      <section className="wrap pt-16">
        <Head title="Contact us" />
        <ContactBlock />
      </section>
    </>
  );
}
