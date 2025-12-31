/**
 * Country configuration for RefurbRadar
 * Exact country list with feed codes as specified
 */

export interface Country {
  code: string;
  label: string;
}

/**
 * Ordered list of countries exactly as specified
 */
export const COUNTRIES: Country[] = [
  { code: 'au', label: 'Australia' },
  { code: 'bx', label: 'België' },
  { code: 'be', label: 'Belgique' },
  { code: 'ca', label: 'Canada (English)' },
  { code: 'xf', label: 'Canada (Français)' },
  { code: 'cn', label: '中国 (China)' },
  { code: 'de', label: 'Deutschland' },
  { code: 'es', label: 'España' },
  { code: 'fr', label: 'France' },
  { code: 'hk', label: 'Hong-Kong (English)' },
  { code: 'hz', label: 'Hong-Kong (汉语)' },
  { code: 'ie', label: 'Ireland' },
  { code: 'it', label: 'Italia' },
  { code: 'jp', label: '日本 (Japan)' },
  { code: 'nl', label: 'Nederland' },
  { code: 'nz', label: 'New Zealand' },
  { code: 'at', label: 'Österreich' },
  { code: 'pl', label: 'Polska' },
  { code: 'sg', label: 'Singapore' },
  { code: 'kr', label: '한국 (South Korea)' },
  { code: 'cx', label: 'Schweiz' },
  { code: 'ch', label: 'Suisse' },
  { code: 'tw', label: '台灣 (Taiwan)' },
  { code: 'uk', label: 'United Kingdom' },
  { code: 'us', label: 'United States' },
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

