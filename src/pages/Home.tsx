import { useState, useMemo } from 'react';
import type { Category } from '../types/product';
import { useCountry } from '../hooks/useCountry';
import { useFeed } from '../hooks/useFeed';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import SpecFilters from '../components/SpecFilters';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

type SortOption = 'newest' | 'price-low' | 'price-high';

const CATEGORY_ORDER: Category[] = [
  'MacBook Air',
  'MacBook Pro',
  'iMac',
  'Mac Mini',
  'Mac Studio',
  'Mac Pro',
  'iPad',
  'iPhone',
  'Apple Watch',
  'Apple TV',
  'HomePod',
  'Displays',
  'Accessories',
  'Other',
];

const SHELL_CLASS = 'relative min-h-screen pb-12 text-slate-900';

export default function Home() {
  const { countryCode, country, updateCountry, isDetecting, countries } = useCountry();
  const { products, loading, error, lastUpdated, refresh } = useFeed(countryCode, country);

  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 24;

  const handleCountryChange = (newCode: string) => {
    updateCountry(newCode);
    setSelectedCategories(new Set());
    setSearchQuery('');
    setCurrentPage(1);
  };

  const availableCategories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return Array.from(cats).sort((a, b) => {
      const indexA = CATEGORY_ORDER.indexOf(a);
      const indexB = CATEGORY_ORDER.indexOf(b);

      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategories.size > 0) {
      filtered = filtered.filter((p) => selectedCategories.has(p.category));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const specsMatch = p.specsText?.toLowerCase().includes(query);
        return titleMatch || specsMatch;
      });
    }

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
  }, [products, selectedCategories, searchQuery, sortOption]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  const activeFilterCount = selectedCategories.size + (searchQuery.trim() ? 1 : 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
    setCurrentPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
  };

  const handleRetry = () => {
    updateCountry(countryCode);
  };

  const clearFilters = () => {
    setSelectedCategories(new Set());
    setSearchQuery('');
    setSortOption('newest');
    setCurrentPage(1);
  };

  if (loading || isDetecting) {
    return (
      <div className={SHELL_CLASS}>
        <Header
          countries={countries}
          selectedCountry={country}
          onCountryChange={handleCountryChange}
          lastUpdated={null}
          isDetecting={isDetecting}
          onRefresh={refresh}
          isLoading={loading}
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <LoadingState />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={SHELL_CLASS}>
        <Header
          countries={countries}
          selectedCountry={country}
          onCountryChange={handleCountryChange}
          lastUpdated={null}
          isDetecting={false}
          onRefresh={refresh}
          isLoading={loading}
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState message={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className={SHELL_CLASS}>
      <Header
        countries={countries}
        selectedCountry={country}
        onCountryChange={handleCountryChange}
        lastUpdated={lastUpdated}
        isDetecting={false}
        onRefresh={refresh}
        isLoading={loading}
        activeFilterCount={activeFilterCount}
        searchQuery={searchQuery}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <main className="min-w-0">
          <div className="glass-panel mb-6 rounded-[30px] p-5 sm:p-6">
            <div className="flex flex-col gap-6">
              <div>
                <CategoryFilter
                  categories={availableCategories}
                  selectedCategories={selectedCategories}
                  onToggle={handleCategoryToggle}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_15rem_auto] xl:items-end">
                <div className="w-full xl:min-w-[22rem]">
                  <SpecFilters
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                  />
                </div>

                <div className="flex flex-wrap gap-3 xl:justify-start">
                  <div className="rounded-full border border-white/70 bg-white/85 p-1 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
                    <select
                      value={sortOption}
                      onChange={(e) => handleSortChange(e.target.value as SortOption)}
                      className="min-w-[14rem] rounded-full bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 xl:justify-end">
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="rounded-full border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <ProductGrid products={paginatedProducts} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}
