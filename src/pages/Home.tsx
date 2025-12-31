import { useState, useMemo } from 'react';
import type { Category } from '../types/product';
import { useCountry } from '../hooks/useCountry';
import { useFeed } from '../hooks/useFeed';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import SpecFilters from '../components/SpecFilters';
import ProductGrid from '../components/ProductGrid';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

type SortOption = 'newest' | 'price-low' | 'price-high';

export default function Home() {
  // Country selection with IP geolocation
  const { countryCode, country, updateCountry, isDetecting, countries } = useCountry();

  // Load feed for selected country
  const { products, loading, error, lastUpdated, refresh } = useFeed(countryCode, country);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  // Handle country change
  const handleCountryChange = (newCode: string) => {
    updateCountry(newCode);
    // Reset filters when country changes
    setSelectedCategories(new Set());
    setSearchQuery('');
  };

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
    // Reload by triggering a country change to the same country
    updateCountry(countryCode);
  };

  // Show loading during initial country detection or feed loading
  if (loading || isDetecting) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          countries={countries}
          selectedCountry={country}
          onCountryChange={handleCountryChange}
          lastUpdated={null}
          isDetecting={isDetecting}
          onRefresh={refresh}
          isLoading={loading}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          countries={countries}
          selectedCountry={country}
          onCountryChange={handleCountryChange}
          lastUpdated={null}
          isDetecting={false}
          onRefresh={refresh}
          isLoading={loading}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ErrorState 
            message={error} 
            onRetry={handleRetry}
          />
          {error.includes('not found') && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Feed file missing:</strong> The feed for {country.label} hasn't been downloaded yet.
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                Please run <code className="bg-yellow-100 px-1 py-0.5 rounded">npm run fetch:feeds</code> to download the feed.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        countries={countries}
        selectedCountry={country}
        onCountryChange={handleCountryChange}
        lastUpdated={lastUpdated}
        isDetecting={false}
        onRefresh={refresh}
        isLoading={loading}
      />
      
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
              <div className="text-sm text-gray-600">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
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
