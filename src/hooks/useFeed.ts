import { useState, useEffect } from 'react';
import { parseFeed } from '../api/parseFeed';
import { normalizeProducts } from '../api/normalizeProduct';
import type { Product } from '../types/product';
import type { Country as CountryCode } from '../types/product';
import type { Country as CountryConfig } from '../config/countries';
import { getLocalFeedPath } from '../config/countries';

/**
 * Hook to load feed for a specific country
 * Fetches from same-origin /data/{code}_in_all.xml
 */
export function useFeed(countryCode: string, country: CountryConfig) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      try {
        setLoading(true);
        setError(null);

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
  }, [countryCode, country]);

  return {
    products,
    loading,
    error,
    lastUpdated,
  };
}

