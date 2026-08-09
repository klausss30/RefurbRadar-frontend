import { useCallback, useEffect, useMemo, useState } from 'react';
import { detectMarket, fetchMarkets } from '../api/backend';
import {
  COUNTRIES,
  DEFAULT_COUNTRY,
  mapIsoToFeedCode,
  type Country,
} from '../config/countries';

const STORAGE_KEY = 'refurbradar_country_code';

export function useCountry() {
  const [countries, setCountries] = useState<Country[]>(COUNTRIES);
  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY);
  const [isDetecting, setIsDetecting] = useState(true);
  const [detectionError, setDetectionError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function initializeCountry() {
      let availableCountries = COUNTRIES;

      try {
        const apiMarkets = await fetchMarkets(controller.signal);
        if (apiMarkets.length > 0) {
          availableCountries = apiMarkets;
          setCountries(apiMarkets);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn('Failed to load markets from API; using fallback configuration.', error);
      }

      const isSupported = (code: string) =>
        availableCountries.some((country) => country.code === code.toLowerCase());

      try {
        const urlCountry = new URLSearchParams(window.location.search).get('country');
        if (urlCountry && isSupported(urlCountry)) {
          const normalized = urlCountry.toLowerCase();
          setCountryCode(normalized);
          localStorage.setItem(STORAGE_KEY, normalized);
          return;
        }

        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && isSupported(stored)) {
          setCountryCode(stored);
          return;
        }

        const detected = await detectMarket(controller.signal);
        if (detected) {
          const normalized = detected.toLowerCase();
          const mapped = isSupported(normalized)
            ? normalized
            : mapIsoToFeedCode(normalized);

          if (mapped && isSupported(mapped)) {
            setCountryCode(mapped);
            localStorage.setItem(STORAGE_KEY, mapped);
            return;
          }
        }

        setCountryCode(DEFAULT_COUNTRY);
      } catch (error) {
        if (controller.signal.aborted) return;
        setDetectionError(error instanceof Error ? error.message : 'Country detection failed.');
        setCountryCode(DEFAULT_COUNTRY);
      } finally {
        if (!controller.signal.aborted) {
          setIsDetecting(false);
        }
      }
    }

    initializeCountry();
    return () => controller.abort();
  }, []);

  const updateCountry = useCallback((code: string) => {
    if (countries.some((country) => country.code === code)) {
      setCountryCode(code);
      localStorage.setItem(STORAGE_KEY, code);
    }
  }, [countries]);

  const country = useMemo(
    () => countries.find((item) => item.code === countryCode)
      || countries.find((item) => item.code === DEFAULT_COUNTRY)
      || COUNTRIES.find((item) => item.code === DEFAULT_COUNTRY)!,
    [countries, countryCode],
  );

  return {
    countryCode,
    country,
    updateCountry,
    isDetecting,
    detectionError,
    countries,
  };
}
