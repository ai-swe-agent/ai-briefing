import type { ArticleSource } from './index.js';

export interface ArticleFilterQuery {
  source?: ArticleSource;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'publishedAt' | 'crawledAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ArticleSearchQuery {
  q: string;
  page?: number;
  pageSize?: number;
}

export interface ArticleRow {
  id: string;
  title: string;
  url: string;
  source: string;
  content: string;
  summary: string | null;
  published_at: string;
  crawled_at: string;
}
