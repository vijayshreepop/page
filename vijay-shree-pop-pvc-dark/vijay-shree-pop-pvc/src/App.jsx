import { Component, Suspense, lazy, useEffect } from 'react';
import { StoreProvider, useStore } from './store.jsx';
import { useRoute } from './lib/router.js';
import { setPreview } from './lib/draft.js';
import Layout from './components/Layout.jsx';
import { Empty } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Products from './pages/Products.jsx';
import Categories from './pages/Categories.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import Projects from './pages/Projects.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';

// Shoppers never download the editor.
const Admin = lazy(() => import('./admin/Admin.jsx'));

const TITLES = { '/shop': 'Shop', '/products': 'All products', '/categories': 'Categories', '/cart': 'Cart', '/checkout': 'Checkout', '/order-ready': 'Press SEND in WhatsApp', '/projects': 'Interior projects', '/about': 'About us', '/contact': 'Contact us', '/admin': 'Admin editor' };

function safeDecode(v) { try { return decodeURIComponent(v); } catch { return v; } }

function Pages() {
  const { path, query } = useRoute();
  const { settings, products, categories } = useStore();
  const [, section, raw] = path.split('/');
  const id = raw ? safeDecode(raw) : '';
  useEffect(() => { window.scrollTo(0, 0); }, [path]);
  useEffect(() => {
    const name = section === 'product' ? products.find((p) => p.id === id)?.name : section === 'category' ? categories.find((c) => c.id === id)?.name : TITLES[path];
    document.title = name ? `${name} | ${settings.company.name}` : `${settings.company.name} | ${settings.company.tagline}`;
  }, [path, section, id, settings, products, categories]);

  const fixed = {
    '/': <Home />, '/shop': <Shop />, '/products': <Products query={query} />, '/categories': <Categories />, '/cart': <Cart />,
    '/checkout': <Checkout query={query} />, '/order-ready': <Confirmation />, '/projects': <Projects />, '/about': <About />, '/contact': <Contact />,
    '/admin': <Suspense fallback={<p className="wrap py-10">Opening editor…</p>}><Admin /></Suspense>,
  };
  let page = fixed[path];
  if (!page && section === 'product' && id) page = <Product id={id} query={query} />;
  if (!page && section === 'category' && id) page = <Products query={query} categoryId={id} />;
  if (!page) page = <div className="wrap py-10"><Empty title="Page not found"><a className="btn btn-primary" href="#/">Go to home page</a></Empty></div>;
  return <Layout path={path}><Boundary key={path}>{page}</Boundary></Layout>;
}

class Boundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="wrap py-10"><Empty title="This page could not be shown">
        <p>Reload the page. If you were previewing admin edits, exit the preview.</p>
        <button className="btn btn-primary mt-4" onClick={() => { setPreview(false); window.location.reload(); }}>Reload website</button>
      </Empty></div>
    );
  }
}

const Loading = ({ error, retry }) => (
  <div className="wrap py-24 text-center" role={error ? 'alert' : 'status'}>
    <img src="./assets/logo/vijay-shree-logo.png" alt="VIJAY SHREE POP & PVC" className="logo-plate mx-auto w-48" />
    {error ? (
      <>
        <p className="mt-4 text-lg">The catalogue could not load.</p>
        <p className="mx-auto mt-1 max-w-xl text-sm text-muted">{error}</p>
        <button className="btn btn-primary mt-4" onClick={retry}>Try again</button>
        <p className="mt-4">To order now, call <a className="link" href="tel:+919429093121">+91 94290 93121</a>.</p>
      </>
    ) : <p className="mt-4">Loading catalogue…</p>}
  </div>
);

export default function App() {
  return (
    <Boundary>
      <StoreProvider fallback={(p) => <Loading {...p} />}><Pages /></StoreProvider>
    </Boundary>
  );
}
