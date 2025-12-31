/**
 * Cache utility for RSS feed data
 * Uses localStorage to cache feed data with expiration
 */

const CACHE_PREFIX = 'refurbradar_feed_';
const CACHE_TIMESTAMP_PREFIX = 'refurbradar_feed_timestamp_';
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Generates a cache key for a given URL
 */
function getCacheKey(url: string): string {
  return CACHE_PREFIX + btoa(url).replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Generates a timestamp key for a given URL
 */
function getTimestampKey(url: string): string {
  return CACHE_TIMESTAMP_PREFIX + btoa(url).replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Gets cached feed data if it exists and hasn't expired
 * @param url The feed URL
 * @param maxAge Maximum age in milliseconds (default: 5 minutes)
 * @returns Cached data or null if cache miss or expired
 */
export function getCachedFeed(url: string, maxAge: number = DEFAULT_CACHE_DURATION): string | null {
  try {
    const cacheKey = getCacheKey(url);
    const timestampKey = getTimestampKey(url);
    
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTimestamp = localStorage.getItem(timestampKey);
    
    if (!cachedData || !cachedTimestamp) {
      return null;
    }
    
    const timestamp = parseInt(cachedTimestamp, 10);
    const age = Date.now() - timestamp;
    
    if (age > maxAge) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
      return null;
    }
    
    return cachedData;
  } catch (error) {
    // If localStorage is not available or quota exceeded, return null
    console.warn('Failed to read from cache:', error);
    return null;
  }
}

/**
 * Caches feed data with current timestamp
 * @param url The feed URL
 * @param data The feed data to cache
 */
export function setCachedFeed(url: string, data: string): void {
  try {
    const cacheKey = getCacheKey(url);
    const timestampKey = getTimestampKey(url);
    const timestamp = Date.now();
    
    localStorage.setItem(cacheKey, data);
    localStorage.setItem(timestampKey, timestamp.toString());
  } catch (error) {
    // If localStorage is not available or quota exceeded, silently fail
    console.warn('Failed to write to cache:', error);
    // Try to clear old cache entries if quota exceeded
    if (error instanceof DOMException && error.code === 22) {
      clearOldCacheEntries();
    }
  }
}

/**
 * Gets cache age in milliseconds
 * @param url The feed URL
 * @returns Age in milliseconds, or null if cache doesn't exist
 */
export function getCacheAge(url: string): number | null {
  try {
    const timestampKey = getTimestampKey(url);
    const cachedTimestamp = localStorage.getItem(timestampKey);
    
    if (!cachedTimestamp) {
      return null;
    }
    
    const timestamp = parseInt(cachedTimestamp, 10);
    return Date.now() - timestamp;
  } catch (error) {
    return null;
  }
}

/**
 * Checks if cache exists and is still fresh (not expired)
 * @param url The feed URL
 * @param maxAge Maximum age in milliseconds (default: 5 minutes)
 * @returns true if cache exists and is fresh, false otherwise
 */
export function isCacheFresh(url: string, maxAge: number = DEFAULT_CACHE_DURATION): boolean {
  const age = getCacheAge(url);
  if (age === null) {
    return false;
  }
  return age < maxAge;
}

/**
 * Clears cache for a specific URL
 * @param url The feed URL
 */
export function clearCache(url: string): void {
  try {
    const cacheKey = getCacheKey(url);
    const timestampKey = getTimestampKey(url);
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(timestampKey);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
}

/**
 * Clears all cache entries (useful for cleanup or quota management)
 */
export function clearAllCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX) || key.startsWith(CACHE_TIMESTAMP_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear all cache:', error);
  }
}

/**
 * Clears old cache entries to free up space
 * Only keeps entries newer than 1 hour
 */
function clearOldCacheEntries(): void {
  try {
    const keys = Object.keys(localStorage);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    keys.forEach(key => {
      if (key.startsWith(CACHE_TIMESTAMP_PREFIX)) {
        const timestamp = localStorage.getItem(key);
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp, 10);
          if (age > oneHourAgo) {
            // Remove old cache entry
            const cacheKey = key.replace(CACHE_TIMESTAMP_PREFIX, CACHE_PREFIX);
            localStorage.removeItem(key);
            localStorage.removeItem(cacheKey);
          }
        }
      }
    });
  } catch (error) {
    console.warn('Failed to clear old cache entries:', error);
  }
}

/**
 * Formats cache age for display
 * @param ageInMs Age in milliseconds
 * @returns Human-readable string like "2 minutes ago"
 */
export function formatCacheAge(ageInMs: number): string {
  const seconds = Math.floor(ageInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
  }
}

