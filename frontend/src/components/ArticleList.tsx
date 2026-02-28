import type { Article, ViewMode } from '../types';
import { ArticleCard } from './ArticleCard';
import { ArticleRow } from './ArticleRow';

interface ArticleListProps {
  articles: Article[];
  viewMode: ViewMode;
}

export function ArticleList({ articles, viewMode }: ArticleListProps) {
  if (viewMode === 'grid') {
    return (
      <div
        data-testid="articles-grid"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    );
  }

  return (
    <div data-testid="articles-list" className="flex flex-col gap-3 list">
      {articles.map((article) => (
        <ArticleRow key={article.id} article={article} />
      ))}
    </div>
  );
}
