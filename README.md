# RefurbRadar

A radar-style Apple refurbished product browser built with React, TypeScript, and Vite. RefurbRadar fetches refurbished products from RSS feeds, normalizes them into structured data, and provides fast client-side filtering, categorization, and sorting across multiple countries.

## Features

- 🌍 **Multi-Country Support** - Browse refurbished products from 25+ countries
- 🗺️ **IP Auto-Detection** - Automatically selects your country on first visit
- 📡 **Feed Management** - Build-time feed fetching to avoid CORS issues
- 🔍 **Real-time Filtering** - Filter by category and search
- 📊 **Multiple Sorting Options** - Sort by newest, price low→high, price high→low
- 🎨 **Modern, Responsive UI** - Built with Tailwind CSS
- ⚡ **Fast Client-Side Processing** - No backend needed
- 📱 **Mobile-Friendly** - Optimized for all screen sizes
- 🖼️ **Image Caching** - Smart image loading to reduce duplicate requests
- 💾 **Local Storage** - Caches feed data and remembers country preference

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Browser Fetch API** - Local feed fetching
- **DOMParser** - RSS/Atom XML parsing

## Architecture

### Data Flow

1. **Feed Fetching (Build-Time)** (`scripts/fetchFeeds.mjs`)

   - Downloads RSS feeds for all countries from `refurb-tracker.com`
   - Saves feeds to `public/data/{code}_in_all.xml`
   - Runs as a Node.js script before build/deploy

2. **Country Selection** (`src/hooks/useCountry.ts`)

   - Checks localStorage for saved preference
   - Falls back to IP geolocation (first visit only)
   - Maps ISO country codes to feed codes
   - Defaults to New Zealand (NZ) if detection fails

3. **Feed Loading** (`src/hooks/useFeed.ts`)

   - Fetches feed from same-origin `/data/{code}_in_all.xml`
   - Avoids CORS by using local files
   - Parses and normalizes products

4. **Product Normalization** (`src/api/normalizeProduct.ts`)

   - Converts RSS items into structured `Product` objects
   - Extracts price, image, SKU, specs from HTML description
   - Detects category, chip, RAM, storage, network from text

5. **Frontend Processing** (`src/pages/Home.tsx`)
   - Loads products based on selected country
   - Applies filters and sorting in real-time using `useMemo`
   - Updates UI when country changes

### CORS Strategy

**Why build-time fetching?**

RefurbRadar uses a build-time feed fetching strategy instead of runtime fetching for several reasons:

1. **CORS Restrictions**: The `refurb-tracker.com` RSS feeds don't allow cross-origin requests from browsers
2. **Reliability**: Build-time fetching ensures feeds are available even if the source is temporarily down
3. **Performance**: Local files load faster than external requests
4. **Offline Capability**: Once downloaded, feeds work offline

**How it works:**

1. Run `npm run fetch:feeds` to download feeds
2. Feeds are saved to `public/data/{country_code}_in_all.xml`
3. The app fetches from same-origin (`/data/{code}_in_all.xml`)
4. No CORS issues since files are on the same domain

### IP Geolocation

**How IP detection works:**

1. On first visit (no localStorage), the app attempts IP geolocation
2. Uses free public APIs:
   - Primary: `ipapi.co/json` (no API key required)
   - Fallback: `ipinfo.io/json` (no API key required)
3. Maps returned ISO country codes (e.g., `US`, `GB`) to feed codes (e.g., `us`, `uk`)
4. Saves detected country to localStorage for future visits
5. Falls back to New Zealand (`nz`) if detection fails

**ISO to Feed Code Mapping:**

- `AU` → `au` (Australia)
- `BE` → `be` (Belgique - default for Belgium)
- `CA` → `ca` (Canada English - default for Canada)
- `CN` → `cn` (China)
- `DE` → `de` (Deutschland)
- `ES` → `es` (España)
- `FR` → `fr` (France)
- `HK` → `hk` (Hong-Kong English - default for Hong Kong)
- `IE` → `ie` (Ireland)
- `IT` → `it` (Italia)
- `JP` → `jp` (Japan)
- `NL` → `nl` (Nederland)
- `NZ` → `nz` (New Zealand)
- `AT` → `at` (Österreich)
- `PL` → `pl` (Polska)
- `SG` → `sg` (Singapore)
- `KR` → `kr` (South Korea)
- `CH` → `ch` (Suisse - default for Switzerland)
- `TW` → `tw` (Taiwan)
- `GB` → `uk` (United Kingdom)
- `US` → `us` (United States)

### Adding New Countries

To add support for a new country:

1. **Add to country list** (`src/config/countries.ts`):

   ```typescript
   export const COUNTRIES: Country[] = [
     // ... existing countries
     { code: "xx", label: "New Country Name" },
   ];
   ```

2. **Add ISO mapping** (if needed, in `src/config/countries.ts`):

   ```typescript
   const ISO_TO_FEED_CODE: Record<string, string> = {
     // ... existing mappings
     XX: "xx", // New Country
   };
   ```

