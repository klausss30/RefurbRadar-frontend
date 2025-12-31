/**
 * Extracts price from text using a custom pattern
 * @param text Text to search for price
 * @param pattern Regex pattern that captures the numeric part (group 1)
 * @returns Price as number or null
 */
export function extractPrice(text: string, pattern: RegExp = /\$([\d,]+(\.\d{2})?)/): number | null {
  const match = text.match(pattern);
  if (!match) return null;
  
  // Get the captured group (should be group 1)
  const priceStr = match[1] || match[0];
  
  if (!priceStr) return null;
  
  // Handle different number formats:
  // 1. US/UK format: 1,099.00 (comma thousands, dot decimal)
  // 2. European format: 1.099,00 or 1 099,00 (dot/space thousands, comma decimal)
  // 3. Simple format: 1099.00 or 1099,00
  
  // Check if it uses comma as decimal separator (European format)
  const trimmed = priceStr.trim();
  const hasCommaDecimal = /,\d{2}\s*$/.test(trimmed);
  const hasDotDecimal = /\.\d{2}\s*$/.test(trimmed);
  
  let cleaned: string;
  
  // Handle apostrophe or space as thousands separator with dot decimal (Swiss format: 1'599.00 or 1 599.00)
  // Support both ASCII apostrophe (U+0027) and Unicode right single quotation mark (U+2019)
  // Treat apostrophes as spaces (thousands separators)
  const hasApostrophe = /[\u0027\u2019]/.test(trimmed);
  if (hasDotDecimal && (hasApostrophe || (trimmed.includes(' ') && trimmed.split(' ').length > 1))) {
    // Remove apostrophes (ASCII and Unicode) and spaces (thousands separators), keep dot (decimal separator)
    cleaned = trimmed.replace(/[\u0027\u2019\s]/g, '');
  } else if (hasCommaDecimal) {
    // European format: comma as decimal, dot/space as thousands
    // e.g., "4.619,00" or "4 619,00" -> 4619.00
    // Replace last comma (decimal separator) with dot, remove dots/spaces (thousands separators)
    const lastCommaIndex = trimmed.lastIndexOf(',');
    if (lastCommaIndex >= 0) {
      // Replace last comma with dot, remove all other separators (dots and spaces)
      cleaned = trimmed
        .substring(0, lastCommaIndex)
        .replace(/[\s\.]/g, '') + '.' + trimmed.substring(lastCommaIndex + 1).replace(/\D/g, '');
    } else {
      cleaned = trimmed.replace(/[\s\.]/g, '');
    }
  } else if (hasDotDecimal) {
    // US/UK format: dot as decimal, comma/apostrophe as thousands
    // e.g., "1,099.00" or "1'599.00" or "1'599.00" -> 1099.00 or 1599.00
    // Treat apostrophes as spaces (thousands separators)
    cleaned = trimmed.replace(/[,\u0027\u2019\s]/g, '');  // Remove commas, apostrophes (ASCII and Unicode), and spaces (thousands separators)
  } else {
    // No clear decimal separator, try to infer:
    // If last comma/dot is followed by 2 digits, it's probably decimal
    const lastComma = priceStr.lastIndexOf(',');
    const lastDot = priceStr.lastIndexOf('.');
    const lastSeparator = Math.max(lastComma, lastDot);
    
    if (lastSeparator > 0) {
      const afterSeparator = priceStr.substring(lastSeparator + 1).replace(/\D/g, '');
      if (afterSeparator.length === 2) {
        // Likely decimal separator
        if (lastComma > lastDot) {
          cleaned = priceStr.replace(/[\s\.]/g, '').replace(',', '.');
        } else {
          cleaned = priceStr.replace(/,/g, '');
        }
      } else {
        // Likely thousands separator - remove all separators
        cleaned = priceStr.replace(/[,\s\.]/g, '');
      }
    } else {
      // No separator, just digits
      cleaned = priceStr.replace(/[,\s\.]/g, '');
    }
  }
  
  // Try to parse as float
  const price = parseFloat(cleaned);
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

