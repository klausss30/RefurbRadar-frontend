import type { Category } from '../types/product';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: Set<Category>;
  onToggle: (category: Category) => void;
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
}: CategoryFilterProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
      <div className="space-y-2">
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

