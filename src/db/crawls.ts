import { query } from './index.js';
import type { Crawl, CrawlRow, CrawlStatus, ArticleSource } from '../types/index.js';

function rowToCrawl(row: CrawlRow): Crawl {
  return {
    id: row.id,
    status: row.status,
    source: row.source as ArticleSource | 'all',
    articlesCount: row.articles_count,
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    errorMessage: row.error_message ?? undefined,
    createdAt: row.created_at,
  };
}

export async function createCrawl(source: ArticleSource | 'all' = 'all'): Promise<Crawl> {
  const result = await query<CrawlRow>(
    `INSERT INTO crawls (status, source, started_at) 
     VALUES ('running', $1, NOW()) 
     RETURNING *`,
    [source]
  );
  return rowToCrawl(result.rows[0]);
}

export async function updateCrawl(
  id: string,
  updates: {
    status?: CrawlStatus;
    articlesCount?: number;
    errorMessage?: string;
    completedAt?: Date;
  }
): Promise<Crawl | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (updates.status !== undefined) {
    setClauses.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.articlesCount !== undefined) {
    setClauses.push(`articles_count = $${paramIndex++}`);
    values.push(updates.articlesCount);
  }
  if (updates.errorMessage !== undefined) {
    setClauses.push(`error_message = $${paramIndex++}`);
    values.push(updates.errorMessage);
  }
  if (updates.completedAt !== undefined) {
    setClauses.push(`completed_at = $${paramIndex++}`);
    values.push(updates.completedAt);
  }

  if (setClauses.length === 0) {
    return null;
  }

  values.push(id);
  const result = await query<CrawlRow>(
    `UPDATE crawls SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] ? rowToCrawl(result.rows[0]) : null;
}

export async function getCrawls(limit = 20, offset = 0): Promise<Crawl[]> {
  const result = await query<CrawlRow>(
    'SELECT * FROM crawls ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return result.rows.map(rowToCrawl);
}

export async function getCrawlById(id: string): Promise<Crawl | null> {
  const result = await query<CrawlRow>(
    'SELECT * FROM crawls WHERE id = $1',
    [id]
  );
  return result.rows[0] ? rowToCrawl(result.rows[0]) : null;
}

export async function getRunningCrawl(): Promise<Crawl | null> {
  const result = await query<CrawlRow>(
    "SELECT * FROM crawls WHERE status = 'running' ORDER BY started_at DESC LIMIT 1"
  );
  return result.rows[0] ? rowToCrawl(result.rows[0]) : null;
}

export async function getCrawlsCount(): Promise<number> {
  const result = await query<{ count: string }>('SELECT COUNT(*) as count FROM crawls');
  return parseInt(result.rows[0].count, 10);
}
