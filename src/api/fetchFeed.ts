/**
 * Fetches RSS feed from the given URL
 * Uses Vite proxy in development, falls back to CORS proxy in production if needed
 */
export async function fetchFeed(url: string): Promise<string> {
  // In development, use Vite proxy to bypass CORS
  // In production, try direct fetch first, then fallback to CORS proxy
  const isDevelopment = import.meta.env.DEV;
  
  let fetchUrl = url;
  
  if (isDevelopment) {
    // Use Vite proxy (configured in vite.config.ts)
    fetchUrl = '/api/feed';
  }
  
  try {
    const response = await fetch(fetchUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }
    
    return response.text();
  } catch (error) {
    // If direct fetch fails in production (CORS issue), try CORS proxy
    if (!isDevelopment && error instanceof TypeError && error.message.includes('fetch')) {
      console.warn('Direct fetch failed, trying CORS proxy...');
      
      // Use a public CORS proxy as fallback
      // Note: This is a temporary solution. For production, consider setting up your own proxy.
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(corsProxyUrl);
      
      if (!proxyResponse.ok) {
        throw new Error(`Failed to fetch feed via proxy: ${proxyResponse.status} ${proxyResponse.statusText}`);
      }
      
      return proxyResponse.text();
    }
    
    throw error;
  }
}

