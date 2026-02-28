import type { Article } from '../types';

interface ArticleRowProps {
  article: Article;
}

const SOURCE_LABELS: Record<string, string> = {
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  medium: 'Medium',
  provider_blog: 'Provider Blog',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ArticleRow({ article }: ArticleRowProps) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {SOURCE_LABELS[article.source] || article.source}
            </span>
            {article.category && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {article.category}
              </span>
            )}
            <time className="text-xs text-gray-500" dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
          </div>
          
          <h2 className="text-base font-semibold text-gray-900 truncate">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              {article.title}
            </a>
          </h2>
          
          {article.summary && (
            <p className="text-gray-600 text-sm truncate mt-1">
              {article.summary}
            </p>
          )}
        </div>
        
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Read →
        </a>
      </div>
    </article>
  );
}
