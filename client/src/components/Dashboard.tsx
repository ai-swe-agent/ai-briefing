import { useState, useCallback } from 'react';
import { useArticles } from '../hooks/useArticles';
import ArticleFilters from './ArticleFilters';
import ArticleList from './ArticleList';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import ErrorDisplay from './ErrorDisplay';
import ViewToggle from './ViewToggle';
import type { ArticleFilters as FiltersType, ViewMode } from '../types';

const ITEMS_PER_PAGE = 10;

export default function Dashboard() {
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<Partial<FiltersType>>({});

  const { data, isLoading, isError, error, refetch } = useArticles({
    page,
    limit: ITEMS_PER_PAGE,
    ...filters
  });

  const handleFilterChange = useCallback((newFilters: Partial<FiltersType>) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Briefing</h1>
              <p className="mt-1 text-sm text-gray-500">
                Your daily digest of AI news from across the web
              </p>
            </div>
            <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ArticleFilters onFilterChange={handleFilterChange} initialFilters={filters} />

        {isLoading && <LoadingSpinner />}

        {isError && (
          <ErrorDisplay
            message={error instanceof Error ? error.message : 'An unexpected error occurred'}
            onRetry={() => refetch()}
          />
        )}

        {data && !isLoading && !isError && (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-500">
                Showing {data.items.length} of {data.total} articles
              </p>
            </div>

            <ArticleList articles={data.items} viewMode={viewMode} />

            {data.totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  totalItems={data.total}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
