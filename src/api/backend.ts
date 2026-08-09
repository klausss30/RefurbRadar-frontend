import type { Product } from '../types/product';
import type { Country } from '../config/countries';

interface MarketResponse {
  code: string;
  name: string;
  currencyCode: string;
  locale: string;
  timezone: string;
}

export interface ListingPageResponse {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  lastReplenishedAt: string | null;
}

export interface FeaturedListingGroup {
  group: string;
  total: number;
  items: Product[];
}

export interface FeaturedListingsResponse {
  groups: FeaturedListingGroup[];
  total: number;
  lastReplenishedAt: string | null;
}

function getApiBaseUrl(): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (import.meta.env.DEV && !apiBaseUrl) {
    return '';
  }
  if (!apiBaseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured.');
  }

  return apiBaseUrl.replace(/\/$/, '');
}

async function fetchJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'omit',
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`API request failed with HTTP ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

export async function fetchMarkets(signal?: AbortSignal): Promise<Country[]> {
  const markets = await fetchJson<MarketResponse[]>('/api/markets', signal);
  return markets.map((market) => ({
    code: market.code,
    label: market.name,
    currency: market.currencyCode,
    locale: market.locale,
    timezone: market.timezone,
  }));
}

export async function fetchFeaturedListings(
  marketCode: string,
  signal?: AbortSignal,
): Promise<FeaturedListingsResponse> {
  const params = new URLSearchParams({
    market: marketCode,
    limit: '4',
  });

  return fetchJson<FeaturedListingsResponse>(`/api/listings/featured?${params}`, signal);
}

export async function fetchGroupListings(
  marketCode: string,
  groupSlug: string,
  signal?: AbortSignal,
): Promise<ListingPageResponse> {
  const params = new URLSearchParams({
    market: marketCode,
    group: groupSlug,
    page: '1',
    pageSize: '1000',
  });

  return fetchJson<ListingPageResponse>(`/api/listings?${params}`, signal);
}

export async function detectMarket(signal?: AbortSignal): Promise<string | null> {
  const data = await fetchJson<{
    countryCode?: string;
    country_code?: string;
    isoCode?: string;
    country?: string;
  }>('/api/ip/country', signal);

  return data.countryCode || data.country_code || data.isoCode || data.country || null;
}
