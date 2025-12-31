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
          onClick={toggleCollapse}
          className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 mb-3 hover:text-gray-700 focus:outline-none"
          aria-expanded={!isCollapsed}
        >
          <span>
            Category
            {selectedCount > 0 && (
              <span className="ml-2 text-xs font-normal text-blue-600">
                ({selectedCount})
              </span>
            )}
          </span>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isCollapsed ? '' : 'transform rotate-180'
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
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
      )}
      
      <div
        className={`space-y-2 transition-all duration-200 ease-in-out ${
          collapsible && isCollapsed ? 'hidden' : 'block'
        }`}
      >
        {categories.map((category) => (
          <label
            key={category}
            className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
          >
            <input
              type="checkbox"
              checked={selectedCategories.has(category)}
              onChange={() => onToggle(category)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              {CATEGORY_LABELS[category]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

