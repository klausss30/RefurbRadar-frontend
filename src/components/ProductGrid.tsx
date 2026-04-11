import { useEffect } from 'react';
import type { Product } from '../types/product';
import ProductCard from './ProductCard';
import { preloadImages } from '../hooks/useImageCache';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
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

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 2xl:grid-cols-3">
      {products.map((product, index) => (
        <div
          key={product.id}
          className="fade-up"
          style={{ animationDelay: `${index * 45}ms` }}
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
