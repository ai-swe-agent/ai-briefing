import { pool } from '../index.js';

export async function up(): Promise<void> {
  await pool.query(`
    CREATE TYPE article_source AS ENUM ('reddit', 'hackernews', 'medium', 'provider_blog');
    
    CREATE TABLE IF NOT EXISTS articles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(500) NOT NULL,
      url VARCHAR(2000) NOT NULL UNIQUE,
      source article_source NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      published_at TIMESTAMP WITH TIME ZONE NOT NULL,
      crawled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX idx_articles_source ON articles(source);
    CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
    CREATE INDEX idx_articles_title_content ON articles USING gin(to_tsvector('english', title || ' ' || content));
  `);
}

export async function down(): Promise<void> {
  await pool.query(`
    DROP TABLE IF EXISTS articles;
    DROP TYPE IF EXISTS article_source;
  `);
}
