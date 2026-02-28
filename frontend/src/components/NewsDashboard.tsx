import { useState, useEffect, useCallback } from 'react';
import type { ViewMode, ArticleFilterParams, ApiResponse } from '../types';
import { useArticles } from '../hooks/useArticles';
import { useDebounce } from '../hooks/useDebounce';
import { ViewToggle } from './ViewToggle';
import { SearchInput } from './SearchInput';
import { CategoryFilter } from './CategoryFilter';
import { DateFilter } from './DateFilter';
import { Pagination } from './Pagination';
import { ArticleList } from './ArticleList';
import { LoadingSkeleton } from './LoadingSkeleton';
import { EmptyState } from './EmptyState';
import { ErrorBanner } from './ErrorBanner';

const DEFAULT_PAGE_SIZE = 20;

export function NewsDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const params: ArticleFilterParams = {
    page,
    pageSize: DEFAULT_PAGE_SIZE,
    category: category || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    search: debouncedSearch || undefined,
  };

  const { articles, total, totalPages, isLoading, error, refetch } = useArticles(params);

  useEffect(() => {
    fetch('/api/articles/categories')
      .then((res) => res.json())
      .then((data: ApiResponse<string[]>) => {
        if (data.success && data.data) {
          setCategories(data.data);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, startDate, endDate]);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setCategory('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">AI News Briefing</h1>
          <p className="text-gray-600 mt-1">Latest AI news from Reddit, Hacker News, Medium & more</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="w-full lg:w-48">
              <CategoryFilter
                value={category}
                onChange={setCategory}
                categories={categories}
              />
            </div>
            <div className="w-full lg:w-auto">
              <DateFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600">
            {isLoading ? 'Loading...' : `${total} article${total !== 1 ? 's' : ''} found`}
          </p>
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {error && <ErrorBanner message={error} onRetry={refetch} />}

        {isLoading && <LoadingSkeleton />}

        {!isLoading && !error && articles.length === 0 && (
          <EmptyState onReset={handleResetFilters} />
        )}

        {!isLoading && !error && articles.length > 0 && (
          <>
            <ArticleList articles={articles} viewMode={viewMode} />
            
            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
