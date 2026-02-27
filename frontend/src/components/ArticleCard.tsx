import type { Article, ViewMode } from '../types';

interface ArticleCardProps {
  article: Article;
  viewMode: ViewMode;
}

const SOURCE_LABELS: Record<string, string> = {
  reddit: 'Reddit',
  hackernews: 'Hacker News',
  medium: 'Medium',
  provider_blog: 'Provider Blog',
};

const SOURCE_COLORS: Record<string, string> = {
  reddit: 'bg-orange-100 text-orange-800',
  hackernews: 'bg-amber-100 text-amber-800',
  medium: 'bg-green-100 text-green-800',
  provider_blog: 'bg-blue-100 text-blue-800',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ArticleCard({ article, viewMode }: ArticleCardProps) {
  const isGrid = viewMode === 'grid';
  
  return (
    <article
      className={`
        bg-white rounded-lg shadow-sm border border-gray-200 
        hover:shadow-md transition-shadow duration-200
        ${isGrid ? 'flex flex-col h-full' : 'flex flex-row'}
      `}
    >
      <div className={`p-4 ${isGrid ? 'flex-1 flex flex-col' : 'flex-1'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`
              text-xs font-medium px-2 py-1 rounded-full
              ${SOURCE_COLORS[article.source] || 'bg-gray-100 text-gray-800'}
            `}
          >
            {SOURCE_LABELS[article.source] || article.source}
          </span>
          <time className="text-xs text-gray-500" dateTime={article.publishedAt}>
            {formatDate(article.publishedAt)}
          </time>
        </div>
        
        <h2 className={`font-semibold text-gray-900 mb-2 ${isGrid ? 'text-base line-clamp-2' : 'text-lg'}`}>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors"
          >
            {article.title}
          </a>
        </h2>
        
        <p className={`text-gray-600 text-sm ${isGrid ? 'line-clamp-3 flex-1' : 'line-clamp-2'}`}>
          {article.summary || article.content.slice(0, 200)}
        </p>
        
        <div className="mt-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Read more →
          </a>
        </div>
      </div>
    </article>
  );
}
