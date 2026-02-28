import type { Article } from '../types';

interface ArticleCardProps {
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

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {SOURCE_LABELS[article.source] || article.source}
          </span>
          {article.category && (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {article.category}
            </span>
          )}
        </div>
        
        <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
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
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {article.summary}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <time dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Read more →
          </a>
        </div>
      </div>
    </article>
  );
}
