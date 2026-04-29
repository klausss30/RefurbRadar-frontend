#!/usr/bin/env node

import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');

const SITE_URL = (process.env.VITE_SITE_URL || 'https://refurbradar.com').replace(/\/$/, '');
const COUNTRIES = [
  'au', 'bx', 'be', 'ca', 'xf', 'cn', 'de', 'es', 'fr',
  'hk', 'hz', 'ie', 'it', 'jp', 'nl', 'nz', 'at', 'pl',
  'sg', 'kr', 'cx', 'ch', 'tw', 'uk', 'us',
];
const CATEGORIES = [
  'MacBook Air',
  'MacBook Pro',
  'iMac',
  'Mac Mini',
  'Mac Studio',
  'Mac Pro',
  'iPad',
  'iPhone',
  'Apple Watch',
  'Apple TV',
  'HomePod',
  'Displays',
  'Accessories',
];

function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildUrl(path, priority) {
  return [
    '  <url>',
    `    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>`,
    '    <changefreq>hourly</changefreq>',
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

const urls = [
  buildUrl('/', '1.0'),
  ...COUNTRIES.map((country) => buildUrl(`/?country=${encodeURIComponent(country)}`, '0.9')),
  ...COUNTRIES.flatMap((country) =>
    CATEGORIES.map((category) =>
      buildUrl(
        `/?country=${encodeURIComponent(country)}&category=${encodeURIComponent(category)}`,
        '0.8'
      )
    )
  ),
];

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls,
  '</urlset>',
  '',
].join('\n');

await writeFile(join(ROOT_DIR, 'public', 'sitemap.xml'), sitemap, 'utf-8');
console.log(`Generated ${urls.length} sitemap URLs for ${SITE_URL}`);
