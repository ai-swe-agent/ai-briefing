/**
 * Core TypeScript interfaces for AI Briefing application
 */

export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Article {
  id: string;
  title: string;
  url: string;
  source: ArticleSource;
  content: string;
  summary?: string;
  publishedAt: Date;
  crawledAt: Date;
}

export type ArticleSource = 'hackernews' | 'reddit_machinelearning' | 'reddit_artificial' | 'mit_ai_news' | 'openai_blog' | 'google_ai_blog' | 'deepmind_blog' | 'anthropic_news';

export interface UserPreferences {
  id: string;
  userId: string;
  sources: ArticleSource[];
  emailDigest: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface EnvConfig {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type NewsSourceType = 'rss' | 'html';

export interface NewsSource {
  id: number;
  name: string;
  type: NewsSourceType;
  url: string;
  selectors: HtmlSelectors | null;
  rateLimitMs: number;
  enabled: boolean;
  lastCrawledAt: Date | null;
  failureCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface HtmlSelectors {
  articleSelector: string;
  titleSelector: string;
  linkSelector: string;
  summarySelector?: string;
  dateSelector?: string;
}

export interface NewsArticle {
  id: number;
  title: string;
  url: string;
  source: string;
  sourceId: number | null;
  content: string | null;
  summary: string | null;
  author: string | null;
  publishedAt: Date | null;
  crawledAt: Date;
  contentHash: string;
  relevanceScore: number;
  createdAt: Date;
}

export interface CrawlLog {
  id: number;
  sourceId: number | null;
  sourceName: string;
  status: 'success' | 'partial' | 'failed';
  articlesFound: number;
  articlesNew: number;
  articlesDuplicate: number;
  errorMessage: string | null;
  durationMs: number | null;
  startedAt: Date;
  completedAt: Date | null;
}

export interface CrawlResult {
  sourceName: string;
  status: 'success' | 'partial' | 'failed';
  articlesFound: number;
  articlesNew: number;
  articlesDuplicate: number;
  errorMessage?: string;
  durationMs: number;
}

export interface ArticleFilter {
  source?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}
