/**
 * Core TypeScript interfaces for AI Briefing application
 */

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string | null;
  sourceUrl: string;
  publishedAt: Date | null;
  category: string | null;
  createdAt: Date;
}

export type ArticleSource = 'reddit' | 'hackernews' | 'medium' | 'provider_blog';

export interface UserPreferences {
  userId: string;
  categories: string[];
  keywords: string[];
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

export interface Crawl {
  id: string;
  startedAt: Date;
  completedAt: Date | null;
  articlesFound: number;
}
