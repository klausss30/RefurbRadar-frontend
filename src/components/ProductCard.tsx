import type { Product } from "../types/product";
import { formatPrice, formatRelativeTime } from "../utils/format";
import { extractOverviewItems } from "../utils/html";
import { useImageCache } from "../hooks/useImageCache";
import { getLocale } from "../config/countries";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const imageStatus = useImageCache(product.imageUrl);
  const overviewItems = product.specsText
    ? extractOverviewItems(product.specsText)
    : [];

  return (
    <article className="punk-card soft-card group flex h-full flex-col overflow-hidden transition duration-300">
      <div className="punk-media relative overflow-hidden border-b p-4">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),transparent_65%)] dark:bg-[linear-gradient(135deg,rgba(0,0,0,0.2),transparent_65%)]" />
        <div className="relative flex items-center justify-between gap-3">
          <span className="punk-chip px-3 py-1 text-[11px] font-bold uppercase">
            {product.category}
          </span>
          <span className="border border-black bg-transparent px-3 py-1 text-[11px] font-bold uppercase text-black">
            Listed {formatRelativeTime(product.publishedAt)}
          </span>
        </div>

        <div className="relative mt-4 flex h-40 items-center justify-center overflow-hidden border border-black bg-[#f7f6f0] sm:h-48 lg:aspect-[4/3] lg:h-auto">
          {product.imageUrl && imageStatus === 'loaded' ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-2/3 w-2/3 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-slate-950 opacity-0 transition-opacity duration-300 group-hover:opacity-[0.03]" />
            </>
          ) : product.imageUrl && imageStatus === 'loading' ? (
            <div className="flex h-full w-full items-center justify-center p-4 text-center">
              <div className="flex animate-pulse flex-col items-center">
                <svg
                  className="mx-auto mb-2 h-12 w-12 text-slate-300 dark:text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <div className="text-xs font-medium text-slate-400 dark:text-slate-500">Loading image...</div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <svg
                className="mx-auto mb-2 h-16 w-16 text-slate-300 dark:text-slate-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
                {product.imageUrl ? 'Image failed to load' : 'No image available'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-3 min-h-[6.5rem]">
          <h3 className="text-lg font-semibold leading-tight text-slate-950 dark:text-slate-50">
            {product.title}
          </h3>
        </div>

        <div className="mb-4 border border-black bg-[#e7e6df] p-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Price
          </div>
          <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
            {formatPrice(
              product.price,
              product.currency,
              getLocale(product.country),
              product.currencySymbol,
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Highlights
          </div>

          <div className="flex-1 border border-black bg-[#faf9f4] p-3">
            {overviewItems.length > 0 ? (
              <ul className="space-y-2.5">
                {overviewItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-[13px] leading-relaxed text-slate-700 dark:text-slate-300"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-[#ff3028]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Specs are still loading in from the feed for this item.
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-end border-t border-slate-200/70 pt-3 dark:border-slate-700/70">
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="punk-action inline-flex w-full items-center justify-center gap-2 px-3 py-2 text-[11px] font-black transition"
          >
            View on Apple Store
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h4m0 0v4m0-4-8 8m-2 2h10a2 2 0 002-2V9"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
