import { query } from '../db/index.js';
import type { Article, ArticleSource, PaginatedResponse } from '../types/index.js';
import type { ArticleFilterQuery, ArticleRow } from '../types/articles.js';

function mapRowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    source: row.source as ArticleSource,
    content: row.content,
    summary: row.summary ?? undefined,
    publishedAt: new Date(row.published_at),
    crawledAt: new Date(row.crawled_at),
  };
}

export async function findArticles(
  filters: ArticleFilterQuery
): Promise<PaginatedResponse<Article>> {
  const { source, fromDate, toDate, page = 1, pageSize = 20, sortBy = 'publishedAt', sortOrder = 'desc' } = filters;
  
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (source) {
    conditions.push(`source = $${paramIndex++}`);
    params.push(source);
  }

  if (fromDate) {
    conditions.push(`published_at >= $${paramIndex++}`);
    params.push(fromDate);
  }

  if (toDate) {
    conditions.push(`published_at <= $${paramIndex++}`);
    params.push(toDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  const sortColumn = sortBy === 'publishedAt' ? 'published_at' : 'crawled_at';
  const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';
  
  const offset = (page - 1) * pageSize;
  const limitedPageSize = Math.min(pageSize, 100);

  const countQuery = `SELECT COUNT(*) as total FROM articles ${whereClause}`;
  const countResult = await query<{ total: string }>(countQuery, params);
  const total = parseInt(countResult.rows[0].total, 10);

  const dataQuery = `
    SELECT id, title, url, source, content, summary, published_at, crawled_at
    FROM articles
    ${whereClause}
    ORDER BY ${sortColumn} ${sortDirection}
    LIMIT $${paramIndex++} OFFSET $${paramIndex}
  `;
  
  const dataResult = await query<ArticleRow>(dataQuery, [...params, limitedPageSize, offset]);

  return {
    items: dataResult.rows.map(mapRowToArticle),
    total,
    page,
    pageSize: limitedPageSize,
    totalPages: Math.ceil(total / limitedPageSize),
  };
}

export async function searchArticles(
  searchQuery: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Article>> {
  const offset = (page - 1) * pageSize;
  const limitedPageSize = Math.min(pageSize, 100);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM articles
    WHERE to_tsvector('english', title || ' ' || COALESCE(content, '')) @@ plainto_tsquery('english', $1)
  `;
  const countResult = await query<{ total: string }>(countQuery, [searchQuery]);
  const total = parseInt(countResult.rows[0].total, 10);

  const dataQuery = `
    SELECT id, title, url, source, content, summary, published_at, crawled_at,
           ts_rank(to_tsvector('english', title || ' ' || COALESCE(content, '')), plainto_tsquery('english', $1)) as rank
    FROM articles
    WHERE to_tsvector('english', title || ' ' || COALESCE(content, '')) @@ plainto_tsquery('english', $1)
    ORDER BY rank DESC, published_at DESC
    LIMIT $2 OFFSET $3
  `;
  
  const dataResult = await query<ArticleRow & { rank: number }>(dataQuery, [searchQuery, limitedPageSize, offset]);

  return {
    items: dataResult.rows.map(mapRowToArticle),
    total,
    page,
    pageSize: limitedPageSize,
    totalPages: Math.ceil(total / limitedPageSize),
  };
}

export async function findArticleById(id: string): Promise<Article | null> {
  const result = await query<ArticleRow>(
    `SELECT id, title, url, source, content, summary, published_at, crawled_at
     FROM articles
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToArticle(result.rows[0]);
}

export async function getAvailableSources(): Promise<ArticleSource[]> {
  const result = await query<{ source: string }>(
    `SELECT DISTINCT source FROM articles ORDER BY source`
  );
  return result.rows.map(row => row.source as ArticleSource);
}

export default {
  findArticles,
  searchArticles,
  findArticleById,
  getAvailableSources,
};
