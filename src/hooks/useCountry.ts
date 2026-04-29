import { useState, useEffect, useCallback } from 'react';
import { COUNTRIES, DEFAULT_COUNTRY, mapIsoToFeedCode } from '../config/countries';

const STORAGE_KEY = 'refurbradar_country_code';
const GEO_CACHE_KEY = 'refurbradar_geo_detected';

/**
 * Hook to manage country selection with IP geolocation
 * 
 * Logic:
 * 1. Check localStorage first
 * 2. If not found, try IP geolocation (once)
 * 3. Fallback to default (nz)
 */
export function useCountry() {
  const [countryCode, setCountryCode] = useState<string>(DEFAULT_COUNTRY);
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  // Initialize country on mount
  useEffect(() => {
    async function initializeCountry() {
      try {
        const countryFromUrl = new URLSearchParams(window.location.search).get('country');
        if (countryFromUrl) {
          const urlCountry = COUNTRIES.find(c => c.code === countryFromUrl.toLowerCase());
          if (urlCountry) {
            setCountryCode(urlCountry.code);
            localStorage.setItem(STORAGE_KEY, urlCountry.code);
            setIsDetecting(false);
            return;
          }
        }

        // Step 1: Check localStorage
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const storedCountry = COUNTRIES.find(c => c.code === stored);
          if (storedCountry) {
            setCountryCode(stored);
            setIsDetecting(false);
            return;
          }
        }

        // Step 2: Check if we've already tried geo detection (to avoid repeated attempts)
        const geoAttempted = sessionStorage.getItem(GEO_CACHE_KEY);
        if (geoAttempted) {
          // Already tried, use default
          setCountryCode(DEFAULT_COUNTRY);
          setIsDetecting(false);
          return;
        }

        // Step 3: Try IP geolocation
        try {
          const detectedCode = await detectCountryFromIP();
          if (detectedCode) {
            setCountryCode(detectedCode);
            localStorage.setItem(STORAGE_KEY, detectedCode);
            sessionStorage.setItem(GEO_CACHE_KEY, 'true');
            setIsDetecting(false);
            return;
          }
        } catch (error) {
          console.warn('IP geolocation failed:', error);
          setDetectionError(error instanceof Error ? error.message : 'Geolocation failed');
          // Mark as attempted so we don't try again this session
          sessionStorage.setItem(GEO_CACHE_KEY, 'true');
        }

        // Step 4: Fallback to default
        setCountryCode(DEFAULT_COUNTRY);
        setIsDetecting(false);
      } catch (error) {
        console.error('Country initialization error:', error);
        setCountryCode(DEFAULT_COUNTRY);
        setIsDetecting(false);
      }
    }

    initializeCountry();
  }, []);

  // Update country code
  const updateCountry = useCallback((code: string) => {
    const country = COUNTRIES.find(c => c.code === code);
    if (country) {
      setCountryCode(code);
      localStorage.setItem(STORAGE_KEY, code);
    }
  }, []);

  // Get current country object
  const currentCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES.find(c => c.code === DEFAULT_COUNTRY)!;

  return {
    countryCode,
    country: currentCountry,
    updateCountry,
    isDetecting,
    detectionError,
    countries: COUNTRIES,
  };
}

/**
 * Detect country from IP using server-side API
 * Fetches IP geolocation through the proxy server
 */
async function detectCountryFromIP(): Promise<string | null> {
  // Get server proxy base URL from environment variable
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  if (!apiBaseUrl) {
    console.warn('VITE_API_BASE_URL is not configured. Cannot detect country from IP.');
    return null;
  }

  // Remove trailing slash from base URL if present
  const baseUrl = apiBaseUrl.replace(/\/$/, '');
  
  try {
    // Request IP geolocation from server
    // Server endpoint: GET /api/ip/country
    // Server should return the country code based on the client's IP address
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    // Safari compatibility: Use 'cors' mode explicitly and don't set User-Agent header
    // (User-Agent is a forbidden header in browser fetch requests)
    const response = await fetch(`${baseUrl}/api/ip/country`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit', // Safari: don't send cookies
      headers: {
        'Accept': 'application/json',
      },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Server should return: { countryCode: 'nz' } or { country_code: 'NZ' } or { isoCode: 'NZ' }
    // Try different possible response formats
    let feedCode: string | null = null;
    
    // First, try if server returns feed code directly (e.g., 'nz', 'us', 'cn')
    if (data.countryCode && typeof data.countryCode === 'string') {
      const country = COUNTRIES.find(c => c.code === data.countryCode.toLowerCase());
      if (country) {
        return data.countryCode.toLowerCase();
      }
    }
    
    // Try ISO code formats (e.g., 'NZ', 'US', 'CN')
    const isoCode = data.country_code || data.isoCode || data.country;
    
    if (isoCode && typeof isoCode === 'string') {
      // Convert to uppercase if needed and map to feed code
      const upperCode = isoCode.toUpperCase();
      feedCode = mapIsoToFeedCode(upperCode);
      if (feedCode) {
        return feedCode;
      }
    }

    console.warn('Server returned invalid or unsupported country code format:', data);
    return null;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('IP detection request timeout');
    } else {
      console.warn('Failed to detect country from IP via server:', error);
    }
    return null;
  }
}
