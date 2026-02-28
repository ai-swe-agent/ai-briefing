interface CategoryFilterProps {
  value: string;
  onChange: (value: string) => void;
  categories: string[];
}

export function CategoryFilter({ value, onChange, categories }: CategoryFilterProps) {
  return (
    <div>
      <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
        Category
      </label>
      <select
        id="category-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
      >
        <option value="">All Categories</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  );
}
