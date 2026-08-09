import type { Category } from '../types/product';

export interface ProductGroup {
  slug: string;
  label: string;
  description: string;
  categories: Category[];
}

export const PRODUCT_GROUPS: ProductGroup[] = [
  {
    slug: 'mac',
    label: 'Mac',
    description: 'MacBook, iMac, Mac mini, Mac Studio and Mac Pro.',
    categories: ['MacBook Neo', 'MacBook Air', 'MacBook Pro', 'iMac', 'Mac Mini', 'Mac Studio', 'Mac Pro'],
  },
  {
    slug: 'ipad',
    label: 'iPad',
    description: 'Refurbished iPad models for work, creativity and everyday use.',
    categories: ['iPad'],
  },
  {
    slug: 'iphone',
    label: 'iPhone',
    description: 'Refurbished iPhone models available from Apple.',
    categories: ['iPhone'],
  },
  {
    slug: 'watch',
    label: 'Watch',
    description: 'Apple Watch models, sizes, cases and bands.',
    categories: ['Apple Watch'],
  },
  {
    slug: 'tv-home',
    label: 'Apple TV',
    description: 'Apple TV and HomePod products for the home.',
    categories: ['Apple TV', 'HomePod'],
  },
  {
    slug: 'displays',
    label: 'Displays',
    description: 'Studio Display and Pro Display models.',
    categories: ['Displays'],
  },
  {
    slug: 'accessories',
    label: 'Accessories',
    description: 'Apple accessories and other refurbished products.',
    categories: ['Accessories', 'Other'],
  },
];

export function getProductGroup(slug: string | null): ProductGroup | undefined {
  return PRODUCT_GROUPS.find((group) => group.slug === slug);
}
