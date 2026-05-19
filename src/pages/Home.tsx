import { useEffect, useMemo } from 'react';
import type { Category } from '../types/product';
import { useCountry } from '../hooks/useCountry';
import { useFeed } from '../hooks/useFeed';
import { useProductFilters } from '../hooks/useProductFilters';
import { DEFAULT_COUNTRY } from '../config/countries';
import SEO from '../components/SEO';
import Header from '../components/Header';
import CategoryFilter from '../components/CategoryFilter';
import SpecFilters from '../components/SpecFilters';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

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

const SHELL_CLASS = 'relative min-h-screen pb-12 text-slate-900 dark:text-slate-100';
const ITEMS_PER_PAGE = 24;

function getInitialCategories(): Set<Category> {
  const params = new URLSearchParams(window.location.search);
  const categories = params
    .getAll('category')
    .flatMap((value) => value.split(','))
    .filter((value): value is Category => CATEGORY_ORDER.includes(value as Category));

  return new Set(categories);
}

function getInitialSearchQuery(): string {
  return new URLSearchParams(window.location.search).get('q') || '';
}

export default function Home() {
  const { countryCode, country, updateCountry, isDetecting, countries } = useCountry();
  const { products, loading, error, lastUpdated, refresh } = useFeed(countryCode, country);

  const {
    selectedCategories,
    searchQuery,
    sortOption,
    currentPage,
    filteredProducts,
    paginatedProducts,
    totalPages,
    activeFilterCount,
    handleCategoryToggle,
    handleSearchChange,
    handleSortChange,
    handlePageChange,
    clearFilters,
  } = useProductFilters(products, {
    initialCategories: getInitialCategories(),
    initialSearchQuery: getInitialSearchQuery(),
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const handleCountryChange = (newCode: string) => {
    updateCountry(newCode);
    clearFilters();
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

  const selectedCategoryList = useMemo(() => Array.from(selectedCategories), [selectedCategories]);
  const primaryCategory = selectedCategoryList[0];
  const pageTitle = primaryCategory
    ? `Refurbished ${primaryCategory} Deals in ${country.label} | RefurbRadar`
    : `Apple Refurbished Deals in ${country.label} | RefurbRadar`;
  const pageDescription = primaryCategory
    ? `Track refurbished ${primaryCategory} inventory, prices, and availability from the Apple Store in ${country.label}.`
    : `Browse Apple refurbished Mac, iPad, iPhone, Apple Watch, and accessory deals from the Apple Store in ${country.label}.`;
  const canonicalPath = useMemo(() => {
    const params = new URLSearchParams();

    if (countryCode !== DEFAULT_COUNTRY || selectedCategoryList.length > 0 || searchQuery.trim()) {
      params.set('country', countryCode);
    }

    selectedCategoryList.forEach((category) => params.append('category', category));

    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }

    const query = params.toString();
    return query ? `/?${query}` : '/';
  }, [countryCode, searchQuery, selectedCategoryList]);

  useEffect(() => {
    if (isDetecting) return;

    window.history.replaceState(null, '', canonicalPath);
  }, [canonicalPath, isDetecting]);

  // Scroll to top when pagination changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleRetry = () => {
    updateCountry(countryCode);
  };

  if (loading || isDetecting) {
    return (
      <div className={SHELL_CLASS}>
        <SEO
          title={pageTitle}
          description={pageDescription}
          canonicalPath={canonicalPath}
        />
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
        <SEO
          title={pageTitle}
          description={pageDescription}
          canonicalPath={canonicalPath}
        />
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
      <SEO
        title={pageTitle}
        description={pageDescription}
        canonicalPath={canonicalPath}
        products={filteredProducts}
      />
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
          <div className="glass-panel mb-6 rounded-[30px] p-5 sm:p-6 dark:bg-opacity-50">
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
                  <div className="rounded-full border border-white/70 bg-white/85 p-1 shadow-[0_12px_24px_rgba(15,23,42,0.06)] dark:border-slate-600/70 dark:bg-slate-800/85">
                    <select
                      value={sortOption}
                      onChange={(e) => handleSortChange(e.target.value as any)}
                      className="min-w-[14rem] rounded-full bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none dark:text-slate-200"
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
                      className="rounded-full border border-slate-200 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:border-rose-800 dark:hover:bg-slate-800 dark:hover:text-rose-400"
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
