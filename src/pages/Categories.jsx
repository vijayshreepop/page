import { useStore } from '../store.jsx';
import { PageHead } from '../components/ui.jsx';
import { CategoryTiles } from '../components/Cards.jsx';

export default function Categories() {
  const { categories, text } = useStore();
  return (
    <>
      <PageHead title={text.categoriesTitle}>{text.categoriesIntro}</PageHead>
      <div className="wrap py-8"><CategoryTiles categories={categories} /></div>
    </>
  );
}
