import { useEffect } from 'react';
import type { Product } from '../types/product';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  products?: Product[];
}

const DEFAULT_SITE_URL = 'https://refurbradar.com';
const DEFAULT_IMAGE = '/logo.PNG';

function getSiteUrl(): string {
  const envUrl = import.meta.env.VITE_SITE_URL;
  const runtimeUrl = typeof window !== 'undefined' ? window.location.origin : DEFAULT_SITE_URL;
  return (envUrl || runtimeUrl || DEFAULT_SITE_URL).replace(/\/$/, '');
}

function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.content = content;
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }

  element.href = href;
}

function setJsonLd(id: string, data: unknown) {
  let element = document.getElementById(id) as HTMLScriptElement | null;

  if (!element) {
    element = document.createElement('script');
    element.id = id;
    element.type = 'application/ld+json';
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(data);
}

export default function SEO({ title, description, canonicalPath = '/', products = [] }: SEOProps) {
  useEffect(() => {
    const siteUrl = getSiteUrl();
    const canonicalUrl = `${siteUrl}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;
    const imageUrl = `${siteUrl}${DEFAULT_IMAGE}`;

    document.title = title;
    setMeta('description', description);
    setMeta('robots', 'index, follow');
    setMeta('theme-color', '#0f172a');

    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', 'RefurbRadar', 'property');
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    setMeta('og:image', imageUrl, 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    setMeta('twitter:image', imageUrl);

    setLink('canonical', canonicalUrl);

    setJsonLd('refurbradar-website-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'RefurbRadar',
      url: siteUrl,
      description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });

    setJsonLd('refurbradar-organization-jsonld', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'RefurbRadar',
      url: siteUrl,
      logo: imageUrl,
    });

    if (products.length > 0) {
      setJsonLd('refurbradar-itemlist-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: products.slice(0, 24).map((product, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: product.link,
          item: {
            '@type': 'Product',
            name: product.title,
            image: product.imageUrl,
            category: product.category,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: product.currency,
              availability: 'https://schema.org/InStock',
              url: product.link,
            },
          },
        })),
      });
    }
  }, [title, description, canonicalPath, products]);

  return null;
}
