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
 */
export function extractFirstImageSrc(html: string): string | undefined {
  const div = document.createElement('div');
  div.innerHTML = html;
  const img = div.querySelector('img');
  return img?.getAttribute('src') || undefined;
}

