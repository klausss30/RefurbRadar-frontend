import { useState, useEffect } from 'react';
import { parseFeed } from '../api/parseFeed';
import { normalizeProducts } from '../api/normalizeProduct';
import type { Product } from '../types/product';
import type { Country as CountryCode } from '../types/product';
import type { Country as CountryConfig } from '../config/countries';
import { getLocalFeedPath } from '../config/countries';

const PRODUCTS_CACHE_PREFIX = 'refurbradar_products_';
const PRODUCTS_CACHE_TIMESTAMP_PREFIX = 'refurbradar_products_timestamp_';
const PRODUCTS_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface CachedProducts {
  products: Product[];
  countryCode: string;
  timestamp: number;
}

/**
 * Get cached products for a country
 * Returns products and the timestamp when cache was created
 */
function getCachedProducts(countryCode: string): { products: Product[]; timestamp: number } | null {
  try {
    const cacheKey = PRODUCTS_CACHE_PREFIX + countryCode;
    const timestampKey = PRODUCTS_CACHE_TIMESTAMP_PREFIX + countryCode;
    
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTimestamp = localStorage.getItem(timestampKey);
    
    if (!cachedData || !cachedTimestamp) {
      return null;
    }
    
    const timestamp = parseInt(cachedTimestamp, 10);
    const age = Date.now() - timestamp;
    
    if (age > PRODUCTS_CACHE_DURATION) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(timestampKey);
      return null;
    }
    
    const cached: CachedProducts = JSON.parse(cachedData);
    // Verify country code matches (in case user switched countries)
    if (cached.countryCode !== countryCode) {
      return null;
    }
    
    return { products: cached.products, timestamp };
  } catch (error) {
    console.warn('Failed to read cached products:', error);
    return null;
  }
}

/**
 * Cache products for a country
 */
function setCachedProducts(countryCode: string, products: Product[]): void {
  try {
    const cacheKey = PRODUCTS_CACHE_PREFIX + countryCode;
    const timestampKey = PRODUCTS_CACHE_TIMESTAMP_PREFIX + countryCode;
    const timestamp = Date.now();
    
    const cached: CachedProducts = {
      products,
      countryCode,
      timestamp,
    };
    
    localStorage.setItem(cacheKey, JSON.stringify(cached));
    localStorage.setItem(timestampKey, timestamp.toString());
  } catch (error) {
    console.warn('Failed to cache products:', error);
    // If quota exceeded, try to clear old cache entries
    if (error instanceof DOMException && error.code === 22) {
      clearOldProductsCache();
    }
  }
}

/**
 * Clear old products cache entries (older than 1 hour)
 */
function clearOldProductsCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const oneHourInMs = 60 * 60 * 1000;
    
    keys.forEach(key => {
      if (key.startsWith(PRODUCTS_CACHE_TIMESTAMP_PREFIX)) {
        const timestamp = localStorage.getItem(key);
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp, 10);
          if (age > oneHourInMs) {
            // Remove old cache entry (older than 1 hour)
            const countryCode = key.replace(PRODUCTS_CACHE_TIMESTAMP_PREFIX, '');
            const cacheKey = PRODUCTS_CACHE_PREFIX + countryCode;
            localStorage.removeItem(key);
            localStorage.removeItem(cacheKey);
          }
        }
      }
    });
  } catch (error) {
    console.warn('Failed to clear old products cache:', error);
  }
}

/**
 * Clear cache for a specific country
 */
export function clearProductsCache(countryCode: string): void {
  try {
    const cacheKey = PRODUCTS_CACHE_PREFIX + countryCode;
    const timestampKey = PRODUCTS_CACHE_TIMESTAMP_PREFIX + countryCode;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(timestampKey);
  } catch (error) {
    console.warn('Failed to clear products cache:', error);
  }
}

/**
 * Get cache info for a country
 */
