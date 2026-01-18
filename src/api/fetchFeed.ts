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
    // Safari compatibility: Use 'cors' mode explicitly and don't set User-Agent header
    // (User-Agent is a forbidden header in browser fetch requests)
    // Also use 'no-cors' is not suitable here as we need to read the response
    const response = await fetch(proxyUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit', // Safari: don't send cookies
      headers: {
        'Accept': 'application/xml, text/xml, application/rss+xml, */*',
      },
      signal: controller.signal,
      // Safari: Ensure redirects are handled correctly
      redirect: 'follow',
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
    
    // Safari-specific error handling
    // Safari may throw different error messages than Chrome
    if (error instanceof TypeError) {
      // Network errors in Safari often show as TypeError
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Load failed')) {
        throw new Error('Failed to fetch: Network error. Please check your internet connection.');
      }
    }
    
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
    // Create user-friendly error message without exposing server URL
    let errorMessage = "Unable to fetch product data from server.";
    
    if (error instanceof Error) {
      // Map common errors to user-friendly messages
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = "Request timed out. Please check your internet connection and try again.";
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Load failed')) {
        errorMessage = "Unable to connect to server. Please check your internet connection and try again.";
      } else if (error.message.includes('HTTP 4')) {
        errorMessage = "The requested data could not be found. Please try again later.";
      } else if (error.message.includes('HTTP 5')) {
        errorMessage = "Server error occurred. Please try again later.";
      } else {
        // Use generic error without technical details
        errorMessage = "Unable to load products. Please try again later.";
      }
    }

    throw new Error(errorMessage);
  }
}
