interface SpecFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function SpecFilters({
  searchQuery,
  onSearchChange,
}: SpecFiltersProps) {
  return (
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
  );
}

