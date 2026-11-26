import { useStore } from '../store.jsx';
import { PageHead } from '../components/ui.jsx';
import { CategoryTiles } from '../components/Cards.jsx';

export default function Categories() {
  const { categories } = useStore();
  return (
    <>
      <PageHead title="Product categories">Choose a category to see its products and subcategories.</PageHead>
      <div className="wrap py-8"><CategoryTiles categories={categories} /></div>
    </>
  );
}
