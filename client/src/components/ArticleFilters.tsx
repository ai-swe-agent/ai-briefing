import { useState, useEffect, useCallback } from 'react';
import type { ArticleFilters as FiltersType, ArticleSource } from '../types';

interface ArticleFiltersProps {
  onFilterChange: (filters: Partial<FiltersType>) => void;
  initialFilters?: Partial<FiltersType>;
}

const SOURCES: { value: ArticleSource | ''; label: string }[] = [
  { value: '', label: 'All Sources' },
  { value: 'hackernews', label: 'Hacker News' },
  { value: 'reddit', label: 'Reddit' },
  { value: 'medium', label: 'Medium' },
  { value: 'provider_blog', label: 'Provider Blogs' }
];

export default function ArticleFilters({ onFilterChange, initialFilters = {} }: ArticleFiltersProps) {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState<ArticleSource | ''>(initialFilters.category || '');
  const [startDate, setStartDate] = useState(initialFilters.startDate || '');
  const [endDate, setEndDate] = useState(initialFilters.endDate || '');
  const [sort, setSort] = useState<'asc' | 'desc'>(initialFilters.sort || 'desc');
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    onFilterChange({
      search: debouncedSearch || undefined,
      category: category || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      sort
    });
  }, [debouncedSearch, category, startDate, endDate, sort, onFilterChange]);

  const handleClear = useCallback(() => {
    setSearch('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setSort('desc');
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="sr-only">Search</label>
          <input
            id="search"
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="min-w-[150px]">
          <label htmlFor="category" className="sr-only">Category</label>
          <select
            id="category"
            aria-label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ArticleSource | '')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[140px]">
          <label htmlFor="startDate" className="sr-only">Start date</label>
          <input
            id="startDate"
            type="date"
            aria-label="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="min-w-[140px]">
          <label htmlFor="endDate" className="sr-only">End date</label>
          <input
            id="endDate"
            type="date"
            aria-label="End date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="min-w-[120px]">
          <label htmlFor="sort" className="sr-only">Sort order</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'asc' | 'desc')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
