/**
 * Parses Atom/RSS XML string and extracts entry/item elements
 * Supports both Atom feed format and RSS 2.0 format
 */
export function parseFeed(xmlString: string): Element[] {
  // Validate input
  if (!xmlString || xmlString.trim().length === 0) {
    throw new Error("Feed XML is empty");
  }

  // Check if it looks like HTML (common error when feed URL returns HTML error page)
  const trimmed = xmlString.trim();
  if (
    trimmed.toLowerCase().startsWith("<!doctype") ||
    trimmed.toLowerCase().startsWith("<html") ||
    trimmed.toLowerCase().startsWith("<!")
  ) {
    // Try to extract error message from HTML
    const htmlMatch =
      trimmed.match(/<title[^>]*>(.*?)<\/title>/i) ||
      trimmed.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const errorMsg = htmlMatch ? htmlMatch[1] : "Received HTML instead of XML";
    throw new Error(
      `Feed appears to be HTML (error page) instead of XML. ${errorMsg}`
    );
  }

  // Remove BOM if present
  const cleaned = trimmed.replace(/^\uFEFF/, "");

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(cleaned, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    const errorText = parserError.textContent || "Unknown XML parsing error";

    // Try to get more details about the error
    const lineMatch = errorText.match(/line (\d+)/i);

    let errorMessage = `Failed to parse feed XML: ${errorText}`;

    if (lineMatch) {
      const lineNum = parseInt(lineMatch[1], 10);
      const lines = cleaned.split("\n");
      if (lineNum > 0 && lineNum <= lines.length) {
        const problemLine = lines[lineNum - 1];
        errorMessage += `\n\nProblem at line ${lineNum}: ${problemLine.substring(
          0,
          100
        )}`;
      }
    }

    // Show first 500 chars for debugging
    if (cleaned.length > 0) {
      errorMessage += `\n\nFirst 500 characters of received data:\n${cleaned.substring(
        0,
        500
      )}`;
    }

    throw new Error(errorMessage);
  }

  // Try Atom format first (entry elements), then RSS 2.0 (item elements)
  const entries = xmlDoc.querySelectorAll("entry");
  if (entries.length > 0) {
    return Array.from(entries);
  }

  const items = xmlDoc.querySelectorAll("item");
  if (items.length > 0) {
    return Array.from(items);
  }

  throw new Error("No entries or items found in feed");
}

/**
 * Extracts data from an Atom entry or RSS item element
 */
export interface FeedItemData {
  title: string;
  description: string;
  link: string;
  pubDate: string;
}

export function extractItemData(item: Element): FeedItemData {
  const getText = (tagName: string, namespace?: string): string => {
    let element: Element | null = null;
    if (namespace) {
      // For namespaced elements, try with namespace
      element = item.querySelector(`${namespace}\\:${tagName}, ${tagName}`);
    } else {
      element = item.querySelector(tagName);
    }
    return element?.textContent || "";
  };

  // Determine if this is Atom or RSS format
  const isAtom =
    item.tagName === "entry" ||
    item.querySelector("entry") !== null ||
    item.querySelector("content") !== null;

  if (isAtom) {
    // Atom format
    const title = getText("title");

    // Content might be in CDATA, try to get innerHTML first, then fallback to textContent
    const contentEl = item.querySelector("content");
    let description = "";
    if (contentEl) {
      // For CDATA content in XML, innerHTML should work
      // But also try textContent as fallback
      description = contentEl.innerHTML || contentEl.textContent || "";

      // If still empty, try accessing the text node directly
      if (!description && contentEl.firstChild) {
        description = contentEl.firstChild.textContent || "";
      }
    }

    // Link is in href attribute
    const linkEl = item.querySelector('link[rel="alternate"], link');
    const link = linkEl?.getAttribute("href") || getText("link");

    // Use 'updated' instead of 'pubDate'
    const pubDate =
      getText("updated") || getText("published") || getText("pubDate");

    return {
      title,
      description,
      link,
      pubDate,
    };
  } else {
    // RSS 2.0 format
    return {
      title: getText("title"),
      description: getText("description"),
      link: getText("link"),
      pubDate: getText("pubDate"),
    };
  }
}
