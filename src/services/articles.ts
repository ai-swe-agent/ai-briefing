import * as articlesRepo from '../repositories/articles.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import type {
  Article,
  ArticleListQuery,
  ArticleStats,
  PaginatedResponse,
  ArticleSource,
} from '../types/index.js';
import { ARTICLE_SOURCES, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../types/index.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

function isValidSource(source: string): source is ArticleSource {
  return ARTICLE_SOURCES.includes(source as ArticleSource);
}

function isValidDateString(date: string): boolean {
  const parsed = Date.parse(date);
  return !isNaN(parsed);
}

export function validateAndNormalizeQuery(rawQuery: Record<string, unknown>): ArticleListQuery {
  const query: ArticleListQuery = {};

  if (rawQuery.source !== undefined) {
    const source = String(rawQuery.source);
    if (!isValidSource(source)) {
      throw new ValidationError(
        `Invalid source. Must be one of: ${ARTICLE_SOURCES.join(', ')}`
      );
    }
    query.source = source;
  }

  if (rawQuery.dateFrom !== undefined) {
    const dateFrom = String(rawQuery.dateFrom);
    if (!isValidDateString(dateFrom)) {
      throw new ValidationError('Invalid dateFrom format. Use ISO 8601 (YYYY-MM-DD)');
    }
    query.dateFrom = dateFrom;
  }

  if (rawQuery.dateTo !== undefined) {
    const dateTo = String(rawQuery.dateTo);
    if (!isValidDateString(dateTo)) {
      throw new ValidationError('Invalid dateTo format. Use ISO 8601 (YYYY-MM-DD)');
    }
    query.dateTo = dateTo;
  }

  if (rawQuery.search !== undefined) {
    const search = String(rawQuery.search).trim();
    if (search.length > 0) {
      query.search = search;
    }
  }

  const page = rawQuery.page !== undefined ? parseInt(String(rawQuery.page), 10) : 1;
  if (isNaN(page) || page < 1) {
    throw new ValidationError('Page must be a positive integer');
  }
  query.page = page;

  const pageSize = rawQuery.pageSize !== undefined
    ? parseInt(String(rawQuery.pageSize), 10)
    : DEFAULT_PAGE_SIZE;
  if (isNaN(pageSize) || pageSize < 1) {
    throw new ValidationError('PageSize must be a positive integer');
  }
  if (pageSize > MAX_PAGE_SIZE) {
    throw new ValidationError(`PageSize cannot exceed ${MAX_PAGE_SIZE}`);
  }
  query.pageSize = pageSize;

  if (rawQuery.sortBy !== undefined) {
    const sortBy = String(rawQuery.sortBy);
    if (sortBy !== 'publishedAt' && sortBy !== 'crawledAt') {
      throw new ValidationError('sortBy must be either "publishedAt" or "crawledAt"');
    }
    query.sortBy = sortBy;
  }

  if (rawQuery.sortOrder !== undefined) {
    const sortOrder = String(rawQuery.sortOrder).toLowerCase();
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
      throw new ValidationError('sortOrder must be either "asc" or "desc"');
    }
    query.sortOrder = sortOrder;
  }

  return query;
}

export async function getArticles(
  rawQuery: Record<string, unknown>
): Promise<PaginatedResponse<Article>> {
  const validatedQuery = validateAndNormalizeQuery(rawQuery);
  return articlesRepo.findAll(validatedQuery);
}

export async function getArticleById(id: string): Promise<Article> {
  if (!isValidUUID(id)) {
    throw new ValidationError('Invalid article ID format');
  }

  const article = await articlesRepo.findById(id);

  if (!article) {
    throw new NotFoundError('Article not found');
  }

  return article;
}

export async function getArticleStats(): Promise<ArticleStats[]> {
  return articlesRepo.getSourceStats();
}

export default { getArticles, getArticleById, getArticleStats, validateAndNormalizeQuery };
