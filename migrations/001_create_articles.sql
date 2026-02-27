-- Migration: Create articles table for AI Briefing news dashboard
-- Created: 2026-02-27

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL CHECK (source IN ('reddit', 'hackernews', 'medium', 'provider_blog')),
    content TEXT NOT NULL,
    summary TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Full-text search vector column
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(summary, '')), 'B') ||
        setweight(to_tsvector('english', coalesce(content, '')), 'C')
    ) STORED
);

-- Indexes for filtering and performance
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_crawled_at ON articles(crawled_at DESC);

-- GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_articles_search_vector ON articles USING GIN(search_vector);

-- Combined index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_articles_source_published ON articles(source, published_at DESC);

-- Comment on table
COMMENT ON TABLE articles IS 'Stores news articles crawled from various sources for AI Briefing dashboard';