export function getProductsCacheInfo(countryCode: string): { exists: boolean; age: number | null; size: number | null } {
  try {
    const cacheKey = PRODUCTS_CACHE_PREFIX + countryCode;
    const timestampKey = PRODUCTS_CACHE_TIMESTAMP_PREFIX + countryCode;
    
    const cachedData = localStorage.getItem(cacheKey);
    const cachedTimestamp = localStorage.getItem(timestampKey);
    
    if (!cachedData || !cachedTimestamp) {
      return { exists: false, age: null, size: null };
    }
    
    const timestamp = parseInt(cachedTimestamp, 10);
    const age = Date.now() - timestamp;
    const size = new Blob([cachedData]).size; // Size in bytes
    
    return { exists: true, age, size };
  } catch (error) {
    console.warn('Failed to get cache info:', error);
    return { exists: false, age: null, size: null };
  }
}

/**
 * Hook to load feed for a specific country
 * Fetches from same-origin /data/{code}_in_all.xml
 * Uses localStorage to cache parsed products for 30 minutes
 */
export function useFeed(countryCode: string, country: CountryConfig) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Expose refresh function
  const refresh = () => {
    clearProductsCache(countryCode);
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      try {
        setLoading(true);
        setError(null);

        // Check cache first (skip cache only if refreshKey > 0, meaning user explicitly requested refresh)
        // When refreshKey === 0 (initial load or page reload), always check cache first
        if (refreshKey === 0) {
          const cached = getCachedProducts(countryCode);
          if (cached && cached.products.length > 0) {
            console.log(`✅ Using cached products for ${countryCode} (${cached.products.length} products)`);
            if (!cancelled) {
              setProducts(cached.products);
              // Use the cache timestamp, not current time
              setLastUpdated(new Date(cached.timestamp));
              setLoading(false);
            }
            return; // Exit early, don't fetch from file
          } else {
            console.log(`ℹ️ No valid cache found for ${countryCode}, fetching from file...`);
          }
        } else {
          console.log(`🔄 Force refresh requested for ${countryCode}, bypassing cache...`);
        }

        // Fetch from same-origin local file
        const feedPath = getLocalFeedPath(countryCode);
        const response = await fetch(feedPath);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(
              `Feed file not found for ${country.label}. ` +
              `Please run "npm run fetch:feeds" to download the feed.`
            );
          }
          throw new Error(`Failed to load feed: ${response.status} ${response.statusText}`);
        }

        const xmlString = await response.text();

        if (!xmlString || xmlString.trim().length === 0) {
          throw new Error('Feed file is empty');
        }

        // Check content type if available
        const contentType = response.headers.get('content-type');
        if (contentType && !contentType.includes('xml') && !contentType.includes('rss') && !contentType.includes('atom')) {
          console.warn(`Unexpected content type: ${contentType}`);
        }

        try {
          // Parse and normalize
          const items = parseFeed(xmlString);
          const normalized = normalizeProducts(items, countryCode as CountryCode);
          
          if (normalized.length === 0) {
            throw new Error('Feed parsed successfully but contains no products');
          }
          
          if (!cancelled) {
            setProducts(normalized);
            setLastUpdated(new Date());
            // Cache the parsed products
            setCachedProducts(countryCode, normalized);
          }
        } catch (parseError) {
          // Provide more helpful error message
          const errorMsg = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
          
          // Check if file looks like it might be an error page
          if (xmlString.trim().toLowerCase().includes('<html') || 
              xmlString.trim().toLowerCase().includes('<!doctype')) {
            throw new Error(
              `Feed file appears to be an HTML error page, not XML. ` +
              `This might mean the feed file doesn't exist or wasn't downloaded correctly. ` +
              `Please run "npm run fetch:feeds" to download feeds. ` +
              `Original error: ${errorMsg}`
            );
          }
          
          throw new Error(
            `Failed to parse feed XML for ${country.label}. ` +
            `The file might be corrupted or in an unexpected format. ` +
            `Try running "npm run fetch:feeds" to re-download feeds. ` +
            `Error: ${errorMsg}`
          );
        }
      } catch (err) {
        if (!cancelled) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
          setError(errorMessage);
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      cancelled = true;
    };
  }, [countryCode, country.label, refreshKey]); // Only depend on country.label instead of entire country object

  return {
    products,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}

