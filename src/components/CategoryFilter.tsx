import { useState } from 'react';
import type { Category } from '../types/product';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: Set<Category>;
  onToggle: (category: Category) => void;
  collapsible?: boolean; // Whether to make it collapsible on mobile
  defaultCollapsed?: boolean; // Default collapsed state
}

const CATEGORY_LABELS: Record<Category, string> = {
  'iPad': 'iPad',
  'iPhone': 'iPhone',
  'MacBook Air': 'MacBook Air',
  'MacBook Pro': 'MacBook Pro',
  'iMac': 'iMac',
  'Mac Mini': 'Mac Mini',
  'Mac Studio': 'Mac Studio',
  'Mac Pro': 'Mac Pro',
  'Apple Watch': 'Apple Watch',
  'Apple TV': 'Apple TV',
  'HomePod': 'HomePod',
  'Displays': 'Displays',
  'Accessories': 'Accessories',
  'Other': 'Other',
};

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
          className="mb-4 flex w-full items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-4 py-3 text-left text-sm font-semibold text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.05)] transition hover:border-teal-200 hover:text-slate-700 focus:outline-none"
          aria-expanded={!isCollapsed}
        >
          <span className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">
              Category
            </span>
            {selectedCount > 0 && (
              <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-bold text-teal-700">
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
            Category
          </h3>
          {selectedCount > 0 && (
            <span className="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white">
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
                ? 'border-teal-500 bg-teal-500 text-white shadow-[0_12px_24px_rgba(13,148,136,0.22)]'
                : 'border-slate-200 bg-white/80 text-slate-700 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700'
            }`}
          >
            {CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>
    </div>
  );
}
