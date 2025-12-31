/**
 * Formats price with currency symbol based on country locale
 */
export function formatPrice(price: number, currency: string, locale?: string): string {
  // If locale is provided, use it; otherwise try to infer from currency
  const formatLocale = locale || getLocaleFromCurrency(currency);
  
  const formatted = new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
  }).format(price);
  
  // Replace apostrophe/quotation mark characters with space (for Swiss format: 2'039.00 -> 2 039.00)
  // Support both ASCII apostrophe (U+0027) and Unicode right single quotation mark (U+2019)
  return formatted.replace(/[\u0027\u2019]/g, ' ');
}

/**
 * Get a reasonable locale from currency code
 */
function getLocaleFromCurrency(currency: string): string {
  const currencyLocaleMap: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE', // Default to German format for EUR
    GBP: 'en-GB',
    JPY: 'ja-JP',
    CNY: 'zh-CN',
    AUD: 'en-AU',
    CAD: 'en-CA',
    NZD: 'en-NZ',
    HKD: 'en-HK',
    SGD: 'en-SG',
    KRW: 'ko-KR',
    CHF: 'de-CH',
    TWD: 'zh-TW',
    PLN: 'pl-PL',
  };
  return currencyLocaleMap[currency] || 'en-US';
}

/**
 * Formats date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Formats relative time (e.g., "2 minutes ago", "5 hours ago")
 * Accepts both Date object and date string
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  // Handle negative time (future dates)
  if (diffMs < 0) {
    return 'Just now';
  }
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

/**
 * Creates a stable hash from multiple strings
 */
export function createHash(...strings: string[]): string {
  const combined = strings.join('|');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

