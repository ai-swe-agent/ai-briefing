-- Migration: Create articles table with indexes for filtering and search
-- Run this migration against your PostgreSQL database

CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    url VARCHAR(2000) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL CHECK (source IN ('reddit', 'hackernews', 'medium', 'provider_blog')),
    content TEXT NOT NULL,
    summary TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for filtering by source
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);

-- Index for filtering by published date
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);

-- Index for combined source and date filtering
CREATE INDEX IF NOT EXISTS idx_articles_source_published ON articles(source, published_at DESC);

-- Full-text search index on title and content
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING GIN (
    to_tsvector('english', title || ' ' || COALESCE(content, ''))
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
