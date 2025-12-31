import type { Category } from "../types/product";

/**
 * Detects category from product title (case-insensitive)
 * Order matters: more specific matches should come first
 */
export function detectCategory(title: string): Category {
  const lower = title.toLowerCase();

  // iPad variants (must check before general "pad" matching)
  if (
    lower.includes("ipad air") ||
    lower.includes("ipad mini") ||
    lower.includes("ipad pro") ||
    lower.includes("ipad")
  ) {
    return "iPad";
  }

  // iPhone
  if (lower.includes("iphone")) return "iPhone";

  // MacBook variants (must check "air" and "pro" before general "macbook")
  if (lower.includes("macbook air")) return "MacBook Air";
  if (lower.includes("macbook pro")) return "MacBook Pro";
  if (lower.includes("macbook")) return "MacBook Air"; // Default MacBook to Air

  // Mac desktop variants
  if (lower.includes("mac studio")) return "Mac Studio";
  if (lower.includes("mac pro")) return "Mac Pro";
  if (lower.includes("mac mini")) return "Mac Mini";
  if (lower.includes("imac")) return "iMac";

  // Apple Watch
  if (
    lower.includes("apple watch") ||
    lower.includes("watch series") ||
    lower.includes("watch se")
  ) {
    return "Apple Watch";
  }

  // Apple TV
  if (lower.includes("apple tv")) return "Apple TV";

  // HomePod
  if (lower.includes("homepod") || lower.includes("home pod")) {
    return "HomePod";
  }

  // Displays
  if (
    lower.includes("studio display") ||
    lower.includes("pro display") ||
    lower.includes("display xdr") ||
    lower.includes("thunderbolt display")
  ) {
    return "Displays";
  }

  // Accessories (check after specific products)
  if (
    lower.includes("keyboard") ||
    lower.includes("mouse") ||
    lower.includes("trackpad") ||
    lower.includes("magic keyboard") ||
    lower.includes("magic mouse") ||
    lower.includes("magic trackpad") ||
    lower.includes("airpods") ||
    lower.includes("earpods") ||
    lower.includes("beats") ||
    lower.includes("pencil") ||
    lower.includes("smart cover") ||
    lower.includes("smart folio")
  ) {
    return "Accessories";
  }

  // Default fallback: If none of the above categories match, classify as "Other"
  // This ensures all products get a category, even if the detection algorithm misses them
  return "Other";
}

/**
 * Cleans product title for display
 * Removes SKU, price, and refurbished suffixes
 */
export function cleanTitle(title: string): string {
  // Remove price pattern: - $1,179.00 or - $1,179.00 (at the end)
  let cleaned = title.replace(/\s*-\s*\$[\d,]+(\.\d{2})?\s*$/i, "");

  // Remove SKU pattern: - FCA64X/A or - FCA64X/A/ (format: letters/numbers + / + letter)
  cleaned = cleaned.replace(/\s*-\s*[A-Z0-9]+\/[A-Z]+\s*/g, "");

  // Remove common suffixes and clean up
  cleaned = cleaned
    .replace(/\s*-\s*Refurbished.*$/i, "")
    .replace(/\s*\(Refurbished\).*$/i, "")
    .replace(/\s*-\s*$/g, "") // Remove trailing dashes
    .trim();

  return cleaned;
}
