import type { Category } from "../types/product";

/**
 * Detects category from product title (case-insensitive)
 * Order matters: more specific matches should come first
 * Works with multilingual titles as Apple product names are usually in English
 */
export function detectCategory(title: string): Category {
  // Normalize: remove accents, normalize Unicode spaces to regular spaces, and convert to lowercase
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, " ") // Replace various Unicode spaces with regular space
    .replace(/[-_/]+/g, " ") // Normalize common separators so "Mac-mini" still matches
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .toLowerCase();

  // iPad variants (must check before general "pad" matching)
  if (
    normalized.includes("ipad air") ||
    normalized.includes("ipad mini") ||
    normalized.includes("ipad pro") ||
    normalized.includes("ipad")
  ) {
    return "iPad";
  }

  // Apple Watch
  // Check before iPhone because Watch specs can mention iPhone features such as Precision Finding.
  if (
    normalized.includes("apple watch") ||
    normalized.includes("watch series") ||
    normalized.includes("watch se") ||
    /\bwatch\s+(ultra|series|se)\b/.test(normalized) ||
    /\b(series\s+\d+|se|ultra)\b.*\b(gps|cellular|aluminium|aluminum|stainless|titanium)\b/.test(normalized)
  ) {
    return "Apple Watch";
  }

  // iPhone
  if (/\biphone\b/.test(normalized)) return "iPhone";

  // MacBook variants (must check "air" and "pro" before general "macbook")
  // Also check for "macbook" as one word or "mac book" separated
  if (normalized.includes("macbook air") || normalized.includes("mac book air"))
    return "MacBook Air";
  if (normalized.includes("macbook pro") || normalized.includes("mac book pro"))
    return "MacBook Pro";
  if (normalized.includes("macbook") || normalized.includes("mac book"))
    return "MacBook Air"; // Default MacBook to Air

  // Mac desktop variants
  // Check "mac studio" before "mac pro" and "mac mini" for specificity
  if (normalized.includes("mac studio") || normalized.includes("macstudio"))
    return "Mac Studio";
  if (normalized.includes("mac pro") || normalized.includes("macpro"))
    return "Mac Pro";
  if (normalized.includes("mac mini") || normalized.includes("macmini"))
    return "Mac Mini";
  if (normalized.includes("imac") || normalized.includes("i mac"))
    return "iMac";

  // Apple TV
  if (normalized.includes("apple tv")) return "Apple TV";

  // HomePod
  if (normalized.includes("homepod") || normalized.includes("home pod")) {
    return "HomePod";
  }

  // Displays
  if (
    normalized.includes("studio display") ||
    normalized.includes("pro display") ||
    normalized.includes("display xdr") ||
    normalized.includes("thunderbolt display")
  ) {
    return "Displays";
  }

  // Accessories (check after specific products)
  // Also check for common translations/alternatives
  if (
    normalized.includes("keyboard") ||
    normalized.includes("clavier") || // French
    normalized.includes("toetsenbord") || // Dutch
    normalized.includes("mouse") ||
    normalized.includes("souris") || // French
    normalized.includes("muis") || // Dutch
    normalized.includes("trackpad") ||
    normalized.includes("magic keyboard") ||
    normalized.includes("magic mouse") ||
    normalized.includes("magic trackpad") ||
    normalized.includes("airpods") ||
    normalized.includes("earpods") ||
    normalized.includes("beats") ||
    normalized.includes("pencil") ||
    normalized.includes("crayon") || // French for pencil
    normalized.includes("potlood") || // Dutch for pencil
    normalized.includes("smart cover") ||
    normalized.includes("smart folio")
  ) {
    return "Accessories";
  }

  // Default fallback: If none of the above categories match, classify as "Other"
  // This ensures all products get a category, even if the detection algorithm misses them
  return "Other";
}

/**
 * Cleans product title for display
 * Removes SKU, price (various formats), and refurbished suffixes
 */
