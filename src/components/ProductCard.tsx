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
    <article className="soft-card group flex h-full flex-col overflow-hidden rounded-[30px] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_55px_rgba(15,23,42,0.14)]">
      <div className="relative overflow-hidden border-b border-slate-200/70 bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.95),_rgba(241,245,249,0.9))] p-5">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),transparent_65%)]" />
        <div className="relative flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/80 bg-white/75 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-600 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
            {product.category}
          </span>
          <span className="rounded-full bg-slate-950/85 px-3 py-1 text-[11px] font-semibold text-white">
            {formatRelativeTime(product.publishedAt)}
          </span>
        </div>

        <div className="relative mt-5 flex h-48 items-center justify-center overflow-hidden rounded-[24px] border border-white/70 bg-white/70 sm:h-56 lg:aspect-[4/3] lg:h-auto">
          {product.imageUrl && imageStatus === 'loaded' ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.title}
                className="h-full w-full object-contain p-5 transition-transform duration-300 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-slate-950 opacity-0 transition-opacity duration-300 group-hover:opacity-[0.03]" />
            </>
          ) : product.imageUrl && imageStatus === 'loading' ? (
            <div className="flex h-full w-full items-center justify-center p-4 text-center">
              <div className="flex animate-pulse flex-col items-center">
                <svg
                  className="mx-auto mb-2 h-12 w-12 text-slate-300"
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
                <div className="text-xs font-medium text-slate-400">Loading image...</div>
              </div>
            </div>
          ) : (
            <div className="text-center p-4">
              <svg
                className="mx-auto mb-2 h-16 w-16 text-slate-300"
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
              <div className="text-xs font-medium text-slate-400">
                {product.imageUrl ? 'Image failed to load' : 'No image available'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 min-h-[4.5rem]">
          <h3 className="text-xl font-semibold leading-tight text-slate-950">
            {product.title}
          </h3>
        </div>

        <div className="mb-5 rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Price
          </div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
            {formatPrice(product.price, product.currency, getLocale(product.country))}
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
            Highlights
          </div>

          {overviewItems.length > 0 ? (
            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4">
              <ul className="space-y-2.5">
                {overviewItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-sm leading-relaxed text-slate-700"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-slate-500">
              Specs are still loading in from the feed for this item.
            </p>
          )}
        </div>

        <div className="mt-5 flex items-center justify-end border-t border-slate-200/70 pt-4">
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
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
