import { ArticleCard } from './ArticleCard';
import type { Article, ViewMode } from '../types';

interface ArticlesListProps {
  articles: Article[];
  viewMode: ViewMode;
  loading: boolean;
}

function LoadingSkeleton({ viewMode }: { viewMode: ViewMode }) {
  const skeletons = Array.from({ length: 6 }, (_, i) => i);
  const isGrid = viewMode === 'grid';
  
  return (
    <div className={isGrid 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
      : 'flex flex-col gap-4'
    }>
      {skeletons.map(i => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded mt-3"></div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <svg
        className="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
      <p className="mt-1 text-sm text-gray-500">
        Try adjusting your filters or search terms.
      </p>
    </div>
  );
}

export function ArticlesList({ articles, viewMode, loading }: ArticlesListProps) {
  if (loading) {
    return <LoadingSkeleton viewMode={viewMode} />;
  }

  if (articles.length === 0) {
    return <EmptyState />;
  }

  const isGrid = viewMode === 'grid';

  return (
    <div className={isGrid 
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
      : 'flex flex-col gap-4'
    }>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} viewMode={viewMode} />
      ))}
    </div>
  );
}
