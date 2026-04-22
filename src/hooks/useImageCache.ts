import { useState, useEffect, useRef } from 'react';

type ImageCacheStatus = 'loading' | 'loaded' | 'error';
type ImageStatus = 'idle' | ImageCacheStatus;

/**
 * Global image cache to track loaded images across all components
 * This prevents duplicate loading of the same image URL
 */
const imageCache = new Map<string, ImageCacheStatus>();
const imageLoadCallbacks = new Map<string, Set<(status: 'loaded' | 'error') => void>>();

/**
 * Preloads an image and caches its status
 * @param src Image URL
 * @returns Promise that resolves when image is loaded or fails
 */
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // If already cached as loaded, resolve immediately
    if (imageCache.get(src) === 'loaded') {
      resolve();
      return;
    }

    // If already cached as error, reject immediately
    if (imageCache.get(src) === 'error') {
      reject(new Error('Image failed to load'));
      return;
    }

    // If currently loading, wait for existing load to complete
    if (imageCache.get(src) === 'loading') {
      const callbacks = imageLoadCallbacks.get(src) || new Set();
      callbacks.add((status) => {
        if (status === 'loaded') {
          resolve();
        } else {
          reject(new Error('Image failed to load'));
        }
      });
      imageLoadCallbacks.set(src, callbacks);
      return;
    }

    // Mark as loading
    imageCache.set(src, 'loading');
    const callbacks = new Set<(status: 'loaded' | 'error') => void>();
    imageLoadCallbacks.set(src, callbacks);

    // Create image element to preload
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(src, 'loaded');
      resolve();
      // Notify all waiting callbacks
      callbacks.forEach(cb => cb('loaded'));
      imageLoadCallbacks.delete(src);
    };

    img.onerror = () => {
      imageCache.set(src, 'error');
      reject(new Error('Image failed to load'));
      // Notify all waiting callbacks
      callbacks.forEach(cb => cb('error'));
      imageLoadCallbacks.delete(src);
    };

    // Start loading
    img.src = src;
  });
}

/**
 * Hook to manage image loading with caching
 * Automatically handles preloading and caching of images
 * 
 * @param src Image URL
 * @returns Object with image loading state
 */
export function useImageCache(src: string | undefined) {
  const [status, setStatus] = useState<ImageStatus>(() => {
    if (!src) return 'error';
    return imageCache.get(src) ?? 'idle';
  });
  const hasStartedRef = useRef(false);

  const cachedStatus = src ? imageCache.get(src) : 'error';
  const resolvedStatus = cachedStatus ?? status;

  useEffect(() => {
    if (!src) {
      return;
    }

    if (imageCache.get(src)) {
      return;
    }

    // Don't start loading multiple times
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    // Preload the image
    preloadImage(src)
      .then(() => {
        setStatus('loaded');
      })
      .catch(() => {
        setStatus('error');
      });
  }, [src]);

  useEffect(() => {
    hasStartedRef.current = false;
  }, [src]);

  return resolvedStatus;
}

/**
 * Preload multiple images in parallel
 * Useful for preloading visible images before they enter viewport
 * 
 * @param urls Array of image URLs to preload
 */
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => preloadImage(url).catch(() => {
      // Ignore individual errors, continue with other images
    }))
  );
}

/**
 * Clear the image cache (useful for debugging or memory management)
 */
export function clearImageCache(): void {
  imageCache.clear();
  imageLoadCallbacks.clear();
}

/**
 * Get cache statistics (useful for debugging)
 */
export function getImageCacheStats() {
  return {
    total: imageCache.size,
    loaded: Array.from(imageCache.values()).filter(s => s === 'loaded').length,
    loading: Array.from(imageCache.values()).filter(s => s === 'loading').length,
    errors: Array.from(imageCache.values()).filter(s => s === 'error').length,
  };
}





