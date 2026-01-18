import { getCachedFeed, setCachedFeed } from "../utils/cache";

/**
 * Attempts to fetch data from the server proxy
 */
async function fetchFromServer(
  proxyUrl: string,
  timeout: number = 30000
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(proxyUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RefurbRadar/1.0)",
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
    if (
      trimmed.toLowerCase().startsWith("<!doctype") ||
      trimmed.toLowerCase().startsWith("<html")
    ) {
      throw new Error("Received HTML error page instead of XML feed");
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetches RSS feed from the server proxy with caching
 * Uses localStorage to cache feed XML data for 5 minutes to reduce API calls
 * All requests (development and production) go through the server-side proxy
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

  // Get server proxy base URL from environment variable
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    const staleCache = getCachedFeed(url, Infinity);
    if (staleCache) {
      console.warn(
        "VITE_API_BASE_URL is not configured. Using stale cache data."
      );
      return staleCache;
    }
    throw new Error(
      "Server proxy is not configured. Please set VITE_API_BASE_URL environment variable in .env file."
    );
  }

  // Extract country code from URL: https://refurb-tracker.com/feeds/nz_in_all.xml -> nz
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split("/");
  const filename = pathParts[pathParts.length - 1]; // e.g., "nz_in_all.xml"
  const countryCode = filename.replace("_in_all.xml", ""); // e.g., "nz"

  // Remove trailing slash from base URL if present
  const baseUrl = apiBaseUrl.replace(/\/$/, "");
  const fetchUrl = `${baseUrl}/api/feeds/${countryCode}`;

  try {
    const data = await fetchFromServer(fetchUrl, 30000); // 30 second timeout
    setCachedFeed(url, data);
    return data;
  } catch (error) {
    // If fetch fails, try to use stale cache if available
    const staleCache = getCachedFeed(url, Infinity);
    if (staleCache) {
      console.warn(
        "Failed to fetch from server proxy, using stale cache data. Error:",
        error
      );
      return staleCache;
    }

    // All methods failed and no cache available
    const errorMessage =
      error instanceof Error ? error.message : String(error);

    throw new Error(
      `Unable to fetch feed data from server proxy. ` +
        `Please ensure your proxy server is running and accessible at ${baseUrl}. ` +
        `Error: ${errorMessage}`
    );
  }
}
