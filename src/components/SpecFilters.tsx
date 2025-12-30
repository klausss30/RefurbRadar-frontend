import type { Product } from '../types/product';

interface SpecFiltersProps {
  products: Product[];
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  selectedChip: string | null;
  onChipChange: (chip: string | null) => void;
  selectedRAM: number | null;
  onRAMChange: (ram: number | null) => void;
  selectedStorage: number | null;
  onStorageChange: (storage: number | null) => void;
  selectedNetwork: 'Wi-Fi' | 'Cellular' | null;
  onNetworkChange: (network: 'Wi-Fi' | 'Cellular' | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SpecFilters({
  products,
  priceRange,
  onPriceRangeChange,
  selectedChip,
  onChipChange,
  selectedRAM,
  onRAMChange,
  selectedStorage,
  onStorageChange,
  selectedNetwork,
  onNetworkChange,
  searchQuery,
  onSearchChange,
}: SpecFiltersProps) {
  // Extract unique values from products
  const chips = Array.from(new Set(products.map(p => p.chip).filter(Boolean))) as string[];
  const rams = Array.from(new Set(products.map(p => p.ramGB).filter(Boolean))) as number[];
  const storages = Array.from(new Set(products.map(p => p.storageGB).filter(Boolean))) as number[];
  const networks = Array.from(new Set(products.map(p => p.network).filter(Boolean))) as Array<'Wi-Fi' | 'Cellular'>;

  // Calculate price range from products
  const prices = products.map(p => p.price).filter(p => p > 0);
  const minPrice = Math.min(...prices, 0);
  const maxPrice = Math.max(...prices, 0);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Search
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Price Range
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={priceRange[0]}
            onChange={(e) => onPriceRangeChange([Number(e.target.value), priceRange[1]])}
            min={minPrice}
            max={maxPrice}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Min"
          />
          <span className="text-gray-500">-</span>
          <input
            type="number"
            value={priceRange[1]}
            onChange={(e) => onPriceRangeChange([priceRange[0], Number(e.target.value)])}
            min={minPrice}
            max={maxPrice}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Chip Filter */}
      {chips.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Chip
          </label>
          <select
            value={selectedChip || ''}
            onChange={(e) => onChipChange(e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {chips.sort().map((chip) => (
              <option key={chip} value={chip}>
                {chip}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* RAM Filter */}
      {rams.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            RAM
          </label>
          <select
            value={selectedRAM || ''}
            onChange={(e) => onRAMChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {rams.sort((a, b) => a - b).map((ram) => (
              <option key={ram} value={ram}>
                {ram}GB
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Storage Filter */}
      {storages.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Storage
          </label>
          <select
            value={selectedStorage || ''}
            onChange={(e) => onStorageChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {storages.sort((a, b) => a - b).map((storage) => (
              <option key={storage} value={storage}>
                {storage >= 1024 
                  ? `${(storage / 1024).toFixed(0)}TB` 
                  : `${storage}GB`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Network Filter */}
      {networks.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Network
          </label>
          <select
            value={selectedNetwork || ''}
            onChange={(e) => onNetworkChange(e.target.value ? (e.target.value as 'Wi-Fi' | 'Cellular') : null)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All</option>
            {networks.map((network) => (
              <option key={network} value={network}>
                {network}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

