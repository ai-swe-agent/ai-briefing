-- Migration: Create articles table with indexes for filtering and search
-- Version: 001
-- Date: 2026-02-28

-- Create enum type for article sources
DO $$ BEGIN
    CREATE TYPE article_source AS ENUM ('reddit', 'hackernews', 'medium', 'provider_blog');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    url TEXT NOT NULL UNIQUE,
    source article_source NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_crawled_at ON articles(crawled_at DESC);

-- Create GIN index for full-text search on title and content
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles 
    USING GIN (to_tsvector('english', title || ' ' || content));

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE articles IS 'News articles crawled from various sources (Reddit, HN, Medium, provider blogs)';
