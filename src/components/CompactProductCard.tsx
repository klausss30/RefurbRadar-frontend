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
    <article className="punk-card group flex h-full snap-start flex-col overflow-hidden border bg-white transition duration-300">
      <a
        href={product.link}
        target="_blank"
        rel="noopener noreferrer"
        className="punk-media flex aspect-square items-center justify-center border-b p-5"
        aria-label={`View ${product.title} on Apple Store`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            className="h-2/3 w-2/3 object-contain transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <span className="text-sm text-slate-400">No image available</span>
        )}
      </a>

      <div className="flex flex-1 flex-col p-5">
        <div className="punk-index">
          {product.productFamily || product.category}
        </div>
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 text-base font-black leading-6 text-black transition hover:text-[#ff3028]"
        >
          {product.title}
        </a>

        <div className="mt-auto pt-4">
          <div className="border-t border-black pt-3 text-2xl font-black tracking-tight text-black">
            {price}
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Listed {formatRelativeTime(product.publishedAt)}
          </div>

          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="punk-action mt-4 inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-black transition focus:outline-none"
          >
            View on Apple Store
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h4m0 0v4m0-4-8 8m-2 2h10a2 2 0 0 0 2-2V9" />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
