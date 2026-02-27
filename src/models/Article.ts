import { query } from '../db/index.js';
import type { Article, ArticleQueryParams, ArticleSource, PaginatedResponse } from '../types/index.js';

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

function mapRowToArticle(row: ArticleRow): Article {
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

export async function findArticles(
  params: ArticleQueryParams
): Promise<PaginatedResponse<Article>> {
  const {
    search,
    source,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 10,
  } = params;

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;


  if (search) {
    conditions.push(
      `(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`
    );
    values.push(`%${search}%`);
    paramIndex++;
  }


  if (source) {
    const sources = Array.isArray(source) ? source : [source];
    const placeholders = sources.map((_, i) => `$${paramIndex + i}`).join(', ');
    conditions.push(`source IN (${placeholders})`);
    values.push(...sources);
    paramIndex += sources.length;
  }


  if (dateFrom) {
    conditions.push(`published_at >= $${paramIndex}`);
    values.push(dateFrom);
    paramIndex++;
  }

  if (dateTo) {
    conditions.push(`published_at <= $${paramIndex}`);
    values.push(dateTo);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';


  const countQuery = `SELECT COUNT(*) as total FROM articles ${whereClause}`;
  const countResult = await query<{ total: string }>(countQuery, values);
  const total = parseInt(countResult.rows[0]?.total ?? '0', 10);


  const offset = (page - 1) * pageSize;
  const totalPages = Math.ceil(total / pageSize);


  const articlesQuery = `
    SELECT id, title, url, source, content, summary, published_at, crawled_at
    FROM articles
    ${whereClause}
    ORDER BY published_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  
  const articlesResult = await query<ArticleRow>(articlesQuery, [...values, pageSize, offset]);
  const items = articlesResult.rows.map(mapRowToArticle);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function findArticleById(id: string): Promise<Article | null> {
  const result = await query<ArticleRow>(
    `SELECT id, title, url, source, content, summary, published_at, crawled_at
     FROM articles WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToArticle(result.rows[0]);
}

export async function getArticleSources(): Promise<ArticleSource[]> {
  const result = await query<{ source: ArticleSource }>(
    'SELECT DISTINCT source FROM articles ORDER BY source'
  );
  return result.rows.map(row => row.source);
}

export default { findArticles, findArticleById, getArticleSources };
