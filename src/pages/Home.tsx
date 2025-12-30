import { useState, useEffect, useMemo } from 'react';
import type { Product, Category } from '../types/product';
import { fetchFeed } from '../api/fetchFeed';
import { parseFeed } from '../api/parseFeed';
import { normalizeProducts } from '../api/normalizeProduct';
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
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [selectedRAM, setSelectedRAM] = useState<number | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<number | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<'Wi-Fi' | 'Cellular' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Load products on mount
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError(null);
        
        const xmlString = await fetchFeed(FEED_URL);
        const items = parseFeed(xmlString);
        const normalized = normalizeProducts(items, 'NZ');
        
        setProducts(normalized);
        
        // Initialize price range
        const prices = normalized.map(p => p.price).filter(p => p > 0);
        if (prices.length > 0) {
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          setPriceRange([min, max]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

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

    // Price range filter
    filtered = filtered.filter(p => {
      if (priceRange[0] > 0 && p.price < priceRange[0]) return false;
      if (priceRange[1] > 0 && p.price > priceRange[1]) return false;
      return true;
    });

    // Chip filter
    if (selectedChip) {
      filtered = filtered.filter(p => p.chip === selectedChip);
    }

    // RAM filter
    if (selectedRAM) {
      filtered = filtered.filter(p => p.ramGB === selectedRAM);
    }

    // Storage filter
    if (selectedStorage) {
      filtered = filtered.filter(p => p.storageGB === selectedStorage);
    }

    // Network filter
    if (selectedNetwork) {
      filtered = filtered.filter(p => p.network === selectedNetwork);
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
    priceRange,
    selectedChip,
    selectedRAM,
    selectedStorage,
    selectedNetwork,
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
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 lg:sticky lg:top-24 lg:h-fit ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div className="flex items-center justify-between lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <CategoryFilter
                categories={availableCategories}
                selectedCategories={selectedCategories}
                onToggle={handleCategoryToggle}
              />

              <div className="border-t border-gray-200 pt-6">
                <SpecFilters
                  products={products}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  selectedChip={selectedChip}
                  onChipChange={setSelectedChip}
                  selectedRAM={selectedRAM}
                  onRAMChange={setSelectedRAM}
                  selectedStorage={selectedStorage}
                  onStorageChange={setSelectedStorage}
                  selectedNetwork={selectedNetwork}
                  onNetworkChange={setSelectedNetwork}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Filters
                </button>
                <div className="text-sm text-gray-600">
                  {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
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

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
}

