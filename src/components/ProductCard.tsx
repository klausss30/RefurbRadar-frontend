import { useState } from "react";
import type { Product } from "../types/product";
import { formatPrice, formatRelativeTime } from "../utils/format";
import { extractOverviewItems } from "../utils/html";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  const formatStorage = (storageGB?: number) => {
    if (!storageGB) return null;
    return storageGB >= 1024
      ? `${(storageGB / 1024).toFixed(0)}TB`
      : `${storageGB}GB`;
  };

  const overviewItems = product.specsText
    ? extractOverviewItems(product.specsText)
    : [];

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative group">
        {product.imageUrl && !imageError ? (
          <>
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                console.warn('Failed to load image:', product.imageUrl);
                console.warn('Image element:', e.currentTarget);
                setImageError(true);
              }}
              onLoad={() => {
                // Reset error state if image loads successfully after retry
                if (imageError) {
                  setImageError(false);
                }
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity pointer-events-none" />
          </>
        ) : (
          <div className="text-center p-4">
            {product.imageUrl && (
              <div className="text-xs text-gray-500 mb-2">
                URL: {product.imageUrl.substring(0, 50)}...
              </div>
            )}
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
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 leading-relaxed">
          {product.title}
        </h3>

        {/* Quick specs chips */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.chip && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
              {product.chip}
            </span>
          )}
          {product.ramGB && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {product.ramGB}GB RAM
            </span>
          )}
          {formatStorage(product.storageGB) && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
              {formatStorage(product.storageGB)}
            </span>
          )}
          {product.network && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
              {product.network}
            </span>
          )}
          {product.color && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
              {product.color}
            </span>
          )}
        </div>

        {/* Price */}
        <div className="text-2xl font-bold text-gray-900 mb-3">
          {formatPrice(product.price, product.currency)}
        </div>

        {/* Overview */}
        {overviewItems.length > 0 && (
          <div className="border-t border-gray-100 pt-3 mb-3">
            <button
              onClick={() => setShowOverview(!showOverview)}
              className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2"
            >
              <span className="font-medium">Overview</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showOverview ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showOverview && (
              <ul className="mt-2 space-y-1.5 text-xs text-gray-700">
                {overviewItems.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-2 mt-0.5">•</span>
                    <span className="flex-1 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

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
          查看 Apple Store
        </a>
      </div>
    </div>
  );
}