3. **Update TypeScript types** (`src/types/product.ts`):

   ```typescript
   export type Country = "au" | "bx" | ... | "xx";
   ```

4. **Add to fetch script** (`scripts/fetchFeeds.mjs`):

   ```javascript
   const COUNTRIES = [
     // ... existing codes
     "xx",
   ];
   ```

5. **Run fetch script**:

   ```bash
   npm run fetch:feeds
   ```

6. **Test**: Verify the feed file exists at `public/data/xx_in_all.xml`

### Folder Structure

```
src/
  api/                    # RSS feed handling
    fetchFeed.ts         # (Legacy - not used in new architecture)
    parseFeed.ts         # Parse RSS/Atom XML
    normalizeProduct.ts  # Convert RSS items to Product objects
  components/            # React components
    CategoryFilter.tsx
    CountrySelect.tsx    # Country dropdown selector
    Header.tsx           # App header with country selector
    ProductCard.tsx      # Individual product card
    ProductGrid.tsx      # Grid of product cards
    SpecFilters.tsx      # Search and filter inputs
    States.tsx           # Loading/Error/Empty states
  config/
    countries.ts         # Country list and mappings
  hooks/
    useCountry.ts        # Country selection with IP detection
    useFeed.ts           # Load feed for selected country
    useImageCache.ts     # Image loading optimization
  pages/
    Home.tsx             # Main page component
  types/
    product.ts           # TypeScript type definitions
  utils/
    cache.ts             # Feed caching utilities
    category.ts          # Category detection
    format.ts            # Formatting helpers
    html.ts              # HTML parsing utilities
    regex.ts             # Regex extraction utilities
scripts/
  fetchFeeds.mjs        # Build-time feed downloader
public/
  data/                 # Feed XML files (generated)
    {code}_in_all.xml
```

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd RefurbRadar-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. **Download feeds** (required before running):

   ```bash
   npm run fetch:feeds
   ```

   This downloads RSS feeds for all countries to `public/data/`. The script will:

   - Create the `public/data/` directory if it doesn't exist
   - Download feeds sequentially (to be respectful to the server)
   - Save each feed as `{country_code}_in_all.xml`
   - Show progress and summary

   **Note**: This step must be completed before running the dev server, otherwise feeds won't be available.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser:
   ```
   http://localhost:5173
   ```

### Development Workflow

1. **Before starting development**: Always run `npm run fetch:feeds` to ensure feeds are up-to-date
2. **During development**: Make code changes, hot reload will handle the rest
3. **Testing country changes**: Change country in the dropdown to test different feeds
4. **Checking feeds**: Verify feed files exist in `public/data/` directory

### Build for Production

1. **Download/update feeds**:

   ```bash
   npm run fetch:feeds
   ```

2. **Build the app**:

   ```bash
   npm run build
   ```

3. **Preview production build**:

   ```bash
   npm run preview
   ```

4. **Deploy**: The `dist/` folder contains the production build. Include the `public/data/` folder in your deployment.

## Available Scripts

- `npm run fetch:feeds` - Download all country feeds to `public/data/`
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Supported Countries

RefurbRadar supports the following countries (25 total):

1. Australia (`au`)
2. België (`bx`)
3. Belgique (`be`)
4. Canada (English) (`ca`)
5. Canada (Français) (`xf`)
6. 中国 / China (`cn`)
7. Deutschland (`de`)
8. España (`es`)
9. France (`fr`)
10. Hong-Kong (English) (`hk`)
11. Hong-Kong (汉语) (`hz`)
12. Ireland (`ie`)
13. Italia (`it`)
14. 日本 / Japan (`jp`)
15. Nederland (`nl`)
16. New Zealand (`nz`) - Default
17. Österreich (`at`)
18. Polska (`pl`)
19. Singapore (`sg`)
20. 한국 / South Korea (`kr`)
21. Schweiz (`cx`)
22. Suisse (`ch`)
23. 台灣 / Taiwan (`tw`)
24. United Kingdom (`uk`)
25. United States (`us`)

## Troubleshooting

### Feed file not found

**Error**: `Feed file not found for {country}. Please run "npm run fetch:feeds"`

**Solution**: Run `npm run fetch:feeds` to download the feed files.

### IP geolocation not working

**Issue**: App always defaults to New Zealand

**Solution**:

- Check browser console for geolocation errors
- Geolocation requires internet connection
- If geolocation fails, manually select your country from the dropdown
- Selected country is saved in localStorage for future visits

### Build fails

**Error**: TypeScript compilation errors

**Solution**:

- Ensure all country codes are added to `Country` type in `src/types/product.ts`
- Check that feed codes match exactly (case-sensitive)

### CORS errors

**Issue**: Seeing CORS errors in console

**Solution**:

- Make sure you're fetching from local files (`/data/{code}_in_all.xml`), not external URLs
- Verify feeds were downloaded to `public/data/`
- Check that you're not trying to fetch from `refurb-tracker.com` directly

## License

MIT
