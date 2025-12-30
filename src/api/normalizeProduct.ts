import type { Product, Country } from "../types/product";
import { extractItemData } from "./parseFeed";
import { htmlToPlainText, extractFirstImageSrc } from "../utils/html";
import {
  extractPrice,
  extractSKU,
  detectChip,
  extractRAM,
  extractStorage,
  detectNetwork,
  extractSizeInch,
} from "../utils/regex";
import { detectCategory, cleanTitle } from "../utils/category";
import { createHash } from "../utils/format";

/**
 * Normalizes an RSS item element to a Product object
 */
export function normalizeProduct(
  item: Element,
  country: Country = "NZ"
): Product {
  const data = extractItemData(item);
  const descriptionHtml = data.description;
  const specsText = htmlToPlainText(descriptionHtml);

  // Extract basic fields
  // Price might be in title (format: "Product Name - SKU - $999.00") or in content
  const priceFromTitle = extractPrice(data.title);
  const priceFromContent = extractPrice(descriptionHtml);
  const price = priceFromTitle || priceFromContent || 0;

  // Extract image URL (debug if needed)
  const imageUrl = extractFirstImageSrc(descriptionHtml);
  if (!imageUrl && descriptionHtml) {
    console.warn(
      "No image URL extracted from description HTML. First 200 chars:",
      descriptionHtml.substring(0, 200)
    );
  }
  const sku = extractSKU(data.title) || extractSKU(descriptionHtml);

  // Detect category
  const category = detectCategory(data.title);
  const title = cleanTitle(data.title);

  // Parse specs from description
  const chip = detectChip(specsText);
  const ramGB = extractRAM(specsText);
  const storageGB = extractStorage(specsText);
  const network = detectNetwork(specsText);
  const sizeInch = extractSizeInch(specsText);

  // Create stable ID
  const id = createHash(data.title, data.pubDate, data.link);

  // Parse published date to ISO string
  const publishedAt = data.pubDate
    ? new Date(data.pubDate).toISOString()
    : new Date().toISOString();

  // Extract color (common patterns in titles)
  const colorMatch = data.title.match(
    /\b(Space Gray|Silver|Gold|Rose Gold|Blue|Pink|Purple|Green|Yellow|Orange|Red|Midnight|Starlight|Space Black)\b/i
  );
  const color = colorMatch ? colorMatch[1] : undefined;

  return {
    id,
    country,
    rawTitle: data.title,
    title,
    category,
    price,
    currency: "NZD",
    publishedAt,
    link: data.link,
    imageUrl,
    sku,
    chip,
    ramGB,
    storageGB,
    sizeInch,
    network,
    color,
    specsText,
  };
}

/**
 * Normalizes multiple RSS items to Product array
 */
export function normalizeProducts(
  items: Element[],
  country: Country = "NZ"
): Product[] {
  return items.map((item) => normalizeProduct(item, country));
}
