# RefurbRadar

A radar-style Apple refurbished product browser built with React, TypeScript, and Vite. RefurbRadar fetches refurbished products from RSS feeds, normalizes them into structured data, and provides fast client-side filtering, categorization, and sorting.

## Features

- 📡 Fetches products from RSS feed (currently NZ feed)
- 🔍 Real-time filtering by category, price, chip, RAM, storage, network, and search
- 📊 Multiple sorting options (newest, price low→high, price high→low)
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Fast client-side filtering and sorting (no backend needed)
- 📱 Mobile-friendly design with collapsible filters

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Browser Fetch API** - RSS feed fetching
- **DOMParser** - RSS XML parsing

## Architecture

### Data Flow

1. **Feed Fetching** (`src/api/fetchFeed.ts`)
   - Fetches RSS XML from `https://refurb-tracker.com/feeds/nz_in_all.xml`
   - Returns raw XML string

2. **Feed Parsing** (`src/api/parseFeed.ts`)
   - Uses browser `DOMParser` to parse RSS XML
   - Extracts `<item>` elements from RSS feed
   - Extracts title, description, link, and pubDate from each item

3. **Product Normalization** (`src/api/normalizeProduct.ts`)
   - Converts RSS items into structured `Product` objects
   - Extracts price, image, SKU from HTML description
   - Detects category, chip, RAM, storage, network from text
   - Creates stable IDs using hash function

4. **Frontend Processing** (`src/pages/Home.tsx`)
   - Loads products once on mount
   - Caches products in React state
   - Applies filters and sorting in real-time using `useMemo`

### Folder Structure

```
src/
  api/                    # RSS feed handling
    fetchFeed.ts         # Fetch RSS feed from URL
    parseFeed.ts         # Parse RSS XML to DOM elements
    normalizeProduct.ts  # Convert RSS items to Product objects
    
  components/            # React components
    Header.tsx          # App header
    CategoryFilter.tsx  # Category checkbox filter
    SpecFilters.tsx     # Price, chip, RAM, storage, network filters
    ProductCard.tsx     # Individual product card
    ProductGrid.tsx     # Grid layout for products
    States.tsx          # Loading, error, empty states
    
  pages/
    Home.tsx           # Main page with filtering/sorting logic
    
  types/
    product.ts         # Product interface and type definitions
    
  utils/               # Utility functions
    html.ts           # HTML parsing utilities
    regex.ts          # Text extraction (price, chip, RAM, etc.)
    format.ts         # Formatting (price, dates, hashing)
    category.ts       # Category detection and title cleaning
```

### Data Model

The `Product` interface (`src/types/product.ts`) represents a normalized product:

```typescript
interface Product {
  id: string;              // Stable hash ID
  country: "NZ";
  rawTitle: string;        // Original RSS title
  title: string;           // Cleaned display title
  category: Category;      // Detected category (iPad, iPhone, etc.)
  price: number;           // Extracted price in NZD
  currency: "NZD";
  publishedAt: string;     // ISO date string
  link: string;            // Apple Store product link
  imageUrl?: string;       // Product image URL
  sku?: string;            // Product SKU
  
  // Parsed specs
  chip?: string;           // M1/M2/M3/M4, S8/S9/S10, A15/A16/A17
  ramGB?: number;
  storageGB?: number;
  sizeInch?: number;
  network?: "Wi-Fi" | "Cellular";
  color?: string;
  
  specsText?: string;      // Plain text specs summary
}
```

### Parsing Rules

- **Price**: Extracted using regex `/\$([\d,]+(\.\d{2})?)/` from description HTML
- **Image**: First `<img src>` from description HTML
- **SKU**: Pattern `/[A-Z0-9]{5,}\/[A-Z]/` from title
- **Category**: Case-insensitive matching from title (iPad, iPhone, MacBook Air, etc.)
- **Chip**: Regex `/(M[1-4]|S(8|9|10)|A1[5-7])/i`
- **RAM**: Regex `/(\d+)\s*GB\s*RAM/i`
- **Storage**: Regex `/(\d+)\s*(GB|TB)/i` (TB converted to GB)
- **Network**: Text matching for "Cellular" or "Wi-Fi"

### Filtering & Sorting

All filtering and sorting happens client-side for instant results:

- **Category Filter**: Multi-select checkboxes
- **Price Range**: Min/max number inputs
- **Chip Filter**: Dropdown with available chips
- **RAM Filter**: Dropdown with available RAM sizes
- **Storage Filter**: Dropdown with available storage sizes
- **Network Filter**: Dropdown (Wi-Fi / Cellular)
- **Search**: Full-text search on title and specs
- **Sorting**: Newest first (default), Price low→high, Price high→low

## CORS Handling

The RSS feed from `refurb-tracker.com` doesn't allow cross-origin requests. To solve this:

- **Development**: Vite proxy is configured to forward `/api/feed` requests to the RSS feed, bypassing CORS
- **Production**: If direct fetch fails, the app automatically falls back to a CORS proxy service

To use a custom proxy in production, modify `src/api/fetchFeed.ts` or set up your own backend proxy.

## Getting Started

### Prerequisites

- Node.js 20.19.0+ or 22.12.0+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port). The Vite proxy will automatically handle CORS issues.

### Build

```bash
npm run build
```

Built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## CORS Solution Details

### Development Mode
Vite's proxy configuration (`vite.config.ts`) forwards `/api/feed` to `https://refurb-tracker.com/feeds/nz_in_all.xml`, avoiding CORS issues during development.

### Production Mode
If the direct fetch fails due to CORS, the app automatically uses a CORS proxy service (`api.allorigins.win`) as a fallback. For production deployments, consider:
- Setting up your own backend proxy
- Using a more reliable CORS proxy service
- Pre-fetching the feed at build time (for static deployments)

## Future Extensions

The architecture is designed for extensibility:

- **Country Auto-Detection**: IP-based country detection API
- **Country Switcher**: UI to switch between NZ / AU / US / UK feeds
- **Custom CORS Proxy**: Set up dedicated backend proxy for production
- **PWA Support**: Service worker for offline access
- **URL State**: Persist filters in URL query parameters

## License

MIT
