import { useState, useEffect, useMemo } from 'react';
import type { Product, Category } from '../types/product';
import { fetchFeed } from '../api/fetchFeed';
import { parseFeed } from '../api/parseFeed';
import { normalizeProducts } from '../api/normalizeProduct';
import { getCacheAge, formatCacheAge, isCacheFresh } from '../utils/cache';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import SpecFilters from '../components/SpecFilters';
import ProductGrid from '../components/ProductGrid';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

type SortOption = 'newest' | 'price-low' | 'price-high';

const FEED_URL = 'https://refurb-tracker.com/feeds/nz_in_all.xml';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Load products function (reusable for initial load and refresh)
  const loadProducts = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const xmlString = await fetchFeed(FEED_URL, 5 * 60 * 1000, forceRefresh);
      const items = parseFeed(xmlString);
      const normalized = normalizeProducts(items, 'NZ');
      
      setProducts(normalized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Background refresh: check if cache is about to expire (within 1 minute)
  useEffect(() => {
    if (loading || refreshing) return;
    
    const checkCacheAndRefresh = () => {
      // Skip if already loading or refreshing
      if (loading || refreshing) return;
      
      const cacheAge = getCacheAge(FEED_URL);
      const maxAge = 5 * 60 * 1000; // 5 minutes
      
      // If cache doesn't exist or is expired, refresh in background
      if (cacheAge === null || !isCacheFresh(FEED_URL, maxAge)) {
        // Cache expired, refresh
        console.log('Cache expired, background refreshing feed data...');
        loadProducts(false).catch(console.error);
        return;
      }
      
      // If cache is about to expire (less than 1 minute remaining), refresh in background
      const remainingTime = maxAge - cacheAge;
      if (remainingTime < 60 * 1000 && remainingTime > 0) {
        console.log('Cache about to expire, background refreshing feed data...');
        loadProducts(false).catch(console.error);
      }
    };

    // Check every minute (60 seconds)
    const interval = setInterval(checkCacheAndRefresh, 60 * 1000);
    
    // Also check immediately
    checkCacheAndRefresh();
    
    return () => clearInterval(interval);
  }, [loading, refreshing]);

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category));
    return Array.from(cats).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(p => selectedCategories.has(p.category));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const specsMatch = p.specsText?.toLowerCase().includes(query);
        return titleMatch || specsMatch;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    products,
    selectedCategories,
    searchQuery,
    sortOption,
  ]);

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState message={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop only */}
          <aside className="hidden lg:block lg:w-64 lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <CategoryFilter
                categories={availableCategories}
                selectedCategories={selectedCategories}
                onToggle={handleCategoryToggle}
              />

              <div className="border-t border-gray-200 pt-6">
                <SpecFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </div>
          </aside>

          {/* Mobile Search - Show on mobile only */}
          <aside className="lg:hidden mb-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <SpecFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-sm text-gray-600">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                </div>
                
                {/* Cache status and refresh button */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {(() => {
                    const cacheAge = getCacheAge(FEED_URL);
                    const isFresh = isCacheFresh(FEED_URL, 5 * 60 * 1000);
                    
                    if (cacheAge !== null && isFresh) {
                      return (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Updated {formatCacheAge(cacheAge)}
                        </span>
                      );
                    }
                    return null;
                  })()}
                  
                  <button
                    onClick={() => loadProducts(true)}
                    disabled={refreshing}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    title="Refresh data from RSS feed"
                  >
                    <svg
                      className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    {refreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <EmptyState />
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

