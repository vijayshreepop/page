import { useStore } from '../store.jsx';
import { PageHead } from '../components/ui.jsx';

export default function About() {
  const { settings: s, categories } = useStore();
  return (
    <>
      <PageHead title="About us">{s.company.tagline}</PageHead>
      <div className="wrap grid gap-10 py-10 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {s.about.paragraphs.map((p, i) => <p key={i} className="max-w-2xl text-lg">{p}</p>)}
          <p className="border-l-2 border-bronze pl-3 font-display text-xl">{s.home.experienceText}</p>
          <h2 className="pt-6">{s.home.whyTitle}</h2>
          <ul className="divide-y divide-silver border-y border-silver">
            {s.home.why.map((w) => <li key={w.title} className="py-4"><h3>{w.title}</h3><p>{w.text}</p></li>)}
          </ul>
        </div>
        <aside>
          <img src="./assets/logo/vijay-shree-logo.png" alt={`${s.company.name} logo`} className="mx-auto w-full max-w-sm bg-white" />
          <div className="panel mt-5">
            <h2 className="text-xl">What we deal in</h2>
            <ul className="mt-2 space-y-1">{categories.map((c) => <li key={c.id}><a className="link" href={`#/category/${c.id}`}>{c.name}</a></li>)}</ul>
          </div>
        </aside>
      </div>
    </>
  );
}
