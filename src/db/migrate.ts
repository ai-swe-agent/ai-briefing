import { pool } from './index.js';

/**
 * Database migration script for news crawling service
 * Creates the news_articles and news_sources tables
 */

const migrations = [
  {
    name: 'create_news_sources_table',
    sql: `
      CREATE TABLE IF NOT EXISTS news_sources (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        type VARCHAR(20) NOT NULL CHECK (type IN ('rss', 'html')),
        url TEXT NOT NULL,
        selectors JSONB,
        rate_limit_ms INTEGER DEFAULT 1000,
        enabled BOOLEAN DEFAULT true,
        last_crawled_at TIMESTAMP WITH TIME ZONE,
        failure_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `,
  },
  {
    name: 'create_news_articles_table',
    sql: `
      CREATE TABLE IF NOT EXISTS news_articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        url TEXT NOT NULL,
        source VARCHAR(50) NOT NULL,
        source_id INTEGER REFERENCES news_sources(id),
        content TEXT,
        summary VARCHAR(1000),
        author VARCHAR(200),
        published_at TIMESTAMP WITH TIME ZONE,
        crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        content_hash VARCHAR(64) NOT NULL,
        relevance_score DECIMAL(3,2) DEFAULT 0.00,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_article_url_source UNIQUE (url, source)
      );
    `,
  },
  {
    name: 'create_crawl_logs_table',
    sql: `
      CREATE TABLE IF NOT EXISTS crawl_logs (
        id SERIAL PRIMARY KEY,
        source_id INTEGER REFERENCES news_sources(id),
        source_name VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'partial', 'failed')),
        articles_found INTEGER DEFAULT 0,
        articles_new INTEGER DEFAULT 0,
        articles_duplicate INTEGER DEFAULT 0,
        error_message TEXT,
        duration_ms INTEGER,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE
      );
    `,
  },
  {
    name: 'create_indexes',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_articles_source ON news_articles(source);
      CREATE INDEX IF NOT EXISTS idx_articles_published_at ON news_articles(published_at DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_crawled_at ON news_articles(crawled_at DESC);
      CREATE INDEX IF NOT EXISTS idx_articles_content_hash ON news_articles(content_hash);
      CREATE INDEX IF NOT EXISTS idx_crawl_logs_source ON crawl_logs(source_id);
      CREATE INDEX IF NOT EXISTS idx_crawl_logs_started_at ON crawl_logs(started_at DESC);
    `,
  },
  {
    name: 'insert_default_news_sources',
    sql: `
      INSERT INTO news_sources (name, type, url, selectors, rate_limit_ms) VALUES
        ('hackernews', 'rss', 'https://hnrss.org/frontpage', NULL, 2000),
        ('reddit_machinelearning', 'rss', 'https://www.reddit.com/r/MachineLearning/.rss', NULL, 3000),
        ('reddit_artificial', 'rss', 'https://www.reddit.com/r/artificial/.rss', NULL, 3000),
        ('mit_ai_news', 'rss', 'https://news.mit.edu/topic/artificial-intelligence2-rss.xml', NULL, 2000),
        ('openai_blog', 'rss', 'https://openai.com/blog/rss.xml', NULL, 2000),
        ('google_ai_blog', 'rss', 'https://blog.google/technology/ai/rss/', NULL, 2000),
        ('deepmind_blog', 'html', 'https://deepmind.google/discover/blog/', '{"articleSelector": "article", "titleSelector": "h3", "linkSelector": "a"}', 3000),
        ('anthropic_news', 'html', 'https://www.anthropic.com/news', '{"articleSelector": "article", "titleSelector": "h2", "linkSelector": "a"}', 3000)
      ON CONFLICT (name) DO NOTHING;
    `,
  },
];

async function runMigrations(): Promise<void> {
  console.log('Starting database migrations...\n');

  for (const migration of migrations) {
    try {
      console.log(`Running migration: ${migration.name}`);
      await pool.query(migration.sql);
      console.log(`  ✓ ${migration.name} completed\n`);
    } catch (error) {
      console.error(`  ✗ ${migration.name} failed:`, error);
      throw error;
    }
  }

  console.log('All migrations completed successfully!');
}

async function main(): Promise<void> {
  try {
    await runMigrations();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
