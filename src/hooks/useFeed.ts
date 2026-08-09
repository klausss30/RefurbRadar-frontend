import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchListings } from '../api/backend';
import type { Product } from '../types/product';
import type { Country } from '../config/countries';

const PRODUCTS_CACHE_PREFIX = 'refurbradar_products_';
const PRODUCTS_CACHE_DURATION = 30 * 60 * 1000;

interface CachedProducts {
  products: Product[];
  countryCode: string;
  timestamp: number;
}

function getCachedProducts(countryCode: string): CachedProducts | null {
  try {
    const value = localStorage.getItem(PRODUCTS_CACHE_PREFIX + countryCode);
    if (!value) return null;

    const cached = JSON.parse(value) as CachedProducts;
    if (cached.countryCode !== countryCode || Date.now() - cached.timestamp > PRODUCTS_CACHE_DURATION) {
      localStorage.removeItem(PRODUCTS_CACHE_PREFIX + countryCode);
      return null;
    }

    return cached;
  } catch {
    return null;
  }
}

function setCachedProducts(countryCode: string, products: Product[], timestamp = Date.now()) {
  try {
    localStorage.setItem(PRODUCTS_CACHE_PREFIX + countryCode, JSON.stringify({
      products,
      countryCode,
      timestamp,
    } satisfies CachedProducts));
  } catch (error) {
    console.warn('Failed to cache products.', error);
  }
}

export function clearProductsCache(countryCode: string): void {
  localStorage.removeItem(PRODUCTS_CACHE_PREFIX + countryCode);
}

export function useFeed(countryCode: string, country: Country) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const forceRefreshCountry = useRef<string | null>(null);

  const refresh = useCallback(() => {
    clearProductsCache(countryCode);
    forceRefreshCountry.current = countryCode;
    setRefreshKey((value) => value + 1);
  }, [countryCode]);

  useEffect(() => {
    const controller = new AbortController();
    const bypassCache = forceRefreshCountry.current === countryCode;
    if (bypassCache) forceRefreshCountry.current = null;

    async function loadListings() {
      setLoading(true);
      setError(null);

      if (!bypassCache) {
        const cached = getCachedProducts(countryCode);
        if (cached?.products.length) {
          setProducts(cached.products);
          setLastUpdated(new Date(cached.timestamp));
          setLoading(false);
          return;
        }
      }

      try {
        const response = await fetchListings(countryCode, controller.signal);
        const timestamp = Date.now();
        setProducts(response.items);
        setLastUpdated(new Date(timestamp));
        setCachedProducts(countryCode, response.items, timestamp);
      } catch (caught) {
        if (controller.signal.aborted) return;
        const message = caught instanceof Error ? caught.message : 'Failed to load products.';
        setError(`Unable to load products for ${country.label}. ${message}`);
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadListings();
    return () => controller.abort();
  }, [countryCode, country.label, refreshKey]);

  return { products, loading, error, lastUpdated, refresh };
}
