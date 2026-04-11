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
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
        Search
      </label>
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="m21 21-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0Z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search products, chips, storage..."
          className="w-full rounded-2xl border border-white/70 bg-white/85 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-[0_12px_24px_rgba(15,23,42,0.06)] outline-none transition duration-200 placeholder:text-slate-400 focus:border-teal-300 focus:ring-4 focus:ring-teal-100"
        />
      </div>
    </div>
  );
}
