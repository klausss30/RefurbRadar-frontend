import { useEffect } from 'react';
import type { Product } from '../types/product';
import ProductCard from './ProductCard';
import { preloadImages } from '../hooks/useImageCache';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  // Preload images for visible products (first 20 products)
  // This helps cache images before user scrolls to them
  useEffect(() => {
    const visibleProducts = products.slice(0, 20);
    const imageUrls = visibleProducts
      .map(p => p.imageUrl)
      .filter((url): url is string => Boolean(url));
    
    // Preload unique image URLs only (avoid duplicates)
    const uniqueUrls = Array.from(new Set(imageUrls));
    if (uniqueUrls.length > 0) {
      preloadImages(uniqueUrls).catch(() => {
        // Silently handle errors, individual images will handle their own errors
      });
    }
  }, [products]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

