import type { Article, ViewMode } from '../types';

interface ArticleCardProps {
  article: Article;
  viewMode: ViewMode;
}

const SOURCE_COLORS: Record<string, string> = {
  hackernews: 'bg-orange-100 text-orange-800',
  reddit: 'bg-red-100 text-red-800',
  medium: 'bg-green-100 text-green-800',
  provider_blog: 'bg-blue-100 text-blue-800'
};

const SOURCE_LABELS: Record<string, string> = {
  hackernews: 'Hacker News',
  reddit: 'Reddit',
  medium: 'Medium',
  provider_blog: 'Provider Blog'
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export default function ArticleCard({ article, viewMode }: ArticleCardProps) {
  const isGrid = viewMode === 'grid';

  return (
    <article
      data-testid="article-card"
      className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${
        isGrid ? 'p-4' : 'p-4 flex gap-4'
      }`}
    >
      <div className={isGrid ? '' : 'flex-1'}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded ${SOURCE_COLORS[article.source] || 'bg-gray-100 text-gray-800'}`}>
            {SOURCE_LABELS[article.source] || article.source}
          </span>
          <time className="text-xs text-gray-500" dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>

        <h2 className={`font-semibold text-gray-900 mb-2 ${isGrid ? 'text-lg line-clamp-2' : 'text-xl'}`}>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            {article.title}
          </a>
        </h2>

        <p className={`text-gray-600 ${isGrid ? 'text-sm line-clamp-3' : 'line-clamp-2'}`}>
          {article.summary || article.content.substring(0, 200) + '...'}
        </p>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Read more →
        </a>
      </div>
    </article>
  );
}
