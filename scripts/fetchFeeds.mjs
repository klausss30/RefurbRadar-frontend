#!/usr/bin/env node

/**
 * Build-time script to fetch RSS feeds from refurb-tracker.com
 * Downloads feeds for all countries into public/data/
 * 
 * Usage: node scripts/fetchFeeds.mjs
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, '..');
const DATA_DIR = join(ROOT_DIR, 'public', 'data');

// Country codes to fetch (can be limited for faster builds)
const COUNTRIES = [
  'au', 'bx', 'be', 'ca', 'xf', 'cn', 'de', 'es', 'fr',
  'hk', 'hz', 'ie', 'it', 'jp', 'nl', 'nz', 'at', 'pl',
  'sg', 'kr', 'cx', 'ch', 'tw', 'uk', 'us'
];

// Minimum required countries (at least these should be fetched)
const MINIMUM_COUNTRIES = ['nz', 'us', 'au'];

/**
 * Fetch a single feed
 */
async function fetchFeed(countryCode) {
  const url = `https://refurb-tracker.com/feeds/${countryCode}_in_all.xml`;
  console.log(`Fetching ${countryCode}...`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RefurbRadar/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    
    if (!content || content.trim().length === 0) {
      throw new Error('Empty response');
    }
    
    // Check if response is actually XML and not HTML error page
    const trimmed = content.trim();
    if (
      trimmed.toLowerCase().startsWith('<!doctype') ||
      trimmed.toLowerCase().startsWith('<html') ||
      trimmed.toLowerCase().startsWith('<!') ||
      !trimmed.startsWith('<?xml') && !trimmed.startsWith('<feed') && !trimmed.startsWith('<rss')
    ) {
      // Try to extract error message from HTML
      const htmlMatch =
        trimmed.match(/<title[^>]*>(.*?)<\/title>/i) ||
        trimmed.match(/<h1[^>]*>(.*?)<\/h1>/i) ||
        trimmed.match(/<body[^>]*>[\s\S]*?<\/body>/i);
      
      let errorMsg = 'Received HTML error page instead of XML';
      if (htmlMatch) {
        errorMsg += `: ${htmlMatch[1].substring(0, 100)}`;
      }
      
      throw new Error(errorMsg);
    }
    
    // Validate it's valid XML by checking for feed/entry or rss/item tags
    const hasFeedContent = 
      trimmed.includes('<feed') || 
      trimmed.includes('<entry') ||
      trimmed.includes('<rss') ||
      trimmed.includes('<item');
    
    if (!hasFeedContent) {
      throw new Error('Response does not contain valid feed structure (no feed/entry or rss/item tags)');
    }
    
    const outputPath = join(DATA_DIR, `${countryCode}_in_all.xml`);
    await writeFile(outputPath, content, 'utf-8');
    
    console.log(`✓ ${countryCode} saved (${(content.length / 1024).toFixed(1)} KB)`);
    return { success: true, countryCode };
  } catch (error) {
    console.error(`✗ ${countryCode} failed: ${error.message}`);
    return { success: false, countryCode, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('RefurbRadar Feed Fetcher\n');
  console.log(`Target directory: ${DATA_DIR}\n`);
  
  // Create data directory if it doesn't exist
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
    console.log('Created data directory\n');
  }
  
  console.log(`Fetching feeds for ${COUNTRIES.length} countries...\n`);
  
  const results = [];
  
  // Fetch feeds sequentially to avoid overwhelming the server
  for (const countryCode of COUNTRIES) {
    const result = await fetchFeed(countryCode);
    results.push(result);
    
    // Small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log(`\n=== Summary ===`);
  console.log(`Success: ${successCount}/${COUNTRIES.length}`);
  console.log(`Failed: ${failCount}/${COUNTRIES.length}`);
  
  if (failCount > 0) {
    const failed = results.filter(r => !r.success);
    console.log(`\nFailed countries:`);
    failed.forEach(r => console.log(`  - ${r.countryCode}: ${r.error}`));
  }
  
  // Check minimum requirements
  const minimumOk = MINIMUM_COUNTRIES.every(code => 
    results.find(r => r.countryCode === code && r.success)
  );
  
  if (!minimumOk) {
    console.log(`\n⚠ Warning: Some minimum required countries failed!`);
    process.exit(1);
  }
  
  console.log(`\n✓ Done! Feeds saved to public/data/`);
}

// Run
main().catch(error => {
  console.error('\nFatal error:', error);
  process.exit(1);
});

