import type { Product } from '../types/product';
import type { ProductGroup } from '../config/productGroups';
import ProductCarousel from './ProductCarousel';

interface ProductSectionProps {
  group: ProductGroup;
  products: Product[];
  total: number;
  onViewAll: (slug: string) => void;
}

export default function ProductSection({ group, products, total, onViewAll }: ProductSectionProps) {
  return (
    <section className="punk-section py-10 sm:py-14" aria-labelledby={`${group.slug}-heading`}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 id={`${group.slug}-heading`} className="text-3xl font-black tracking-[-0.06em] text-black sm:text-5xl">
            {group.label}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {total} {total === 1 ? 'product' : 'products'} available
          </p>
        </div>
        <button
          type="button"
          onClick={() => onViewAll(group.slug)}
          className="group inline-flex shrink-0 items-center gap-1.5 border border-black bg-transparent px-3 py-2 text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#ff3028] hover:text-white"
        >
          View all
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}
