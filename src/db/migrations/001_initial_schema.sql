-- AI Briefing Database Schema
-- Migration: 001_initial_schema
-- Description: Creates core tables for users, news articles, user preferences, and crawls

-- Users table
-- Stores user authentication and profile information
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News articles table
-- Stores crawled news articles from various sources
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  content TEXT,
  source_url VARCHAR(2000) UNIQUE NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table
-- Stores user-specific preferences for news filtering
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  categories TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crawls table
-- Tracks news crawling job executions
CREATE TABLE IF NOT EXISTS crawls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  articles_found INTEGER DEFAULT 0
);

-- Indexes for query performance
-- Index on users.email for login lookups (unique constraint already creates index, but explicit for clarity)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index on news_articles.published_at for chronological queries
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at DESC);

-- Index on news_articles.category for filtering by category
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles(category);

-- Index on news_articles.source_url for deduplication checks
CREATE INDEX IF NOT EXISTS idx_news_articles_source_url ON news_articles(source_url);

-- Index on crawls.started_at for monitoring recent crawls
CREATE INDEX IF NOT EXISTS idx_crawls_started_at ON crawls(started_at DESC);
