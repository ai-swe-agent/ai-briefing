import { query } from '../db/index.js';
import type {
  Article,
  ArticleListQuery,
  ArticleStats,
  PaginatedResponse,
} from '../types/index.js';

interface ArticleRow {
  id: string;
  title: string;
  url: string;
  source: string;
  content: string;
  summary: string | null;
  published_at: Date;
  crawled_at: Date;
}

interface CountRow {
  count: string;
}

interface StatsRow {
  source: string;
  count: string;
  latest_published_at: Date | null;
}

function mapRowToArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    source: row.source as Article['source'],
    content: row.content,
    summary: row.summary ?? undefined,
    publishedAt: row.published_at,
    crawledAt: row.crawled_at,
  };
}

export async function findAll(
  queryParams: ArticleListQuery
): Promise<PaginatedResponse<Article>> {
  const {
    source,
    dateFrom,
    dateTo,
    search,
    page = 1,
    pageSize = 20,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
  } = queryParams;

  const effectivePageSize = Math.min(Math.max(1, pageSize), 100);
  const effectivePage = Math.max(1, page);
  const offset = (effectivePage - 1) * effectivePageSize;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (source) {
    conditions.push(`source = $${paramIndex}`);
    params.push(source);
    paramIndex++;
  }

  if (dateFrom) {
    conditions.push(`published_at >= $${paramIndex}`);
    params.push(dateFrom);
    paramIndex++;
  }

  if (dateTo) {
    conditions.push(`published_at <= $${paramIndex}`);
    params.push(dateTo);
    paramIndex++;
  }

  if (search) {
    conditions.push(`search_vector @@ plainto_tsquery('english', $${paramIndex})`);
    params.push(search);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sortColumn = sortBy === 'crawledAt' ? 'crawled_at' : 'published_at';
  const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

  const countQuery = `SELECT COUNT(*) as count FROM articles ${whereClause}`;
  const countResult = await query<CountRow>(countQuery, params);
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  const dataQuery = `
    SELECT id, title, url, source, content, summary, published_at, crawled_at
    FROM articles
    ${whereClause}
    ORDER BY ${sortColumn} ${sortDirection}
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  const dataResult = await query<ArticleRow>(dataQuery, [...params, effectivePageSize, offset]);

  const items = dataResult.rows.map(mapRowToArticle);
  const totalPages = Math.ceil(total / effectivePageSize);

  return {
    items,
    total,
    page: effectivePage,
    pageSize: effectivePageSize,
    totalPages,
  };
}

export async function findById(id: string): Promise<Article | null> {
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

export async function getSourceStats(): Promise<ArticleStats[]> {
  const result = await query<StatsRow>(
    `SELECT 
       source,
       COUNT(*) as count,
       MAX(published_at) as latest_published_at
     FROM articles
     GROUP BY source
     ORDER BY count DESC`
  );

  return result.rows.map((row) => ({
    source: row.source as ArticleStats['source'],
    count: parseInt(row.count, 10),
    latestPublishedAt: row.latest_published_at,
  }));
}

export default { findAll, findById, getSourceStats };
