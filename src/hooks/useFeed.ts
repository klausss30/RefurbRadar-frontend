import { useCallback, useEffect, useState } from 'react';
import { fetchListings } from '../api/backend';
import type { Product } from '../types/product';
import type { Country } from '../config/countries';

export function useFeed(countryCode: string, country: Country) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReplenishedAt, setLastReplenishedAt] = useState<Date | null>(null);
  const [loadedCountryCode, setLoadedCountryCode] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  const retry = useCallback(() => setRequestKey((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadListings() {
      setLoading(true);
      setError(null);
      setProducts([]);
      setLoadedCountryCode(null);

      try {
        const response = await fetchListings(countryCode, controller.signal);
        setProducts(response.items);
        setLoadedCountryCode(countryCode);
        setLastReplenishedAt(
          response.lastReplenishedAt ? new Date(response.lastReplenishedAt) : null,
        );
      } catch (caught) {
        if (controller.signal.aborted) return;
        const message = caught instanceof Error ? caught.message : 'Failed to load products.';
        setError(`Unable to load products for ${country.label}. ${message}`);
        setProducts([]);
        setLastReplenishedAt(null);
        setLoadedCountryCode(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadListings();
    return () => controller.abort();
  }, [countryCode, country.label, requestKey]);

  return { products, loading, error, lastReplenishedAt, loadedCountryCode, retry };
}
