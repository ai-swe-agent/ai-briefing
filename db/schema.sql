-- AI Briefing Database Schema
-- PostgreSQL 13+ required for gen_random_uuid()

-- Drop tables in reverse dependency order for clean re-application
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS crawls CASCADE;
DROP TABLE IF EXISTS news_articles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop trigger function if exists
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- =============================================================================
-- TRIGGER FUNCTION: Auto-update updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TABLE: users
-- Stores registered user accounts
-- =============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for email lookups (login, registration check)
CREATE INDEX idx_users_email ON users(email);

-- Auto-update trigger for updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: news_articles
-- Stores crawled news articles from various sources
-- =============================================================================
CREATE TABLE news_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    source_url TEXT NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for chronological queries (latest articles)
CREATE INDEX idx_news_articles_published_at ON news_articles(published_at DESC);

-- Index for category filtering
CREATE INDEX idx_news_articles_category ON news_articles(category);

-- Composite index for category + date queries
CREATE INDEX idx_news_articles_category_published ON news_articles(category, published_at DESC);

-- =============================================================================
-- TABLE: user_preferences
-- Stores user content preferences (1:1 relationship with users)
-- =============================================================================
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    categories TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index on user_id (primary key already indexed, but explicit for clarity)
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

-- Auto-update trigger for updated_at
CREATE TRIGGER trigger_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- TABLE: crawls
-- Tracks crawl job execution history
-- =============================================================================
CREATE TABLE crawls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    articles_found INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'running',
    error_message TEXT
);

-- Index for finding recent/active crawls
CREATE INDEX idx_crawls_started_at ON crawls(started_at DESC);

-- Index for status filtering
CREATE INDEX idx_crawls_status ON crawls(status);

-- =============================================================================
-- COMMENTS: Table documentation
-- =============================================================================
COMMENT ON TABLE users IS 'Registered user accounts for the AI Briefing platform';
COMMENT ON TABLE news_articles IS 'Crawled news articles from Reddit, HN, Medium, and provider blogs';
COMMENT ON TABLE user_preferences IS 'User content preferences including categories and keywords to follow';
COMMENT ON TABLE crawls IS 'Crawl job execution history for monitoring and debugging';

COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password';
COMMENT ON COLUMN news_articles.category IS 'Article category: ai, ml, llm, robotics, etc.';
COMMENT ON COLUMN user_preferences.categories IS 'Array of category names user wants to follow';
COMMENT ON COLUMN user_preferences.keywords IS 'Array of keywords for personalized article matching';
COMMENT ON COLUMN crawls.status IS 'Crawl status: running, completed, failed';
