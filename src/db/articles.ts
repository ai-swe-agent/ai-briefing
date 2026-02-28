import { query } from './index.js';
import type { Article, ArticleFilterParams, PaginatedResponse } from '../types/index.js';

interface ArticleRow {
  id: string;
  title: string;
  url: string;
  source: string;
  category: string | null;
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
    source: row.source as Article['source'],
    category: row.category ?? undefined,
    content: row.content,
    summary: row.summary ?? undefined,
    publishedAt: row.published_at,
    crawledAt: row.crawled_at,
  };
}

export async function getArticlesPaginated(
  params: ArticleFilterParams
): Promise<PaginatedResponse<Article>> {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (params.category) {
    conditions.push(`LOWER(category) = LOWER($${paramIndex})`);
    values.push(params.category);
    paramIndex++;
  }

  if (params.startDate) {
    conditions.push(`published_at >= $${paramIndex}`);
    values.push(params.startDate);
    paramIndex++;
  }

  if (params.endDate) {
    conditions.push(`published_at <= $${paramIndex}`);
    values.push(params.endDate);
    paramIndex++;
  }

  if (params.search) {
    conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
    values.push(`%${params.search}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countSql = `SELECT COUNT(*) as count FROM news_articles ${whereClause}`;
  const countResult = await query<{ count: string }>(countSql, values);
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  const articlesSql = `
    SELECT id, title, url, source, category, content, summary, published_at, crawled_at
    FROM news_articles
    ${whereClause}
    ORDER BY published_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  
  const articlesResult = await query<ArticleRow>(articlesSql, [...values, pageSize, offset]);
  const items = articlesResult.rows.map(mapRowToArticle);

  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getCategories(): Promise<string[]> {
  const sql = `
    SELECT DISTINCT category FROM news_articles 
    WHERE category IS NOT NULL 
    ORDER BY category
  `;
  const result = await query<{ category: string }>(sql);
  return result.rows.map(row => row.category);
}
