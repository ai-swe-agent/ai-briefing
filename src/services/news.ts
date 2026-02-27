import { query } from '../db/index.js';
import type { Article, ArticleSource } from '../types/index.js';

export interface NewsFilter {
  source?: ArticleSource;
  search?: string;
  sortBy?: 'publishedAt' | 'crawledAt';
  sortOrder?: 'asc' | 'desc';
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

const SORT_FIELD_MAP: Record<string, string> = {
  publishedAt: 'published_at',
  crawledAt: 'crawled_at',
};

const VALID_SOURCES: ArticleSource[] = ['reddit', 'hackernews', 'medium', 'provider_blog'];

export function isValidSource(source: string): source is ArticleSource {
  return VALID_SOURCES.includes(source as ArticleSource);
}

export const newsService = {
  async getArticles(
    filter: NewsFilter,
    page: number,
    pageSize: number
  ): Promise<Article[]> {
    const whereConditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filter.source && isValidSource(filter.source)) {
      whereConditions.push(`source = $${paramIndex++}`);
      params.push(filter.source);
    }

    if (filter.search && filter.search.trim()) {
      const searchTerm = `%${filter.search.trim()}%`;
      whereConditions.push(
        `(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex + 1})`
      );
      params.push(searchTerm, searchTerm);
      paramIndex += 2;
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sortField = SORT_FIELD_MAP[filter.sortBy || 'publishedAt'] || 'published_at';
    const sortDirection = filter.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const offset = (page - 1) * pageSize;
    params.push(pageSize, offset);

    const sql = `
      SELECT id, title, url, source, content, summary, published_at, crawled_at
      FROM articles
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const result = await query<ArticleRow>(sql, params);
    return result.rows.map(mapRowToArticle);
  },

  async countArticles(filter: Omit<NewsFilter, 'sortBy' | 'sortOrder'>): Promise<number> {
    const whereConditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filter.source && isValidSource(filter.source)) {
      whereConditions.push(`source = $${paramIndex++}`);
      params.push(filter.source);
    }

    if (filter.search && filter.search.trim()) {
      const searchTerm = `%${filter.search.trim()}%`;
      whereConditions.push(
        `(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex + 1})`
      );
      params.push(searchTerm, searchTerm);
      paramIndex += 2;
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const sql = `SELECT COUNT(*)::int as count FROM articles ${whereClause}`;

    const result = await query<{ count: number }>(sql, params);
    return result.rows[0]?.count ?? 0;
  },

  async getArticleById(id: string): Promise<Article | null> {
    const sql = `
      SELECT id, title, url, source, content, summary, published_at, crawled_at
      FROM articles
      WHERE id = $1
    `;

    const result = await query<ArticleRow>(sql, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return mapRowToArticle(result.rows[0]);
  },

  async getSourceStats(): Promise<Array<{ source: ArticleSource; count: number }>> {
    const sql = `
      SELECT source, COUNT(*)::int as count
      FROM articles
      GROUP BY source
      ORDER BY count DESC
    `;

    const result = await query<{ source: ArticleSource; count: number }>(sql);
    return result.rows;
  },
};

export default newsService;
