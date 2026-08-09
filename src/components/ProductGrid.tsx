import { useEffect, useLayoutEffect, useRef } from 'react';
import type { Product } from '../types/product';
import ProductCard from './ProductCard';
import { preloadImages } from '../hooks/useImageCache';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const visibleProducts = products.slice(0, 20);
    const imageUrls = visibleProducts
      .map((p) => p.imageUrl)
      .filter((url): url is string => Boolean(url));

    const uniqueUrls = Array.from(new Set(imageUrls));
    if (uniqueUrls.length > 0) {
      preloadImages(uniqueUrls).catch(() => {
        // Silently handle errors, individual images will handle their own errors
      });
    }
  }, [products]);

  useLayoutEffect(() => {
    const alignTitleHeights = () => {
      const cards = Array.from(
        gridRef.current?.querySelectorAll<HTMLElement>('[data-product-card]') ?? [],
      );
      const rows = new Map<number, HTMLElement[]>();

      cards.forEach((card) => {
        const title = card.querySelector<HTMLElement>('[data-product-title]');
        if (!title) return;
        title.style.minHeight = '0px';

        const row = rows.get(card.offsetTop) ?? [];
        row.push(title);
        rows.set(card.offsetTop, row);
      });

      rows.forEach((titles) => {
        const tallestTitle = Math.max(...titles.map((title) => title.scrollHeight));
        titles.forEach((title) => {
          title.style.minHeight = `${tallestTitle}px`;
        });
      });
    };

    alignTitleHeights();
    window.addEventListener('resize', alignTitleHeights);
    document.fonts?.ready.then(alignTitleHeights);

    return () => window.removeEventListener('resize', alignTitleHeights);
  }, [products]);

  return (
    <div ref={gridRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product, index) => (
        <div
          key={product.id}
          data-product-card
          className="fade-up h-full"
          style={{ animationDelay: `${index * 45}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
