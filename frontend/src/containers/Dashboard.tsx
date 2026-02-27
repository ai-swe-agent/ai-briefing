import { useState, useMemo } from 'react';
import { useArticles } from '../hooks/useArticles';
import { useDebounce } from '../hooks/useDebounce';
import { SearchInput } from '../components/SearchInput';
import { FilterPanel } from '../components/FilterPanel';
import { ArticlesList } from '../components/ArticlesList';
import { Pagination } from '../components/Pagination';
import { ViewToggle } from '../components/ViewToggle';
import type { ArticleSource, ViewMode } from '../types';

const DEBOUNCE_DELAY = 300;

export function Dashboard() {
  const [searchInput, setSearchInput] = useState('');
  const [sources, setSources] = useState<ArticleSource[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const debouncedSearch = useDebounce(searchInput, DEBOUNCE_DELAY);

  const {
    articles,
    total,
    totalPages,
    loading,
    error,
  } = useArticles({
    search: debouncedSearch,
    sources,
    dateFrom,
    dateTo,
    page,
    pageSize,
  });

  const hasActiveFilters = useMemo(() => {
    return searchInput !== '' || sources.length > 0 || dateFrom !== '' || dateTo !== '';
  }, [searchInput, sources.length, dateFrom, dateTo]);

  const handleClearFilters = () => {
    setSearchInput('');
    setSources([]);
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Briefing</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your daily digest of AI news from across the web
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-96">
              <SearchInput value={searchInput} onChange={setSearchInput} />
            </div>
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>

          <FilterPanel
            sources={sources}
            onSourcesChange={setSources}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            onClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-red-400 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <ArticlesList articles={articles} viewMode={viewMode} loading={loading} />

          {!loading && articles.length > 0 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            AI Briefing © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
