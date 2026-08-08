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
      <label className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
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
          className="w-full rounded-2xl border border-white/70 bg-white/70 py-3 pl-11 pr-4 text-sm text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.75),0_12px_30px_rgba(43,69,101,0.08)] outline-none backdrop-blur-xl transition duration-200 placeholder:text-slate-400 focus:border-blue-300 focus:bg-white/85 focus:ring-4 focus:ring-blue-100/70 dark:border-white/10 dark:bg-slate-900/45 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-sky-400/50 dark:focus:bg-slate-900/65 dark:focus:ring-sky-400/10"
        />
      </div>
    </div>
  );
}
