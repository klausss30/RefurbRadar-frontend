import { getCachedFeed, setCachedFeed } from "../utils/cache";

/**
 * Fetches RSS feed from the given URL with caching
 * Uses localStorage to cache feed data for 5 minutes to reduce API calls
 * Uses Vite proxy in development, falls back to CORS proxy in production if needed
 *
 * @param url The RSS feed URL
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
      console.log("Using cached feed data");
      return cached;
    }
  }

  // In development, use Vite proxy to bypass CORS
  // In production, try direct fetch first, then fallback to CORS proxy
  const isDevelopment = import.meta.env.DEV;

  let fetchUrl = url;

  if (isDevelopment) {
    // Use Vite proxy (configured in vite.config.ts)
    fetchUrl = "/api/feed";
  }

  try {
    console.log("Fetching fresh feed data...");
    const response = await fetch(fetchUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch feed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.text();

    // Cache the fetched data
    setCachedFeed(url, data);

    return data;
  } catch (error) {
    // If direct fetch fails in production (CORS issue), try CORS proxy
    if (
      !isDevelopment &&
      error instanceof TypeError &&
      error.message.includes("fetch")
    ) {
      console.warn("Direct fetch failed, trying CORS proxy...");

      // Use a public CORS proxy as fallback
      // Note: This is a temporary solution. For production, consider setting up your own proxy.
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(
        url
      )}`;
      const proxyResponse = await fetch(corsProxyUrl);

      if (!proxyResponse.ok) {
        // If fetch fails, try to use stale cache if available
        const staleCache = getCachedFeed(url, Infinity);
        if (staleCache) {
          console.warn("Network error, using stale cache data");
          return staleCache;
        }
        throw new Error(
          `Failed to fetch feed via proxy: ${proxyResponse.status} ${proxyResponse.statusText}`
        );
      }

      const data = await proxyResponse.text();

      // Cache the fetched data
      setCachedFeed(url, data);

      return data;
    }

    // If fetch fails, try to use stale cache if available
    const staleCache = getCachedFeed(url, Infinity);
    if (staleCache) {
      console.warn("Network error, using stale cache data");
      return staleCache;
    }

    throw error;
  }
}
