import type { Article, ViewMode } from '../types';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  viewMode: ViewMode;
}

export default function ArticleList({ articles, viewMode }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="text-center py-12" data-testid="empty-state">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your filters or search term.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid={viewMode === 'grid' ? 'article-grid' : 'article-list'}
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-4'
      }
    >
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} viewMode={viewMode} />
      ))}
    </div>
  );
}
