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
  category?: string;
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

export interface ArticleFilterParams {
  page?: number;
  pageSize?: number;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
