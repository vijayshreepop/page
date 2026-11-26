import { useStore } from '../store.jsx';
import { filterProducts } from '../lib/catalog.js';
import { PageHead } from '../components/ui.jsx';
import { CategoryTiles, ProductGrid } from '../components/Cards.jsx';

export default function Shop() {
  const { products, categories, settings, text } = useStore();
  const ids = settings.home.featuredProductIds;
  const featured = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 8);
  const newest = filterProducts(products, categories, { sort: 'newest' }).slice(0, 8);
  return (
    <>
      <PageHead title={text.shopTitle}>{text.shopIntro}</PageHead>
      <div className="wrap space-y-14 py-8">
        {featured.length > 0 && <section><h2 className="mb-5">{settings.home.featuredTitle}</h2><ProductGrid products={featured} /></section>}
        <section><h2 className="mb-5">{settings.home.categoryTitle}</h2><CategoryTiles categories={categories} /></section>
        <section>
          <h2 className="mb-5">New arrivals</h2>
          {newest.length ? <ProductGrid products={newest} /> : <p>No products yet.</p>}
          <div className="mt-8 text-center"><a className="btn btn-primary" href="#/products">Browse all {products.length} products</a></div>
        </section>
      </div>
    </>
  );
}
