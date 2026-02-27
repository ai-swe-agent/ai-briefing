-- Migration: Create crawls table for tracking news crawl jobs
-- Created: 2026-02-27

CREATE TABLE IF NOT EXISTS crawls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  source VARCHAR(50) NOT NULL DEFAULT 'all',
  articles_count INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Index for querying recent crawls
CREATE INDEX IF NOT EXISTS idx_crawls_created_at ON crawls(created_at DESC);

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS idx_crawls_status ON crawls(status);
