import type { ArticleSource } from '../types';

interface FilterPanelProps {
  sources: ArticleSource[];
  onSourcesChange: (sources: ArticleSource[]) => void;
  dateFrom: string;
  onDateFromChange: (date: string) => void;
  dateTo: string;
  onDateToChange: (date: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

const SOURCE_OPTIONS: { value: ArticleSource; label: string }[] = [
  { value: 'reddit', label: 'Reddit' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'medium', label: 'Medium' },
  { value: 'provider_blog', label: 'Provider Blog' },
];

export function FilterPanel({
  sources,
  onSourcesChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  onClearFilters,
  hasActiveFilters,
}: FilterPanelProps) {
  const handleSourceToggle = (source: ArticleSource) => {
    if (sources.includes(source)) {
      onSourcesChange(sources.filter(s => s !== source));
    } else {
      onSourcesChange([...sources, source]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sources
          </label>
          <div className="flex flex-wrap gap-2">
            {SOURCE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleSourceToggle(value)}
                className={`
                  px-3 py-1.5 text-sm rounded-full font-medium
                  transition-colors duration-150
                  ${sources.includes(value)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <input
              type="date"
              id="dateFrom"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              className="block w-full px-3 py-1.5 border border-gray-300 rounded-md 
                         text-sm focus:outline-none focus:ring-1 
                         focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <input
              type="date"
              id="dateTo"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              className="block w-full px-3 py-1.5 border border-gray-300 rounded-md 
                         text-sm focus:outline-none focus:ring-1 
                         focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-1.5 text-sm font-medium text-gray-600 
                       hover:text-gray-900 hover:bg-gray-100 
                       rounded-md transition-colors duration-150"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
