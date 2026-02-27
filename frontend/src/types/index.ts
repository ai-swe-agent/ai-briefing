export type ArticleSource = 'reddit' | 'hackernews' | 'medium' | 'provider_blog';

export interface Article {
  id: string;
  title: string;
  url: string;
  source: ArticleSource;
  content: string;
  summary?: string;
  publishedAt: string;
  crawledAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ArticleFilters {
  search: string;
  sources: ArticleSource[];
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
}

export type ViewMode = 'list' | 'grid';
