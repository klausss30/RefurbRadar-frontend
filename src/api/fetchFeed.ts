import { getCachedFeed, setCachedFeed } from "../utils/cache";

/**
 * List of CORS proxy services to try (in order of preference)
 * These proxies may not be available in all regions (e.g., China)
 */
const CORS_PROXIES = [
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://cors-anywhere.herokuapp.com/${url}`, // Note: This may require request activation
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

/**
 * Attempts to fetch data using a proxy URL
 */
async function fetchWithProxy(
  proxyUrl: string,
  timeout: number = 20000
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RefurbRadar/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();

    if (!data || data.trim().length === 0) {
      throw new Error("Empty response");
    }

    // Check if response is HTML error page instead of XML
    const trimmed = data.trim();
    if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
      throw new Error("Received HTML error page instead of XML feed");
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetches RSS feed from the given URL with caching
 * Uses localStorage to cache feed XML data for 5 minutes to reduce API calls
 * 
 * Development: Uses Vite proxy to bypass CORS
 * Production: Tries multiple CORS proxies in sequence
 *
 * @param url The RSS feed URL (e.g., https://refurb-tracker.com/feeds/nz_in_all.xml)
 * @param maxCacheAge Maximum cache age in milliseconds (default: 5 minutes)
 * @param forceRefresh If true, bypass cache and fetch fresh data
 * @returns The feed XML string
 */
export async function fetchFeed(
  url: string,
  maxCacheAge: number = 5 * 60 * 1000, // 5 minutes default
  forceRefresh: boolean = false
): Promise<string> {
  // Check cache first (unless forcing refresh)
  if (!forceRefresh) {
    const cached = getCachedFeed(url, maxCacheAge);
    if (cached) {
      return cached;
    }
  }

  const isDevelopment = import.meta.env.DEV;
  const errors: Error[] = [];

  if (isDevelopment) {
    // In development, use Vite proxy to bypass CORS
    const urlObj = new URL(url);
    const fetchUrl = `/api${urlObj.pathname}`;
    
    try {
      const data = await fetchWithProxy(fetchUrl);
      setCachedFeed(url, data);
      return data;
    } catch (error) {
      errors.push(error instanceof Error ? error : new Error(String(error)));
    }
  } else {
    // In production, try multiple CORS proxies in sequence
    for (const proxyFn of CORS_PROXIES) {
      try {
        const proxyUrl = proxyFn(url);
        const data = await fetchWithProxy(proxyUrl, 20000); // 20 second timeout per proxy
        setCachedFeed(url, data);
        return data;
      } catch (error) {
        errors.push(error instanceof Error ? error : new Error(String(error)));
        // Continue to next proxy
      }
    }
  }

  // If all proxies fail, try to use stale cache if available
  const staleCache = getCachedFeed(url, Infinity);
  if (staleCache) {
    console.warn("All proxies failed, using stale cache data. Errors:", errors);
    return staleCache;
  }

  // All methods failed and no cache available
  const errorMessage = errors.length > 0 
    ? errors.map(e => e.message).join('; ')
    : 'Unknown error';
  
  throw new Error(
    `Unable to fetch feed data. All proxy services failed. ` +
    `This may be due to network restrictions in your region. ` +
    `If you are in China, you may need to use a VPN or configure a server-side proxy. ` +
    `Errors: ${errorMessage}`
  );
}
