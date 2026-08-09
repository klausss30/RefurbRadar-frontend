export interface Country {
  code: string;
  label: string;
  currency: string;
  locale: string;
  timezone: string;
}

const createCountry = (
  code: string,
  label: string,
  currency: string,
  locale: string,
  timezone: string,
): Country => ({ code, label, currency, locale, timezone });

/** Used while the API is loading and as an offline fallback. */
export const COUNTRIES: Country[] = [
  createCountry('au', 'Australia', 'AUD', 'en-AU', 'Australia/Sydney'),
  createCountry('bx', 'België', 'EUR', 'nl-BE', 'Europe/Brussels'),
  createCountry('be', 'Belgique', 'EUR', 'fr-BE', 'Europe/Brussels'),
  createCountry('ca', 'Canada (English)', 'CAD', 'en-CA', 'America/Toronto'),
  createCountry('xf', 'Canada (Français)', 'CAD', 'fr-CA', 'America/Toronto'),
  createCountry('cn', '中国 (China)', 'CNY', 'zh-CN', 'Asia/Shanghai'),
  createCountry('de', 'Deutschland', 'EUR', 'de-DE', 'Europe/Berlin'),
  createCountry('es', 'España', 'EUR', 'es-ES', 'Europe/Madrid'),
  createCountry('fr', 'France', 'EUR', 'fr-FR', 'Europe/Paris'),
  createCountry('hk', 'Hong-Kong (English)', 'HKD', 'en-HK', 'Asia/Hong_Kong'),
  createCountry('hz', 'Hong-Kong (汉语)', 'HKD', 'zh-HK', 'Asia/Hong_Kong'),
  createCountry('ie', 'Ireland', 'EUR', 'en-IE', 'Europe/Dublin'),
  createCountry('it', 'Italia', 'EUR', 'it-IT', 'Europe/Rome'),
  createCountry('jp', '日本 (Japan)', 'JPY', 'ja-JP', 'Asia/Tokyo'),
  createCountry('nl', 'Nederland', 'EUR', 'nl-NL', 'Europe/Amsterdam'),
  createCountry('nz', 'New Zealand', 'NZD', 'en-NZ', 'Pacific/Auckland'),
  createCountry('at', 'Österreich', 'EUR', 'de-AT', 'Europe/Vienna'),
  createCountry('pl', 'Polska', 'PLN', 'pl-PL', 'Europe/Warsaw'),
  createCountry('sg', 'Singapore', 'SGD', 'en-SG', 'Asia/Singapore'),
  createCountry('kr', '한국 (South Korea)', 'KRW', 'ko-KR', 'Asia/Seoul'),
  createCountry('cx', 'Schweiz', 'CHF', 'de-CH', 'Europe/Zurich'),
  createCountry('ch', 'Suisse', 'CHF', 'fr-CH', 'Europe/Zurich'),
  createCountry('tw', '台灣 (Taiwan)', 'TWD', 'zh-TW', 'Asia/Taipei'),
  createCountry('uk', 'United Kingdom', 'GBP', 'en-GB', 'Europe/London'),
  createCountry('us', 'United States', 'USD', 'en-US', 'America/New_York'),
];

const ISO_TO_FEED_CODE: Record<string, string> = {
  AU: 'au', BE: 'be', CA: 'ca', CN: 'cn', DE: 'de', ES: 'es', FR: 'fr',
  HK: 'hk', IE: 'ie', IT: 'it', JP: 'jp', NL: 'nl', NZ: 'nz', AT: 'at',
  PL: 'pl', SG: 'sg', KR: 'kr', CH: 'ch', TW: 'tw', GB: 'uk', US: 'us',
};

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((country) => country.code === code);
}

export function mapIsoToFeedCode(isoCode: string): string | null {
  return ISO_TO_FEED_CODE[isoCode.toUpperCase()] || null;
}

export function getLocale(code: string): string {
  return getCountryByCode(code)?.locale || 'en-US';
}

const MARKET_DISPLAY_CODES: Record<string, string> = {
  bx: 'BE-NL',
  be: 'BE-FR',
  ca: 'CA-EN',
  xf: 'CA-FR',
  hk: 'HK-EN',
  hz: 'HK-ZH',
  cx: 'CH-DE',
  ch: 'CH-FR',
};

export function getMarketDisplayCode(code: string): string {
  return MARKET_DISPLAY_CODES[code] || code.toUpperCase();
}

export const DEFAULT_COUNTRY = 'nz';
