-- Migration: Create articles table
-- Description: Table for storing news articles from various sources

CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL CHECK (source IN ('reddit', 'hackernews', 'medium', 'provider_blog')),
    content TEXT NOT NULL,
    summary TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_source_published_at ON articles(source, published_at DESC);

-- Full-text search index on title and content
CREATE INDEX IF NOT EXISTS idx_articles_title_search ON articles USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_articles_content_search ON articles USING gin(to_tsvector('english', content));
