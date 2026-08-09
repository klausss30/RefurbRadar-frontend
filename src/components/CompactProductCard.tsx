import type { Product } from '../types/product';
import { getLocale } from '../config/countries';
import { formatPrice, formatRelativeTime } from '../utils/format';

interface CompactProductCardProps {
  product: Product;
}

export default function CompactProductCard({ product }: CompactProductCardProps) {
  const price = formatPrice(
    product.price,
    product.currency,
    getLocale(product.country),
    product.currencySymbol,
  );

  return (
    <article className="group flex h-full snap-start flex-col overflow-hidden rounded-[26px] border border-slate-200/80 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.13)] dark:border-white/10 dark:bg-slate-900 dark:shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex aspect-square items-center justify-center bg-[#f5f5f7] p-6 dark:bg-slate-800/75"
        aria-label={`View ${product.title} on Apple Store`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-sm text-slate-400">No image available</span>
        )}
      </a>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
          {product.category}
        </div>
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-slate-950 transition hover:text-blue-600 dark:text-white dark:hover:text-sky-300"
        >
          {product.title}
        </a>

        <div className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {price}
        </div>
        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Restocked {formatRelativeTime(product.publishedAt)}
        </div>

        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:bg-white dark:text-slate-950 dark:hover:bg-sky-300 dark:focus:ring-sky-900"
        >
          View on Apple Store
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h4m0 0v4m0-4-8 8m-2 2h10a2 2 0 0 0 2-2V9" />
          </svg>
        </a>
      </div>
    </article>
  );
}
