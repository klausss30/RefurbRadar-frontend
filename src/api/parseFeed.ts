/**
 * Parses Atom/RSS XML string and extracts entry/item elements
 * Supports both Atom feed format and RSS 2.0 format
 */
export function parseFeed(xmlString: string): Element[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Failed to parse feed: " + parserError.textContent);
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
      // Try innerHTML first (for CDATA content)
      description = contentEl.innerHTML || contentEl.textContent || "";
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
