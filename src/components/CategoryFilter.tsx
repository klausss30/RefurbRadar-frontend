import { useState } from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: Set<string>;
  onToggle: (category: string) => void;
  collapsible?: boolean; // Whether to make it collapsible on mobile
  defaultCollapsed?: boolean; // Default collapsed state
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onToggle,
  collapsible = false,
  defaultCollapsed = true,
}: CategoryFilterProps) {
  const [isCollapsed, setIsCollapsed] = useState(collapsible && defaultCollapsed);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const selectedCount = selectedCategories.size;

  return (
    <div>
      {collapsible ? (
        <button
          type="button"
          onClick={toggleCollapse}
          className="mb-4 flex w-full items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-left text-sm font-semibold text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.05)] transition hover:border-blue-200 hover:text-slate-700 focus:outline-none dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-100 dark:hover:border-sky-400/30 dark:hover:bg-slate-800/60 dark:hover:text-slate-50"
          aria-expanded={!isCollapsed}
        >
          <span className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
              Model
            </span>
            {selectedCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-sky-400/15 dark:text-sky-200">
                {selectedCount} selected
              </span>
            )}
          </span>
          <svg
            className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${
              isCollapsed ? '' : 'rotate-180'
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
            Model
          </h3>
          {selectedCount > 0 && (
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white dark:bg-white/15 dark:text-slate-100">
              {selectedCount}
            </span>
          )}
        </div>
      )}

      <div
        className={`flex-wrap gap-2 transition-all duration-200 ease-in-out ${
          collapsible && isCollapsed ? 'hidden' : 'flex'
        }`}
      >
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onToggle(category)}
            aria-pressed={selectedCategories.has(category)}
            className={`rounded-full border px-3 py-2 text-sm font-semibold transition duration-200 ${
              selectedCategories.has(category)
                ? 'border-blue-500/70 bg-blue-500/90 text-white shadow-[0_10px_26px_rgba(0,122,255,0.25)] dark:border-sky-300/30 dark:bg-sky-400/20 dark:text-sky-100 dark:shadow-[0_10px_28px_rgba(0,0,0,0.28)]'
                : 'border-white/70 bg-white/55 text-slate-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl hover:border-blue-200 hover:bg-white/85 hover:text-blue-700 dark:border-white/10 dark:bg-slate-900/35 dark:text-slate-300 dark:hover:border-sky-400/30 dark:hover:bg-slate-800/70 dark:hover:text-sky-200'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}