export function cleanTitle(title: string): string {
  let cleaned = title;

  // First, remove SKU pattern (usually comes before price)
  // Format: letters/numbers + / + letter(s), e.g., FUWA3ZM/A or G1KZ9FN/A
  cleaned = cleaned.replace(/\s*-\s*[A-Z0-9]{5,}\/[A-Z]+\s*/gi, "");
  cleaned = cleaned.replace(/\s*-\s*[A-Z0-9]+\/[A-Z]+\s*/g, "");

  // Remove price patterns (various formats):
  // - $1,179.00 (US format)
  // - € 79,00 or € 4.619,00 (European format, symbol before)
  // - 79,00 € or 4 619,00 € (European format, symbol after)
  // - 8 159,00 $ (Canadian French format)
  // - £459.00 (UK format)

  // Remove price with symbol before: - € 79,00 or - € 4.619,00
  cleaned = cleaned.replace(/\s*-\s*[€£¥]\s*[\d\s.,]+$/i, "");

  // Remove price with symbol after: - 79,00 € or - 4 619,00 € or - 8 159,00 $
  cleaned = cleaned.replace(/\s*-\s*[\d\s.,]+\s*[€$£¥]\s*$/i, "");

  // Remove US/UK format: - $1,179.00 or - £459.00
  cleaned = cleaned.replace(/\s*-\s*[€$£¥][\d,]+(\.\d{2})?\s*$/i, "");

  // Remove HK$ format: - HK$22,699.00 or - HK$ 22,699.00 or -- HK$12,629.00 (multiple dashes)
  // Note: HK$ always includes the $ symbol, so we match HK\$ (not optional)
  cleaned = cleaned.replace(/\s*-+\s*HK\$\s*[\d,]+(\.\d{2})?\s*$/i, "");

  // Remove JPY format: - ￥295,800 or - ¥295,800 (full-width ￥ or half-width ¥, comma thousands, no decimals)
  cleaned = cleaned.replace(/\s*-+\s*[￥¥]\s*[\d,]+\s*$/i, "");

  // Remove KRW format: - ₩4,964,000 or - ₩ 4,964,000 (₩ before, comma thousands, no decimals)
  cleaned = cleaned.replace(/\s*-+\s*₩\s*[\d,]+\s*$/i, "");

  // Remove CHF format (Swiss German): - CHF 1'599.00 or - CHF 1'599.00 or - CHF 109.00 (apostrophe/right single quote thousands, dot decimal, CHF before)
  // Support both ASCII apostrophe (U+0027) and Unicode right single quotation mark (U+2019)
  cleaned = cleaned.replace(/\s*-+\s*CHF\s*[\d\u0027\u2019]+\.\d{2}\s*$/i, "");

  // Remove CHF format (Swiss French): - 1 599.00 CHF or - 109.00 CHF (space/apostrophe thousands, dot decimal, CHF after)
  cleaned = cleaned.replace(/\s*-+\s*[\d\s']+\.\d{2}\s*CHF\s*$/i, "");

  // Note: We don't remove "Refurbished" prefix for English titles
  // as all products are refurbished and it's useful information to display

  // French - remove "reconditionné" and "remis à neuf" at the start
  // Match with and without accents
  cleaned = cleaned.replace(/^[^\s]+\s+reconditionn[ée]\s+/i, ""); // "X reconditionné " at start
  cleaned = cleaned.replace(/^reconditionn[ée]\s+/i, ""); // "reconditionné " at start
  cleaned = cleaned.replace(/^remis\s+[àa]\s+neuf\s+/i, ""); // "remis à neuf " at start

  // Dutch
  cleaned = cleaned.replace(/^Gerenoveerde\s+/i, "");

  // Remove refurbished suffixes (various languages)
  // English
  cleaned = cleaned.replace(/\s*-\s*Refurbished.*$/i, "");
  cleaned = cleaned.replace(/\s*\(Refurbished\).*$/i, "");

  // French - remove "reconditionné" at the end (before any remaining dashes)
  cleaned = cleaned.replace(/\s+reconditionn[ée]\s*$/i, "");

  // Dutch
  cleaned = cleaned.replace(/\s+gerenoveerde\s*$/i, "");

  // Clean up trailing dashes and spaces
  cleaned = cleaned.replace(/\s*-\s*$/g, "").trim();

  return cleaned;
}
