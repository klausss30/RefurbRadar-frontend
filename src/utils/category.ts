import type { Category } from "../types/product";

/**
 * Detects category from product title (case-insensitive)
 */
export function detectCategory(title: string): Category {
  const lower = title.toLowerCase();

  if (lower.includes("ipad")) return "iPad";
  if (lower.includes("iphone")) return "iPhone";
  if (lower.includes("macbook air")) return "MacBook Air";
  if (lower.includes("macbook pro")) return "MacBook Pro";
  if (lower.includes("imac")) return "iMac";
  if (lower.includes("mac mini")) return "Mac Mini";
  if (lower.includes("mac studio")) return "Mac Studio";
  if (lower.includes("mac pro")) return "Mac Pro";
  if (lower.includes("apple watch")) return "Apple Watch";
  if (lower.includes("apple tv")) return "Apple TV";
  if (lower.includes("homepod")) return "HomePod";
  if (lower.includes("studio display") || lower.includes("pro display"))
    return "Displays";

  // Check for common accessories
  if (
    lower.includes("keyboard") ||
    lower.includes("mouse") ||
    lower.includes("trackpad") ||
    lower.includes("magic")
  ) {
    return "Accessories";
  }

  return "Other";
}

/**
 * Cleans product title for display
 */
export function cleanTitle(title: string): string {
  // Remove common suffixes and clean up
  return title
    .replace(/\s*-\s*Refurbished.*$/i, "")
    .replace(/\s*\(Refurbished\).*$/i, "")
    .trim();
}
