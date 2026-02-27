CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    url VARCHAR(2048) NOT NULL UNIQUE,
    source VARCHAR(50) NOT NULL,
    category VARCHAR(100),
    content TEXT NOT NULL,
    summary TEXT,
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    crawled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_crawled_at ON articles(crawled_at DESC);

CREATE INDEX IF NOT EXISTS idx_articles_search ON articles 
    USING gin(to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || content));
