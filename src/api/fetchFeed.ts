import { getCachedFeed, setCachedFeed } from "../utils/cache";

/**
 * Fetches RSS feed from the given URL with caching
 * Uses localStorage to cache feed XML data for 5 minutes to reduce API calls
 * 
 * Development: Uses Vite proxy to bypass CORS
 * Production: Uses CORS proxy (api.allorigins.win) to fetch data
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
  let fetchUrl: string;

  if (isDevelopment) {
    // In development, use Vite proxy to bypass CORS
    // Extract path from URL: https://refurb-tracker.com/feeds/nz_in_all.xml -> /api/feeds/nz_in_all.xml
    const urlObj = new URL(url);
    fetchUrl = `/api${urlObj.pathname}`;
  } else {
    // In production, use CORS proxy directly (refurb-tracker.com doesn't allow CORS)
    // Try multiple CORS proxies for better compatibility (especially Safari)
    fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  }

  // Try to fetch with primary method
  try {
    // Create timeout abort controller for better error handling (Safari compatible)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RefurbRadar/1.0)',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch feed: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.text();

    // Validate that we got XML data
    if (!data || data.trim().length === 0) {
      throw new Error("Feed response is empty");
    }

    // Check if response is HTML error page instead of XML
    const trimmed = data.trim();
    if (trimmed.toLowerCase().startsWith('<!doctype') || trimmed.toLowerCase().startsWith('<html')) {
      throw new Error("Received HTML error page instead of XML feed");
    }

    // Cache the fetched data
    setCachedFeed(url, data);

    return data;
  } catch (error) {
    // In production, if primary CORS proxy fails, try backup proxy
    if (!isDevelopment && error instanceof Error) {
      const backupProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      
      try {
        const backupController = new AbortController();
        const backupTimeoutId = setTimeout(() => backupController.abort(), 30000);

        const backupResponse = await fetch(backupProxyUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RefurbRadar/1.0)',
          },
          signal: backupController.signal,
        });

        clearTimeout(backupTimeoutId);

        if (backupResponse.ok) {
          const data = await backupResponse.text();
          
          if (data && data.trim().length > 0) {
            const trimmed = data.trim();
            if (!trimmed.toLowerCase().startsWith('<!doctype') && !trimmed.toLowerCase().startsWith('<html')) {
              // Valid XML data from backup proxy
              setCachedFeed(url, data);
              return data;
            }
          }
        }
      } catch (backupError) {
        // Backup proxy also failed, continue to stale cache check
      }
    }

    // If all fetch methods fail, try to use stale cache if available
    const staleCache = getCachedFeed(url, Infinity);
    if (staleCache) {
      console.warn("Network error, using stale cache data:", error);
      return staleCache;
    }

    // Re-throw error if no cache available
    throw error;
  }
}
