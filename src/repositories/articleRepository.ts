import { query } from '../db/index.js';
import type { Article, ArticleSource, PaginatedResponse } from '../types/index.js';

export interface ArticleFilters {
  category?: string;
  source?: ArticleSource;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
}

interface ArticleRow {
  id: string;
  title: string;
  url: string;
  source: ArticleSource;
  content: string;
  summary: string | null;
  published_at: Date;
  crawled_at: Date;
}

function rowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    source: row.source,
    content: row.content,
    summary: row.summary ?? undefined,
    publishedAt: row.published_at,
    crawledAt: row.crawled_at,
  };
}

export async function findAll(
  filters: ArticleFilters = {},
  pagination: PaginationOptions = { page: 1, pageSize: 20 }
): Promise<PaginatedResponse<Article>> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.source) {
    conditions.push(`source = $${paramIndex++}`);
    params.push(filters.source);
  }

  if (filters.category) {
    conditions.push(`category = $${paramIndex++}`);
    params.push(filters.category);
  }

  if (filters.startDate) {
    conditions.push(`published_at >= $${paramIndex++}`);
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push(`published_at <= $${paramIndex++}`);
    params.push(filters.endDate);
  }

  if (filters.search) {
    conditions.push(
      `(to_tsvector('english', title) @@ plainto_tsquery('english', $${paramIndex}) OR ` +
      `to_tsvector('english', COALESCE(summary, '')) @@ plainto_tsquery('english', $${paramIndex}) OR ` +
      `to_tsvector('english', content) @@ plainto_tsquery('english', $${paramIndex++}))`
    );
    params.push(filters.search);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM articles ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (pagination.page - 1) * pagination.pageSize;
  const limit = pagination.pageSize;

  let orderClause = 'ORDER BY published_at DESC';
  if (filters.search) {
    orderClause = `ORDER BY ts_rank(to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || content), plainto_tsquery('english', $${paramIndex})) DESC, published_at DESC`;
    params.push(filters.search);
    paramIndex++;
  }

  const dataResult = await query<ArticleRow>(
    `SELECT id, title, url, source, content, summary, published_at, crawled_at 
     FROM articles ${whereClause} 
     ${orderClause}
     LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
    [...params, limit, offset]
  );

  return {
    items: dataResult.rows.map(rowToArticle),
    total,
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalPages: Math.ceil(total / pagination.pageSize),
  };
}

export async function findById(id: string): Promise<Article | null> {
  const result = await query<ArticleRow>(
    'SELECT id, title, url, source, content, summary, published_at, crawled_at FROM articles WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return rowToArticle(result.rows[0]);
}
