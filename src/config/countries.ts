/**
 * Country configuration for RefurbRadar
 * Exact country list with feed codes as specified
 */

export interface Country {
  code: string;
  label: string;
  currency: string; // ISO 4217 currency code (e.g., 'USD', 'EUR', 'GBP')
  currencySymbol: string; // Currency symbol for display (e.g., '$', '£', '€', '¥')
  locale: string; // Locale string for formatting (e.g., 'en-US', 'en-GB', 'de-DE')
  pricePattern: RegExp; // Regex pattern to extract price from text
}

/**
 * Country configuration with currency and locale information
 */
const createCountry = (
  code: string,
  label: string,
  currency: string,
  currencySymbol: string,
  locale: string,
  pricePattern: RegExp = /\$([\d,]+(\.\d{2})?)/ // Default to $ pattern
): Country => ({
  code,
  label,
  currency,
  currencySymbol,
  locale,
  pricePattern,
});

/**
 * Ordered list of countries exactly as specified
 */
export const COUNTRIES: Country[] = [
  createCountry('au', 'Australia', 'AUD', '$', 'en-AU'),
  // Belgium (Dutch): € 79,00 or € 4.619,00 (€ before, dot as thousands, comma as decimal)
  createCountry('bx', 'België', 'EUR', '€', 'nl-BE', /€\s*([\d.,\s]+)/),
  // Belgium (French): 79,00 € or 4 619,00 € (€ after, space as thousands, comma as decimal)
  createCountry('be', 'Belgique', 'EUR', '€', 'fr-BE', /([\d.,\s]+)\s*€/),
  createCountry('ca', 'Canada (English)', 'CAD', '$', 'en-CA'),
  // Canada (French): 8 159,00 $ ($ after, space as thousands, comma as decimal)
  createCountry('xf', 'Canada (Français)', 'CAD', '$', 'fr-CA', /([\d.,\s]+)\s*\$/),
  createCountry('cn', '中国 (China)', 'CNY', '¥', 'zh-CN', /¥([\d,]+(?:\.\d{2})?)/),
  // Germany: 1.179,00 € (€ after, dot thousands, comma decimal)
  createCountry('de', 'Deutschland', 'EUR', '€', 'de-DE', /([\d.,\s]+)\s*€/),
  // Spain: typically 1.099,00 € (€ after, dot thousands, comma decimal) 
  createCountry('es', 'España', 'EUR', '€', 'es-ES', /([\d.,\s]+)\s*€/),
  // France: typically 1 099,00 € (€ after, space thousands, comma decimal)
  createCountry('fr', 'France', 'EUR', '€', 'fr-FR', /([\d.,\s]+)\s*€/),
  createCountry('hk', 'Hong-Kong (English)', 'HKD', '$', 'en-HK'),
  createCountry('hz', 'Hong-Kong (汉语)', 'HKD', '$', 'zh-HK'),
  // Ireland: typically €1,099.00 (€ before, comma thousands, dot decimal)
  createCountry('ie', 'Ireland', 'EUR', '€', 'en-IE', /€\s*([\d.,\s]+)/),
  // Italy: 1.099,00 € (€ after, dot thousands, comma decimal)
  createCountry('it', 'Italia', 'EUR', '€', 'it-IT', /([\d.,\s]+)\s*€/),
  // Japan: ￥295,800 (full-width ￥, comma thousands, no decimals)
  createCountry('jp', '日本 (Japan)', 'JPY', '¥', 'ja-JP', /[￥¥]([\d,]+)/), // Full-width ￥ or half-width ¥
  // Netherlands: typically € 1.099,00 (€ before, dot thousands, comma decimal)
  createCountry('nl', 'Nederland', 'EUR', '€', 'nl-NL', /€\s*([\d.,\s]+)/),
  createCountry('nz', 'New Zealand', 'NZD', '$', 'en-NZ'),
  // Austria: typically € 1.099,00 (€ before, dot thousands, comma decimal)
  createCountry('at', 'Österreich', 'EUR', '€', 'de-AT', /€\s*([\d.,\s]+)/),
  createCountry('pl', 'Polska', 'PLN', 'zł', 'pl-PL', /([\d\s,]+(?:[.,]\d{2})?)\s*zł/i),
  createCountry('sg', 'Singapore', 'SGD', '$', 'en-SG'),
  createCountry('kr', '한국 (South Korea)', 'KRW', '₩', 'ko-KR', /₩([\d,]+)/),
  // Switzerland (German): CHF 1'599.00 or CHF 1'599.00 (apostrophe/right single quote thousands, dot decimal)
  // Support both ASCII apostrophe (U+0027) and Unicode right single quotation mark (U+2019)
  createCountry('cx', 'Schweiz', 'CHF', 'CHF', 'de-CH', /CHF\s*([\d\u0027\u2019]+\.\d{2})/i),
  // Switzerland (French): 1 599.00 CHF (space/apostrophe thousands, dot decimal, CHF after)
  createCountry('ch', 'Suisse', 'CHF', 'CHF', 'fr-CH', /([\d\s']+\.\d{2})\s*CHF/i),
  // Taiwan: $97,690.00 (US dollar format, but currency is TWD)
  createCountry('tw', '台灣 (Taiwan)', 'TWD', 'NT$', 'zh-TW', /\$([\d,]+(?:\.\d{2})?)/),
  createCountry('uk', 'United Kingdom', 'GBP', '£', 'en-GB', /£([\d,]+(?:\.\d{2})?)/),
  createCountry('us', 'United States', 'USD', '$', 'en-US'),
];

/**
 * Map ISO country codes (from IP geolocation) to our feed codes
 * Maps: ISO code -> feed code
 */
const ISO_TO_FEED_CODE: Record<string, string> = {
  AU: 'au', // Australia
  BE: 'be', // Belgique (default for Belgium)
  CA: 'ca', // Canada (English default)
  CN: 'cn', // China
  DE: 'de', // Deutschland
  ES: 'es', // España
  FR: 'fr', // France
  HK: 'hk', // Hong-Kong (English default)
  IE: 'ie', // Ireland
  IT: 'it', // Italia
  JP: 'jp', // Japan
  NL: 'nl', // Nederland
  NZ: 'nz', // New Zealand
  AT: 'at', // Österreich
  PL: 'pl', // Polska
  SG: 'sg', // Singapore
  KR: 'kr', // South Korea
  CH: 'ch', // Suisse (French default for Switzerland)
  TW: 'tw', // Taiwan
  GB: 'uk', // United Kingdom
  US: 'us', // United States
};

/**
 * Get country by code
 */
export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

/**
 * Get country label by code
 */
export function getCountryLabel(code: string): string {
  const country = getCountryByCode(code);
  return country?.label || code.toUpperCase();
}

/**
 * Map ISO country code to feed code
 * @param isoCode ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB')
 * @returns Feed code or null if not mapped
 */
export function mapIsoToFeedCode(isoCode: string): string | null {
  const upper = isoCode.toUpperCase();
  return ISO_TO_FEED_CODE[upper] || null;
}

/**
 * Get country configuration by code
 */
export function getCountryConfig(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

/**
 * Get currency code for a country
 */
export function getCurrencyCode(code: string): string {
  const country = getCountryConfig(code);
  return country?.currency || 'USD';
}

/**
 * Get locale for a country
 */
export function getLocale(code: string): string {
  const country = getCountryConfig(code);
  return country?.locale || 'en-US';
}

/**
 * Get price extraction pattern for a country
 */
export function getPricePattern(code: string): RegExp {
  const country = getCountryConfig(code);
  return country?.pricePattern || /\$([\d,]+(\.\d{2})?)/;
}

/**
 * Get feed URL for a country code (for reference, not used at runtime)
 * Format: https://refurb-tracker.com/feeds/{code}_in_all.xml
 */
export function getFeedUrl(code: string): string {
  return `https://refurb-tracker.com/feeds/${code}_in_all.xml`;
}

/**
 * Get local feed path (same-origin)
 * Format: /data/{code}_in_all.xml
 */
export function getLocalFeedPath(code: string): string {
  return `/data/${code}_in_all.xml`;
}

/**
 * Default fallback country
 */
export const DEFAULT_COUNTRY = 'nz';

