export type ArticleSource = 'reddit' | 'hackernews' | 'medium' | 'provider_blog';

export interface Article {
  id: string;
  title: string;
  url: string;
  source: ArticleSource;
  category?: string;
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

export interface ArticleFilterParams {
  page?: number;
  pageSize?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export type ViewMode = 'grid' | 'list';
