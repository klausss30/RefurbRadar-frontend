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
    <section className="py-9 sm:py-12" aria-labelledby={`${group.slug}-heading`}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 id={`${group.slug}-heading`} className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
            {group.label}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {total} {total === 1 ? 'product' : 'products'} available
          </p>
        </div>
        <button
          type="button"
          onClick={() => onViewAll(group.slug)}
          className="group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-sky-300 dark:hover:bg-sky-400/10"
        >
          View all
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </button>
      </div>
      <ProductCarousel products={products} />
    </section>
  );
}
