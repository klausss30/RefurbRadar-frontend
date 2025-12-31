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
      
      // Remove price lines (various formats)
      // US/UK format: $1,099.00 or £459.00
      if (line.match(/^[€$£¥][\d,]+(\.\d{2})?/)) return false;
      // JPY format: ￥295,800 or ¥295,800 (full-width ￥ or half-width ¥, comma thousands, no decimals)
      if (line.match(/^[￥¥][\d,]+/)) return false;
      // KRW format: ₩2,414,000 or ₩4,964,000 (₩ before, comma thousands, no decimals)
      if (line.match(/^₩[\d,]+/)) return false;
      // HK$ format: HK$22,699.00 or HK$ 22,699.00
      if (line.match(/^HK\$?\s*[\d,]+(\.\d{2})?/i)) return false;
      // European format with symbol before: € 79,00 or € 4.619,00
      if (line.match(/^[€$£¥]\s*[\d.,\s]+/)) return false;
      // European format with symbol after: 79,00 € or 4 619,00 € or 8 159,00 $
      if (line.match(/^[\d.,\s]+\s*[€$£¥]/)) return false;
      // PLN format: 4 249,00 zł or 339,00 zł (space thousands, comma decimal, zł after)
      if (line.match(/^[\d\s,]+\s*zł/i)) return false;
      // CHF format (Swiss German): CHF 1'599.00 or CHF 1'599.00 or CHF 109.00 (apostrophe/right single quote thousands, dot decimal, CHF before)
      // Support both ASCII apostrophe (U+0027) and Unicode right single quotation mark (U+2019)
      if (line.match(/^CHF\s*[\d\u0027\u2019]+\.\d{2}/i)) return false;
      // CHF format (Swiss French): 1 599.00 CHF or 109.00 CHF (space/apostrophe thousands, dot decimal, CHF after)
      if (line.match(/^[\d\s']+\.\d{2}\s*CHF/i)) return false;
      // Price with HTML tags: <strong>€ 79,00</strong> or <strong>HK$22,699.00</strong> or <strong>￥255,800</strong> or <strong>4 249,00 zł</strong> or <strong>₩2,414,000</strong> or <strong>CHF 1'599.00</strong> or <strong>1 599.00 CHF</strong>
      if (line.match(/<strong[^>]*>HK\$?\s*[\d.,]+<\/strong>/i)) return false;
      if (line.match(/<strong[^>]*>[￥¥][\d,]+<\/strong>/i)) return false; // JPY (full-width ￥ or half-width ¥)
      if (line.match(/<strong[^>]*>₩[\d,]+<\/strong>/i)) return false; // KRW
      if (line.match(/<strong[^>]*>[\d\s,]+\s*zł<\/strong>/i)) return false; // PLN
      if (line.match(/<strong[^>]*>CHF\s*[\d\u0027\u2019]+\.\d{2}<\/strong>/i)) return false; // CHF (German)
      if (line.match(/<strong[^>]*>[\d\s']+\.\d{2}\s*CHF<\/strong>/i)) return false; // CHF (French)
      if (line.match(/<strong[^>]*>[€$£¥]\s*[\d.,\s]+<\/strong>/i)) return false;
      // Striked price: <s>€ 89,00</s> or <s>2 999,00 zł</s> or <s>₩2,999,000</s> or <s>CHF 1'899.00</s> or <s>1 899.00 CHF</s>
      if (line.match(/<s>[\d\s,]+\s*zł<\/s>/i)) return false; // PLN
      if (line.match(/<s>₩[\d,]+<\/s>/i)) return false; // KRW
      if (line.match(/<s>CHF\s*[\d\u0027\u2019]+\.\d{2}<\/s>/i)) return false; // CHF (German)
      if (line.match(/<s>[\d\s']+\.\d{2}\s*CHF<\/s>/i)) return false; // CHF (French)
      if (line.match(/<s>[€$£¥￥\s\d.,]+<\/s>/i)) return false;
      
      // Remove link text (various languages)
      if (line.match(/Product page|View on|Apple Store/i)) return false;
      if (line.match(/Productpagina|Bekijk op/i)) return false; // Dutch
      if (line.match(/Page produit|Voir sur/i)) return false; // French
      
      // Remove title repetition (various languages and formats)
      // English: Refurbished Apple Pencil, Refurbished Mac Pro
      if (line.match(/^Refurbished\s+/i)) return false;
      
      // Chinese: 翻新 or 翻新產品 (refurbished) - Mainland China
      // Pattern: "翻新" or "翻新產品" at the start followed by product name
      // Chinese titles typically start with "翻新產品" + product name (e.g., "翻新產品 13 吋 MacBook Air...")
      if (line.match(/^翻新(產品)?\s+/)) {
        // Check if this looks like a product title (contains product name keywords)
        // Match common Apple product names in Chinese context
        const looksLikeTitle = /(Mac|iPad|iPhone|iMac|MacBook|Apple\s*(Watch|TV|Pencil)|HomePod)/i.test(line);
        if (looksLikeTitle) return false;
      }
      
      // Taiwan Chinese: 整修品 (refurbished)
      // Pattern: Product name + "整修品" (e.g., "14 吋 MacBook Pro Apple M3 Max 晶片配備 14 核心 CPU 與 30 核心 GPU - 太空黑色 (整修品)")
      // Taiwan titles typically contain product name followed by specifications and then "(整修品)"
      if (line.match(/整修品/)) {
        // Check if this looks like a product title (contains product name keywords)
        const looksLikeTitle = /(MacBook|Mac\s+mini|Mac\s+Pro|iMac|iPad|iPhone|AirPods|Apple\s+(Watch|TV|Pencil)|HomePod)/i.test(line);
        // Also check for common Taiwan product indicators (吋 for inches, 晶片 for chip, etc.)
        const hasProductIndicators = /(吋|晶片|核心|GB|TB)/.test(line);
        // Exclude if it's a full descriptive sentence (contains descriptive verbs like "推出", "提供", "包含")
        const isDescriptive = /\b(推出|提供|包含|配備|具有|支援|支援|使用|採用)\b/.test(line);
        if ((looksLikeTitle || hasProductIndicators) && !isDescriptive) return false;
      }
      
      // French: Check for product title patterns with "remis à neuf" or "reconditionné"
      // Pattern: Product name + "remis à neuf" (e.g., "Mac Pro remis à neuf", "MacBook Pro 16 po remis à neuf")
      // Filter lines that contain "remis à neuf" AND look like product titles
      // But exclude descriptive sentences like "Les ordinateurs Mac remis à neuf sont..."
      if (line.match(/remis\s+[àa]\s+neuf/i)) {
        // Check if this looks like a product title (contains product name keywords at the start)
        // Product titles typically start with product names, not descriptive text
        const looksLikeTitle = /^(Mac|iPad|iPhone|iMac|MacBook|Apple\s+(Watch|TV|Pencil)|HomePod)/i.test(line);
        // Also exclude if it's a full descriptive sentence (contains verbs like "sont", "sont offerts")
        const isDescriptive = /\b(sont|sont\s+offerts|est|sont\s+configurés)\b/i.test(line);
        if (looksLikeTitle && !isDescriptive) return false;
      }
      // Pattern: Product name + "reconditionné" (e.g., "Apple Pencil reconditionné", "Mac mini reconditionné")
      if (line.match(/reconditionn[ée]/i)) {
        // Check if this looks like a product title (starts with product name)
        const looksLikeTitle = /^(Mac|iPad|iPhone|iMac|MacBook|Apple\s+(Watch|TV|Pencil)|HomePod)/i.test(line);
        const isDescriptive = /\b(sont|sont\s+offerts|est|sont\s+configurés)\b/i.test(line);
        if (looksLikeTitle && !isDescriptive) return false;
      }
      
      // Dutch: Refurbished Apple Pencil
      if (line.match(/^Gerenoveerde\s+/i)) return false;
      
      // Italian: Check for product title patterns with "ricondizionato/ricondizionata/ricondizionati" (after product name)
      // Pattern: Product name + "ricondizionato" (e.g., "iMac 24\" ricondizionato con chip Apple M4...")
      if (line.match(/ricondizionat[oai]/i)) {
        // Check if this looks like a product title (starts with product name)
        const looksLikeTitle = /^(Mac|iPad|iPhone|iMac|MacBook|Apple\s+(Watch|TV|Pencil)|HomePod|AirPods)/i.test(line);
        // Exclude if it's a full descriptive sentence (contains verbs like "sono", "include", "offre")
        const isDescriptive = /\b(sono|include|includono|offre|offrono|è|hanno)\b/i.test(line);
        if (looksLikeTitle && !isDescriptive) return false;
      }
      
      // Spanish: Check for product title patterns with "reacondicionado" (after product name)
      // Pattern: Product name + "reacondicionado" (e.g., "MacBook Air reacondicionado de 13 pulgadas...")
      if (line.match(/reacondicionado/i)) {
        // Check if this looks like a product title (starts with product name)
        const looksLikeTitle = /^(Mac|iPad|iPhone|iMac|MacBook|Apple\s+(Watch|TV|Pencil)|HomePod)/i.test(line);
        // Exclude if it's a full descriptive sentence (contains verbs like "es", "son", "incluye")
        const isDescriptive = /\b(es|son|incluye|incluyen|est[áa]n|fueron|tienen)\b/i.test(line);
        if (looksLikeTitle && !isDescriptive) return false;
      }
      
      // Japanese: Check for product title patterns with "整備済製品" or "整備済み" (refurbished)
      // Pattern: Product name + "[整備済製品]" or similar (e.g., "11インチiPad Pro Wi-Fi 2TB - スペースグレイ（第4世代）[整備済製品]")
      if (line.match(/整備済(製品|み)?/)) {
        // Check if this looks like a product title (contains product name keywords)
        const looksLikeTitle = /(Mac|iPad|iPhone|iMac|MacBook|Apple\s+(Watch|TV|Pencil)|HomePod|AirPods)/i.test(line);
        // Also check for common Japanese product indicators
        const hasProductIndicators = /(インチ|GB|TB|Wi-Fi|Cellular|第\d+世代)/i.test(line);
        if (looksLikeTitle || hasProductIndicators) return false;
      }
      
      // Polish: Check for product title patterns with "Odnowiony/Odnowiona/Odnowione" (refurbished)
      // Pattern: "Odnowiony" at the start + product name (e.g., "Odnowiony Mac mini z czipem Apple M4...")
      if (line.match(/^Odnowion[ayeo]\s+/i)) {
        // Check if this looks like a product title (contains product name keywords)
        const looksLikeTitle = /(Mac|iPad|iPhone|iMac|MacBook|Apple\s+(Watch|TV|Pencil)|HomePod|AirPods)/i.test(line);
        // Exclude if it's a full descriptive sentence (contains verbs like "są", "zawiera", "ma")
        const isDescriptive = /\b(są|zawiera|zawierają|ma|mają|jest|to)\b/i.test(line);
        if (looksLikeTitle && !isDescriptive) return false;
      }
      
      // Korean: Check for product title patterns with "리퍼비쉬" (refurbished)
      // Pattern: "리퍼비쉬" at the start + product name (e.g., "리퍼비쉬 MacBook Pro 16 Apple M3 Max 칩 모델...")
      if (line.match(/^리퍼비쉬\s+/)) {
        // Check if this looks like a product title (contains product name keywords)
        const looksLikeTitle = /(Mac|iPad|iPhone|iMac|MacBook|Apple\s+(Watch|TV|Pencil)|HomePod|AirPods)/i.test(line);
        // Exclude if it's a full descriptive sentence (contains verbs like "입니다", "포함", "제공")
        const isDescriptive = /\b(입니다|포함|제공|있습니다|됩니다)\b/i.test(line);
        if (looksLikeTitle && !isDescriptive) return false;
      }
      
      // Remove HTML links (product titles in links)
      if (line.match(/<a[^>]*>.*?<\/a>/i)) return false;
      if (line.match(/<strong[^>]*><a/i)) return false;
      
      // Filter out SKU lines (format: letters/numbers followed by / and letter, like "FC6A4X/A")
      if (line.match(/^[A-Z0-9]{5,}\/[A-Z]$/)) return false; // SKU only lines (e.g., "FC6A4X/A")
      if (line.match(/^[–-]\s*[A-Z0-9]+\/[A-Z]$/)) return false; // SKU with dash prefix
      
      // Remove percentage/discount lines: −11% or &nbsp;&nbsp;&minus;11%
      if (line.match(/[−–-]\s*\d+%/)) return false;
      if (line.match(/&nbsp;.*?[−–-]\s*\d+%/)) return false;
      
      return true;
    });
  
  return lines;
}

