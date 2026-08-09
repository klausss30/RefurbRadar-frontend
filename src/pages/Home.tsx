import { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '../types/product';
import type { Country } from '../config/countries';
import { useCountry } from '../hooks/useCountry';
import { useFeaturedFeed, useGroupFeed } from '../hooks/useFeed';
import type { FeaturedListingGroup } from '../api/backend';
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
  featuredGroups: FeaturedListingGroup[];
  totalProducts: number;
  country: Country;
  lastReplenishedAt: Date | null;
  onViewAll: (slug: string) => void;
}

function LandingPage({ featuredGroups, totalProducts, country, lastReplenishedAt, onViewAll }: LandingPageProps) {
  const sections = useMemo(() => PRODUCT_GROUPS
    .map((group) => {
      const featured = featuredGroups.find((item) => item.group === group.slug);
      return {
        group,
        products: featured?.items ?? [],
        total: featured?.total ?? 0,
      };
    })
    .filter((section) => section.total > 0), [featuredGroups]);
  const featuredProducts = useMemo(
    () => featuredGroups.flatMap((group) => group.items),
    [featuredGroups],
  );

  return (
    <>
      <SEO
        title={`Apple Refurbished Products in ${country.label} | RefurbRadar`}
        description={`Browse the latest refurbished Apple products available in ${country.label}.`}
        canonicalPath={`/?country=${country.code}`}
        products={featuredProducts}
      />

      <section className="punk-hero border-b px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="relative z-10 mx-auto max-w-7xl">
          <p className="punk-kicker">Independent Apple Refurbished Inventory Tracker</p>
          <h1 className="punk-display mt-5 text-5xl sm:text-7xl lg:text-[6.4rem]">
            Explore refurbished Apple<br /><span>products in {country.label}.</span>
          </h1>
          <div className="punk-meta mt-8 flex flex-wrap gap-x-6 gap-y-2 px-4 py-3 text-[11px] font-bold">
            <span>{totalProducts} products available</span>
            {lastReplenishedAt && <span>Latest listing: {formatDate(lastReplenishedAt.toISOString())}</span>}
          </div>
          <p className="mt-5 max-w-2xl text-xs leading-5 text-neutral-600">
            RefurbRadar does not sell these products. Availability and pricing are sourced from the Apple Refurbished Store; browse what is available here, then continue to Apple Store to purchase.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl divide-y divide-black/30 px-4 pb-16 sm:px-6 lg:px-8">
        {sections.map(({ group, products: groupProducts, total }) => (
          <ProductSection
            key={group.slug}
            group={group}
            products={groupProducts}
            total={total}
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
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-neutral-600 transition hover:text-[#ff3028]"
        >
          <span aria-hidden="true">←</span> Back to home
        </button>

        <div className="mt-8 border-b border-black pb-9">
          <p className="punk-kicker">{country.label}</p>
          <h1 className="punk-display mt-4 text-5xl sm:text-7xl">
            Refurbished {group.label}
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{groupProducts.length} products available</p>
          <p className="mt-4 max-w-2xl text-xs leading-5 text-neutral-600">
            Availability and pricing are sourced from the Apple Refurbished Store. RefurbRadar does not sell these products; product links open the Apple Store.
          </p>
        </div>

        <div className="glass-panel my-8 border border-black p-5">
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
  const {
    groups: featuredGroups,
    total: totalProducts,
    loading,
    error,
    lastReplenishedAt,
    loadedCountryCode,
    retry: retryFeatured,
  } = useFeaturedFeed(countryCode, country);
  const inventoryMatchesMarket = loadedCountryCode === countryCode;
  const currentFeaturedGroups = useMemo(
    () => inventoryMatchesMarket ? featuredGroups : [],
    [featuredGroups, inventoryMatchesMarket],
  );
  const inventoryLoading = loading || (!error && !inventoryMatchesMarket);
  const availableGroups = useMemo(
    () => PRODUCT_GROUPS.filter((group) =>
      currentFeaturedGroups.some((featured) => featured.group === group.slug && featured.total > 0)),
    [currentFeaturedGroups],
  );
  const activeGroup = availableGroups.find((group) => group.slug === activeGroupSlug) || null;
  const effectiveGroupSlug = inventoryLoading ? activeGroupSlug : activeGroup?.slug || null;
  const {
    products: groupProducts,
    loading: groupLoading,
    error: groupError,
    loadedRequest,
    retry: retryGroup,
  } = useGroupFeed(countryCode, activeGroup?.slug ?? null, country);
  const expectedGroupRequest = activeGroup ? `${countryCode}:${activeGroup.slug}` : null;
  const groupInventoryLoading = Boolean(activeGroup) && (
    groupLoading || (!groupError && loadedRequest !== expectedGroupRequest)
  );

  useEffect(() => {
    if (!isDetecting && !inventoryLoading) updateUrl(countryCode, effectiveGroupSlug);
  }, [countryCode, effectiveGroupSlug, inventoryLoading, isDetecting]);

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

  const handleCountryChange = (code: string) => {
    if (code === countryCode) {
      retryFeatured();
      if (activeGroup) retryGroup();
      return;
    }

    setActiveGroupSlug(null);
    updateCountry(code);
  };

  return (
    <div className="nothing-theme min-h-screen">
      <Header
        countries={countries}
        productGroups={inventoryLoading ? [] : availableGroups}
        selectedCountry={country}
        onCountryChange={handleCountryChange}
        activeGroup={activeGroup?.slug}
        onNavigateHome={navigateHome}
        onNavigateGroup={navigateGroup}
        isDetecting={isDetecting}
      />

      {inventoryLoading || isDetecting ? (
        <div className="px-4 py-24"><LoadingState message={`Loading ${country.label} inventory…`} /></div>
      ) : error ? (
        <div className="px-4 py-24"><ErrorState message={error} onRetry={retryFeatured} /></div>
      ) : activeGroup ? (
        groupInventoryLoading ? (
          <div className="px-4 py-24"><LoadingState message={`Loading all ${activeGroup.label} products in ${country.label}…`} /></div>
        ) : groupError ? (
          <div className="px-4 py-24"><ErrorState message={groupError} onRetry={retryGroup} /></div>
        ) : (
          <CatalogPage key={activeGroup.slug} group={activeGroup} products={groupProducts} country={country} onBack={navigateHome} />
        )
      ) : (
        <LandingPage
          featuredGroups={currentFeaturedGroups}
          totalProducts={totalProducts}
          country={country}
          lastReplenishedAt={lastReplenishedAt}
          onViewAll={navigateGroup}
        />
      )}
    </div>
  );
}
