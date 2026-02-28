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

export type ArticleSource = 'reddit' | 'hackernews' | 'medium' | 'provider_blog';

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

/**
 * Database row interfaces - match db/schema.sql exactly
 */

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface NewsArticleRow {
  id: string;
  title: string;
  content: string;
  source_url: string;
  published_at: Date | null;
  category: string | null;
  created_at: Date;
}

export interface UserPreferencesRow {
  user_id: string;
  categories: string[];
  keywords: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CrawlRow {
  id: string;
  started_at: Date;
  completed_at: Date | null;
  articles_found: number;
  status: string;
  error_message: string | null;
}
