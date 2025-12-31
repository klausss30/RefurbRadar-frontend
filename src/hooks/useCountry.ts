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
 * Detect country from IP using a free geolocation API
 * Tries ipapi.co first, falls back to ipinfo.io
 */
async function detectCountryFromIP(): Promise<string | null> {
  // Try ipapi.co first (no key required)
  try {
    const response = await fetch('https://ipapi.co/json/', {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const isoCode = data.country_code;
    
    if (isoCode && typeof isoCode === 'string') {
      const feedCode = mapIsoToFeedCode(isoCode);
      if (feedCode) {
        return feedCode;
      }
    }
  } catch (error) {
    console.warn('ipapi.co failed, trying ipinfo.io...', error);
  }

  // Fallback to ipinfo.io
  try {
    const response = await fetch('https://ipinfo.io/json', {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const isoCode = data.country;
    
    if (isoCode && typeof isoCode === 'string') {
      const feedCode = mapIsoToFeedCode(isoCode);
      if (feedCode) {
        return feedCode;
      }
    }
  } catch (error) {
    console.warn('ipinfo.io also failed:', error);
  }

  return null;
}

