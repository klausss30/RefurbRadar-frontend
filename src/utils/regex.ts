/**
 * Extracts price from text (e.g., "$1,099.00" -> 1099.00)
 */
export function extractPrice(text: string): number | null {
  const match = text.match(/\$([\d,]+(\.\d{2})?)/);
  if (!match) return null;
  const priceStr = match[1].replace(/,/g, '');
  const price = parseFloat(priceStr);
  return isNaN(price) ? null : price;
}

/**
 * Extracts SKU from text (e.g., "MTXX3/A" -> "MTXX3")
 */
export function extractSKU(text: string): string | undefined {
  // Pattern: 5+ alphanumeric followed by /A or similar
  const match = text.match(/([A-Z0-9]{5,})\/[A-Z]/);
  return match ? match[1] : undefined;
}

/**
 * Detects chip from text (M1/M2/M3/M4, S8/S9/S10, A15/A16/A17)
 */
export function detectChip(text: string): string | undefined {
  const match = text.match(/(M[1-4]|S(8|9|10)|A1[5-7])/i);
  return match ? match[1].toUpperCase() : undefined;
}

/**
 * Extracts RAM in GB from text
 */
export function extractRAM(text: string): number | undefined {
  const match = text.match(/(\d+)\s*GB\s*RAM/i);
  if (!match) return undefined;
  const ram = parseInt(match[1], 10);
  return isNaN(ram) ? undefined : ram;
}

/**
 * Extracts storage in GB from text (converts TB to GB)
 */
export function extractStorage(text: string): number | undefined {
  const match = text.match(/(\d+)\s*(GB|TB)/i);
  if (!match) return undefined;
  const size = parseInt(match[1], 10);
  const unit = match[2].toUpperCase();
  if (isNaN(size)) return undefined;
  return unit === 'TB' ? size * 1024 : size;
}

/**
 * Detects network type from text
 */
export function detectNetwork(text: string): "Wi-Fi" | "Cellular" | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('cellular') || lower.includes('wi-fi + cellular')) {
    return 'Cellular';
  }
  if (lower.includes('wi-fi')) {
    return 'Wi-Fi';
  }
  return undefined;
}

/**
 * Extracts size in inches from text
 */
export function extractSizeInch(text: string): number | undefined {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:inch|"|''|‑inch)/i);
  if (!match) return undefined;
  const size = parseFloat(match[1]);
  return isNaN(size) ? undefined : size;
}

