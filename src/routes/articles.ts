import { Router, type Request, type Response } from 'express';
import { query } from '../db/index.js';
import type { Article, ArticleSource, PaginatedResponse, ApiResponse } from '../types/index.js';
import { ValidationError } from '../middleware/errorHandler.js';

interface ArticleQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  sort?: string;
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

interface CountRow {
  count: string;
}

const router = Router();

const VALID_SOURCES: ArticleSource[] = ['reddit', 'hackernews', 'medium', 'provider_blog'];
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const DEFAULT_PAGE = 1;

function validateQueryParams(params: ArticleQueryParams): {
  page: number;
  limit: number;
  search: string | null;
  category: ArticleSource | null;
  startDate: Date | null;
  endDate: Date | null;
  sort: 'asc' | 'desc';
} {
  const page = parseInt(params.page || String(DEFAULT_PAGE), 10);
  if (isNaN(page) || page < 1) {
    throw new ValidationError('page must be a positive integer');
  }

  let limit = parseInt(params.limit || String(DEFAULT_LIMIT), 10);
  if (isNaN(limit) || limit < 1) {
    throw new ValidationError('limit must be a positive integer');
  }
  limit = Math.min(limit, MAX_LIMIT);

  const search = params.search?.trim() || null;

  let category: ArticleSource | null = null;
  if (params.category) {
    if (!VALID_SOURCES.includes(params.category as ArticleSource)) {
      throw new ValidationError(`category must be one of: ${VALID_SOURCES.join(', ')}`);
    }
    category = params.category as ArticleSource;
  }

  let startDate: Date | null = null;
  if (params.startDate) {
    startDate = new Date(params.startDate);
    if (isNaN(startDate.getTime())) {
      throw new ValidationError('startDate must be a valid date (YYYY-MM-DD)');
    }
  }

  let endDate: Date | null = null;
  if (params.endDate) {
    endDate = new Date(params.endDate);
    if (isNaN(endDate.getTime())) {
      throw new ValidationError('endDate must be a valid date (YYYY-MM-DD)');
    }
  }

  const sort = params.sort === 'asc' ? 'asc' : 'desc';

  return { page, limit, search, category, startDate, endDate, sort };
}

function buildWhereClause(params: {
  search: string | null;
  category: ArticleSource | null;
  startDate: Date | null;
  endDate: Date | null;
}): { whereClause: string; queryParams: unknown[] } {
  const conditions: string[] = [];
  const queryParams: unknown[] = [];
  let paramIndex = 1;

  if (params.search) {
    conditions.push(`(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`);
    queryParams.push(`%${params.search}%`);
    paramIndex++;
  }

  if (params.category) {
    conditions.push(`source = $${paramIndex}`);
    queryParams.push(params.category);
    paramIndex++;
  }

  if (params.startDate) {
    conditions.push(`published_at >= $${paramIndex}`);
    queryParams.push(params.startDate);
    paramIndex++;
  }

  if (params.endDate) {
    conditions.push(`published_at <= $${paramIndex}`);
    queryParams.push(params.endDate);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return { whereClause, queryParams };
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
    crawledAt: row.crawled_at
  };
}

router.get('/', async (req: Request<object, object, object, ArticleQueryParams>, res: Response) => {
  const validated = validateQueryParams(req.query);
  const { page, limit, search, category, startDate, endDate, sort } = validated;

  const { whereClause, queryParams } = buildWhereClause({ search, category, startDate, endDate });

  const countResult = await query<CountRow>(
    `SELECT COUNT(*) as count FROM articles ${whereClause}`,
    queryParams
  );
  const total = parseInt(countResult.rows[0].count, 10);

  const offset = (page - 1) * limit;
  const articlesResult = await query<ArticleRow>(
    `SELECT id, title, url, source, content, summary, published_at, crawled_at 
     FROM articles 
     ${whereClause}
     ORDER BY published_at ${sort === 'asc' ? 'ASC' : 'DESC'}
     LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`,
    [...queryParams, limit, offset]
  );

  const articles: Article[] = articlesResult.rows.map(mapRowToArticle);
  const totalPages = Math.ceil(total / limit);

  const response: ApiResponse<PaginatedResponse<Article>> = {
    success: true,
    data: {
      items: articles,
      total,
      page,
      pageSize: limit,
      totalPages
    }
  };

  res.json(response);
});

router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  const result = await query<ArticleRow>(
    `SELECT id, title, url, source, content, summary, published_at, crawled_at 
     FROM articles 
     WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    const response: ApiResponse = {
      success: false,
      error: 'Article not found'
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<Article> = {
    success: true,
    data: mapRowToArticle(result.rows[0])
  };

  res.json(response);
});

export default router;
