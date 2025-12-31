/**
 * Converts HTML string to plain text while preserving line breaks
 */
export function htmlToPlainText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Replace <br> tags with newlines
  div.querySelectorAll('br').forEach(br => {
    br.replaceWith('\n');
  });
  
  return div.textContent || div.innerText || '';
}

/**
 * Extracts text content from HTML
 */
export function extractText(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

/**
 * Extracts first image src from HTML
 * Optimizes Apple image URLs to use higher resolution
 */
export function extractFirstImageSrc(html: string): string | undefined {
  if (!html) return undefined;
  
  // Try multiple extraction methods
  let src: string | null = null;
  
  // Method 1: Use DOMParser for proper HTML parsing
  try {
    const div = document.createElement('div');
    div.innerHTML = html;
    const img = div.querySelector('img');
    src = img?.getAttribute('src') || null;
  } catch (e) {
    console.warn('Failed to parse HTML with DOMParser:', e);
  }
  
  // Method 2: Use regex as fallback if DOMParser fails
  if (!src) {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) {
      src = imgMatch[1];
    }
  }
  
  // Method 3: Try to find img tag with src attribute (case-insensitive)
  if (!src) {
    const imgTagMatch = html.match(/<img[^>]*src\s*=\s*["']?([^\s"'>]+)["']?/i);
    if (imgTagMatch && imgTagMatch[1]) {
      src = imgTagMatch[1];
    }
  }
  
  if (!src) {
    console.warn('No image URL found in HTML:', html.substring(0, 200));
    return undefined;
  }
  
  // Clean up the URL (remove query parameters if needed, but keep Apple URLs intact)
  src = src.trim();
  
  // Optimize Apple Store image URLs for better quality
  // Change from wid=320&hei=320 to wid=640&hei=640 for higher resolution
  if (src.includes('as-images.apple.com')) {
    src = src
      .replace(/wid=\d+/, 'wid=640')
      .replace(/hei=\d+/, 'hei=640');
  }
  
  return src;
}

/**
 * Extracts overview items from specs text
 * Removes image, title, price, and link text, keeping only the bullet-point specs
 * Also removes CDATA markers, superscript numbers, and dashes before model numbers
 */
export function extractOverviewItems(specsText: string): string[] {
  if (!specsText) return [];
  
  // Remove CDATA markers and other unwanted characters
  let cleanedText = specsText
    .replace(/\]\]>/g, '') // Remove CDATA end marker
    .replace(/<!\[CDATA\[/g, '') // Remove CDATA start marker
    .replace(/[¹²³⁴⁵⁶⁷⁸⁹⁰]/g, '') // Remove superscript numbers
    .replace(/[₁₂₃₄₅₆₇₈₉₀]/g, ''); // Remove subscript numbers
  
  // Split by newlines and filter out empty lines
  const lines = cleanedText
    .split(/\n+/)
    .map(line => {
      // Remove leading dashes (both regular dash and en dash) before model numbers
      // Pattern: starts with dash/en dash, followed by space, then alphanumeric model (e.g., "– FC6A4X/A" or "- FC6A4X/A")
      return line.trim().replace(/^[–-]\s+([A-Z0-9]+\/[A-Z])/, '$1');
    })
    .filter(line => {
      // Filter out empty lines and common non-spec text
      if (!line) return false;
      // Remove lines that are clearly not specs (price, links, etc.)
      if (line.match(/^\$[\d,]+/)) return false; // Price lines
      if (line.match(/Product page|View on|Apple Store/i)) return false; // Link text
      if (line.match(/^Refurbished\s/i)) return false; // Title repetition
      // Filter out SKU lines (format: letters/numbers followed by / and letter, like "FC6A4X/A")
      if (line.match(/^[A-Z0-9]+\/[A-Z]$/)) return false; // SKU only lines (e.g., "FC6A4X/A")
      if (line.match(/^[–-]\s*[A-Z0-9]+\/[A-Z]$/)) return false; // SKU with dash prefix
      return true;
    });
  
  return lines;
}

