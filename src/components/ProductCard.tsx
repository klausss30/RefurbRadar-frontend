import type { Product } from '../types/product';
import { formatPrice, formatRelativeTime } from '../utils/format';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
          {product.title}
        </h3>
        
        {/* Specs chips */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.chip && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
              {product.chip}
            </span>
          )}
          {product.ramGB && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {product.ramGB}GB RAM
            </span>
          )}
          {product.storageGB && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {product.storageGB >= 1024 
                ? `${(product.storageGB / 1024).toFixed(0)}TB` 
                : `${product.storageGB}GB`}
            </span>
          )}
          {product.network && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              {product.network}
            </span>
          )}
        </div>
        
        {/* Price */}
        <div className="text-2xl font-bold text-gray-900 mb-2">
          {formatPrice(product.price, product.currency)}
        </div>
        
        {/* Published date */}
        <div className="text-xs text-gray-500 mb-4">
          {formatRelativeTime(product.publishedAt)}
        </div>
        
        {/* Link button */}
        <a
          href={product.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          View on Apple Store
        </a>
      </div>
    </div>
  );
}

