import { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '../types/product';
import type { Country } from '../config/countries';
import { useCountry } from '../hooks/useCountry';
import { useFeed } from '../hooks/useFeed';
import { useProductFilters } from '../hooks/useProductFilters';
import type { SortOption } from '../hooks/useProductFilters';
import { getProductGroup, PRODUCT_GROUPS, type ProductGroup } from '../config/productGroups';
import { formatDate } from '../utils/format';
import SEO from '../components/SEO';
import Header from '../components/Header';
import ProductSection from '../components/ProductSection';
import CategoryFilter from '../components/CategoryFilter';
import SpecFilters from '../components/SpecFilters';
import ProductGrid from '../components/ProductGrid';
import Pagination from '../components/Pagination';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

const ITEMS_PER_PAGE = 24;

function getGroupFromUrl(): string | null {
  const slug = new URLSearchParams(window.location.search).get('group');
  return getProductGroup(slug) ? slug : null;
}

function updateUrl(countryCode: string, groupSlug: string | null, push = false) {
  const params = new URLSearchParams();
  params.set('country', countryCode);
  if (groupSlug) params.set('group', groupSlug);
  const url = `/?${params.toString()}`;
  window.history[push ? 'pushState' : 'replaceState'](null, '', url);
}

interface LandingPageProps {
  products: Product[];
  country: Country;
  lastReplenishedAt: Date | null;
  onViewAll: (slug: string) => void;
}

function LandingPage({ products, country, lastReplenishedAt, onViewAll }: LandingPageProps) {
  const sections = useMemo(() => PRODUCT_GROUPS
    .map((group) => ({
      group,
      products: products
        .filter((product) => group.categories.includes(product.category))
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    }))
    .filter((section) => section.products.length > 0), [products]);

  return (
    <>
      <SEO
        title={`Apple Refurbished Products in ${country.label} | RefurbRadar`}
        description={`Browse the latest refurbished Apple products available in ${country.label}.`}
        canonicalPath={`/?country=${country.code}`}
        products={products}
      />

      <section className="border-b border-slate-200/70 bg-white/55 px-4 py-14 dark:border-white/10 dark:bg-slate-950/35 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold text-blue-600 dark:text-sky-300">Apple Refurbished Store</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.045em] text-slate-950 dark:text-white sm:text-6xl">
            The latest refurbished products in {country.label}.
          </h1>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{products.length} products available</span>
            {lastReplenishedAt && <span>Latest listing {formatDate(lastReplenishedAt.toISOString())}</span>}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl divide-y divide-slate-200/70 px-4 pb-16 sm:px-6 lg:px-8 dark:divide-white/10">
        {sections.map(({ group, products: groupProducts }) => (
          <ProductSection
            key={group.slug}
            group={group}
            products={groupProducts}
            onViewAll={onViewAll}
          />
        ))}
      </main>
    </>
  );
}

interface CatalogPageProps {
  group: ProductGroup;
  products: Product[];
  country: Country;
  onBack: () => void;
}

function CatalogPage({ group, products, country, onBack }: CatalogPageProps) {
  const groupProducts = useMemo(
    () => products.filter((product) => group.categories.includes(product.category)),
    [group, products],
  );
  const availableCategories = useMemo(
    () => group.categories.filter((category) => groupProducts.some((product) => product.category === category)),
    [group, groupProducts],
  );

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
  } = useProductFilters(groupProducts, { itemsPerPage: ITEMS_PER_PAGE });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <>
      <SEO
        title={`Refurbished ${group.label} in ${country.label} | RefurbRadar`}
        description={`${group.description} Browse current refurbished inventory in ${country.label}.`}
        canonicalPath={`/?country=${country.code}&group=${group.slug}`}
        products={filteredProducts}
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-sky-300"
        >
          <span aria-hidden="true">←</span> Back to home
        </button>

        <div className="mt-8 border-b border-slate-200 pb-9 dark:border-white/10">
          <p className="text-sm font-semibold text-blue-600 dark:text-sky-300">{country.label}</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-white sm:text-6xl">
            Refurbished {group.label}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">{group.description}</p>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{groupProducts.length} products available</p>
        </div>

        <div className="my-8 rounded-[24px] border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem_auto] lg:items-end">
            <SpecFilters searchQuery={searchQuery} onSearchChange={handleSearchChange} />
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Sort</label>
              <select
                value={sortOption}
                onChange={(event) => handleSortChange(event.target.value as SortOption)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-400 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="newest">Newest first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button type="button" onClick={clearFilters} className="rounded-full px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:text-sky-300 dark:hover:bg-sky-400/10">
                Clear filters
              </button>
            )}
          </div>

          {availableCategories.length > 1 && (
            <div className="mt-5 border-t border-slate-200 pt-5 dark:border-white/10">
              <CategoryFilter
                categories={availableCategories as Category[]}
                selectedCategories={selectedCategories}
                onToggle={handleCategoryToggle}
              />
            </div>
          )}
        </div>

        {filteredProducts.length === 0
          ? <EmptyState />
          : (
            <>
              <ProductGrid products={paginatedProducts} />
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            </>
          )}
      </main>
    </>
  );
}

export default function Home() {
  const [activeGroupSlug, setActiveGroupSlug] = useState<string | null>(getGroupFromUrl);
  const { countryCode, country, updateCountry, isDetecting, countries } = useCountry();
  const { products, loading, error, lastReplenishedAt, retry } = useFeed(countryCode, country);
  const activeGroup = getProductGroup(activeGroupSlug) || null;

  useEffect(() => {
    if (!isDetecting) updateUrl(countryCode, activeGroupSlug);
  }, [activeGroupSlug, countryCode, isDetecting]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const nextGroup = params.get('group');
      const nextCountry = params.get('country');
      setActiveGroupSlug(getProductGroup(nextGroup) ? nextGroup : null);
      if (nextCountry) updateCountry(nextCountry);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [updateCountry]);

  const navigateHome = () => {
    setActiveGroupSlug(null);
    updateUrl(countryCode, null, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateGroup = (slug: string) => {
    setActiveGroupSlug(slug);
    updateUrl(countryCode, slug, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <Header
        countries={countries}
        selectedCountry={country}
        onCountryChange={updateCountry}
        activeGroup={activeGroup?.slug}
        onNavigateHome={navigateHome}
        onNavigateGroup={navigateGroup}
        isDetecting={isDetecting}
      />

      {loading || isDetecting ? (
        <div className="px-4 py-24"><LoadingState message={`Loading ${country.label} inventory…`} /></div>
      ) : error ? (
        <div className="px-4 py-24"><ErrorState message={error} onRetry={retry} /></div>
      ) : activeGroup ? (
        <CatalogPage key={activeGroup.slug} group={activeGroup} products={products} country={country} onBack={navigateHome} />
      ) : (
        <LandingPage products={products} country={country} lastReplenishedAt={lastReplenishedAt} onViewAll={navigateGroup} />
      )}
    </div>
  );
}
