import { Router, type Request, type Response, type NextFunction } from 'express';
import { query } from '../db/index.js';
import { ValidationError } from '../middleware/errorHandler.js';
import type {
  ApiResponse,
  PaginatedResponse,
  Article,
  ArticleFilters,
  ArticleSource,
  ArticleRow,
} from '../types/index.js';

const router = Router();

const VALID_SOURCES: ArticleSource[] = ['reddit', 'hackernews', 'medium', 'provider_blog'];
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parseFilters(queryParams: Request['query']): ArticleFilters {
  const filters: ArticleFilters = {};

  if (queryParams.category) {
    const category = String(queryParams.category);
    if (!VALID_SOURCES.includes(category as ArticleSource)) {
      throw new ValidationError(`Invalid category: ${category}. Valid values: ${VALID_SOURCES.join(', ')}`);
    }
    filters.category = category as ArticleSource;
  }

  if (queryParams.search) {
    filters.search = String(queryParams.search).trim();
    if (filters.search.length < 2) {
      throw new ValidationError('Search query must be at least 2 characters');
    }
  }

  if (queryParams.dateFrom) {
    const dateFrom = String(queryParams.dateFrom);
    if (isNaN(Date.parse(dateFrom))) {
      throw new ValidationError('Invalid dateFrom format. Use ISO 8601 format (YYYY-MM-DD)');
    }
    filters.dateFrom = dateFrom;
  }

  if (queryParams.dateTo) {
    const dateTo = String(queryParams.dateTo);
    if (isNaN(Date.parse(dateTo))) {
      throw new ValidationError('Invalid dateTo format. Use ISO 8601 format (YYYY-MM-DD)');
    }
    filters.dateTo = dateTo;
  }

  const page = parseInt(String(queryParams.page || DEFAULT_PAGE), 10);
  const pageSize = parseInt(String(queryParams.pageSize || DEFAULT_PAGE_SIZE), 10);

  if (isNaN(page) || page < 1) {
    throw new ValidationError('Page must be a positive integer');
  }
  if (isNaN(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new ValidationError(`PageSize must be between 1 and ${MAX_PAGE_SIZE}`);
  }

  filters.page = page;
  filters.pageSize = pageSize;

  return filters;
}

interface QueryParts {
  conditions: string[];
  params: unknown[];
  paramIndex: number;
}

function buildQueryConditions(filters: ArticleFilters): QueryParts {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.category) {
    conditions.push(`source = $${paramIndex}`);
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.search) {
    conditions.push(`to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', $${paramIndex})`);
    params.push(filters.search);
    paramIndex++;
  }

  if (filters.dateFrom) {
    conditions.push(`published_at >= $${paramIndex}`);
    params.push(filters.dateFrom);
    paramIndex++;
  }

  if (filters.dateTo) {
    conditions.push(`published_at <= $${paramIndex}`);
    params.push(filters.dateTo);
    paramIndex++;
  }

  return { conditions, params, paramIndex };
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

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = parseFilters(req.query);
    const { conditions, params, paramIndex } = buildQueryConditions(filters);

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countQuery = `SELECT COUNT(*) as total FROM articles ${whereClause}`;
    const countResult = await query<{ total: string }>(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    const offset = (filters.page! - 1) * filters.pageSize!;
    const dataParams = [...params, filters.pageSize, offset];
    const dataQuery = `
      SELECT id, title, url, source, content, summary, published_at, crawled_at, created_at, updated_at
      FROM articles
      ${whereClause}
      ORDER BY published_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const dataResult = await query<ArticleRow>(dataQuery, dataParams);
    const articles = dataResult.rows.map(mapRowToArticle);

    const totalPages = Math.ceil(total / filters.pageSize!);

    const paginatedData: PaginatedResponse<Article> = {
      items: articles,
      total,
      page: filters.page!,
      pageSize: filters.pageSize!,
      totalPages,
    };

    const response: ApiResponse<PaginatedResponse<Article>> = {
      success: true,
      data: paginatedData,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string') {
      throw new ValidationError('Invalid article ID');
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ValidationError('Invalid article ID format');
    }

    const result = await query<ArticleRow>(
      'SELECT id, title, url, source, content, summary, published_at, crawled_at, created_at, updated_at FROM articles WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: 'Article not found',
      };
      res.status(404).json(response);
      return;
    }

    const article = mapRowToArticle(result.rows[0]);

    const response: ApiResponse<Article> = {
      success: true,
      data: article,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
