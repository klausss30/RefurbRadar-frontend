import { useCallback, useEffect, useState } from 'react';
import { fetchFeaturedListings, fetchGroupListings } from '../api/backend';
import type { FeaturedArrivalGroup, FeaturedListingGroup } from '../api/backend';
import type { Product } from '../types/product';
import type { Country } from '../config/countries';

export function useFeaturedFeed(countryCode: string, country: Country) {
  const [groups, setGroups] = useState<FeaturedListingGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReplenishedAt, setLastReplenishedAt] = useState<Date | null>(null);
  const [todayArrivals, setTodayArrivals] = useState<FeaturedArrivalGroup[]>([]);
  const [loadedCountryCode, setLoadedCountryCode] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  const retry = useCallback(() => setRequestKey((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadListings() {
      setLoading(true);
      setError(null);
      setGroups([]);
      setTotal(0);
      setTodayArrivals([]);
      setLoadedCountryCode(null);

      try {
        const response = await fetchFeaturedListings(countryCode, controller.signal);
        setGroups(response.groups);
        setTotal(response.total);
        setLoadedCountryCode(countryCode);
        setLastReplenishedAt(
          response.lastReplenishedAt ? new Date(response.lastReplenishedAt) : null,
        );
        setTodayArrivals(response.todayArrivals ?? []);
      } catch (caught) {
        if (controller.signal.aborted) return;
        const message = caught instanceof Error ? caught.message : 'Failed to load products.';
        setError(`Unable to load products for ${country.label}. ${message}`);
        setGroups([]);
        setTotal(0);
        setLastReplenishedAt(null);
        setTodayArrivals([]);
        setLoadedCountryCode(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadListings();
    return () => controller.abort();
  }, [countryCode, country.label, requestKey]);

  return { groups, total, loading, error, lastReplenishedAt, todayArrivals, loadedCountryCode, retry };
}

export function useGroupFeed(
  countryCode: string,
  groupSlug: string | null,
  country: Country,
) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedRequest, setLoadedRequest] = useState<string | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  const retry = useCallback(() => setRequestKey((value) => value + 1), []);

  useEffect(() => {
    if (!groupSlug) {
      setProducts([]);
      setLoading(false);
      setError(null);
      setLoadedRequest(null);
      return;
    }

    const controller = new AbortController();
    const requestId = `${countryCode}:${groupSlug}`;

    async function loadGroupListings() {
      setLoading(true);
      setError(null);
      setProducts([]);
      setLoadedRequest(null);

      try {
        const response = await fetchGroupListings(countryCode, groupSlug!, controller.signal);
        setProducts(response.items);
        setLoadedRequest(requestId);
      } catch (caught) {
        if (controller.signal.aborted) return;
        const message = caught instanceof Error ? caught.message : 'Failed to load products.';
        setError(`Unable to load ${groupSlug} products for ${country.label}. ${message}`);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadGroupListings();
    return () => controller.abort();
  }, [countryCode, country.label, groupSlug, requestKey]);

  return { products, loading, error, loadedRequest, retry };
}
