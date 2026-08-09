import { useRef } from 'react';
import type { Product } from '../types/product';
import CompactProductCard from './CompactProductCard';

interface ProductCarouselProps {
  products: Product[];
}

export default function ProductCarousel({ products }: ProductCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    scrollerRef.current?.scrollBy({
      left: direction * Math.max(280, scrollerRef.current.clientWidth * 0.8),
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="flex w-[86vw] max-w-[330px] shrink-0 sm:w-[46vw] lg:w-[calc((100%-2.5rem)/3)] lg:max-w-none xl:w-[calc((100%-3.75rem)/4)]"
          >
            <CompactProductCard product={product} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(-1)}
        className="absolute left-2 top-[34%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white md:flex dark:border-white/10 dark:bg-slate-800/90 dark:text-white"
        aria-label="Scroll products left"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 19-7-7 7-7" /></svg>
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        className="absolute right-2 top-[34%] hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white/90 text-slate-800 shadow-lg backdrop-blur transition hover:scale-105 hover:bg-white md:flex dark:border-white/10 dark:bg-slate-800/90 dark:text-white"
        aria-label="Scroll products right"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m9 5 7 7-7 7" /></svg>
      </button>
    </div>
  );
}
