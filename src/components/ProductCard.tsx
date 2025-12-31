import type { Product } from "../types/product";
import { formatPrice, formatRelativeTime } from "../utils/format";
import { extractOverviewItems } from "../utils/html";
import { useImageCache } from "../hooks/useImageCache";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  // Use image cache hook to handle loading state
  const imageStatus = useImageCache(product.imageUrl);

  const overviewItems = product.specsText
    ? extractOverviewItems(product.specsText)
    : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col h-full">
      {/* Image - Smaller on mobile */}
      <div className="h-40 sm:h-48 md:h-56 lg:aspect-square lg:h-auto bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative group">
        {product.imageUrl && imageStatus === 'loaded' ? (
          <>
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
              // No need for loading="lazy" as we're already handling preloading
              // The image is already cached and loaded
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity pointer-events-none" />
          </>
        ) : product.imageUrl && imageStatus === 'loading' ? (
          // Show loading placeholder while image is being preloaded
          <div className="text-center p-4 w-full h-full flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
              <svg
                className="w-12 h-12 mx-auto text-gray-300 mb-2"
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
              <div className="text-gray-400 text-xs">Loading...</div>
            </div>
          </div>
        ) : (
          // Error or no image
          <div className="text-center p-4">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-2"
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
            <div className="text-gray-400 text-xs">
              {product.imageUrl ? 'Image failed to load' : 'No image available'}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-900 text-sm mb-3 leading-relaxed">
          {product.title}
        </h3>

        {/* Price */}
        <div className="text-2xl font-bold text-gray-900 mb-3">
          {formatPrice(product.price, product.currency)}
        </div>

        {/* Overview - Flexible content area */}
        {overviewItems.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mb-3 flex-1">
            <ul className="space-y-1.5 text-xs text-gray-700">
              {overviewItems.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-gray-400 mr-2 mt-0.5">•</span>
                  <span className="flex-1 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Fixed bottom section */}
        <div className="mt-auto">
          {/* Published date */}
          <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
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
    </div>
  );
}

