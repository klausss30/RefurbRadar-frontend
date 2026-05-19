import { useMemo, useState, useCallback } from 'react';
import type { Product, Category } from '../types/product';

type SortOption = 'newest' | 'price-low' | 'price-high';

interface UseProductFiltersOptions {
  initialCategories?: Set<Category>;
  initialSearchQuery?: string;
  initialSortOption?: SortOption;
  itemsPerPage?: number;
}

export function useProductFilters(
  products: Product[],
  options: UseProductFiltersOptions = {}
) {
  const {
    initialCategories = new Set(),
    initialSearchQuery = '',
    initialSortOption = 'newest',
    itemsPerPage = 24,
  } = options;

  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(initialCategories);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortOption, setSortOption] = useState<SortOption>(initialSortOption);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoized filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategories.size > 0) {
      filtered = filtered.filter((p) => selectedCategories.has(p.category));
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(query);
        const specsMatch = p.specsText?.toLowerCase().includes(query);
        return titleMatch || specsMatch;
      });
    }

    // Apply sorting
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

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Count active filters
  const activeFilterCount = selectedCategories.size + (searchQuery.trim() ? 1 : 0);

  // Handler callbacks
  const handleCategoryToggle = useCallback((category: Category) => {
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
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((option: SortOption) => {
    setSortOption(option);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategories(new Set());
    setSearchQuery('');
    setSortOption('newest');
    setCurrentPage(1);
  }, []);

  return {
    // State
    selectedCategories,
    searchQuery,
    sortOption,
    currentPage,

    // Filtered data
    filteredProducts,
    paginatedProducts,
    totalPages,
    activeFilterCount,

    // Handlers
    handleCategoryToggle,
    handleSearchChange,
    handleSortChange,
    handlePageChange,
    clearFilters,
  };
}
