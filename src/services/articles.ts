import type { Article, ArticleSource, PaginatedResponse } from '../types/index.js';
import type { ArticleFilterQuery } from '../types/articles.js';
import { findArticles, searchArticles, findArticleById, getAvailableSources } from '../repositories/articles.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';

const VALID_SOURCES: ArticleSource[] = ['reddit', 'hackernews', 'medium', 'provider_blog'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidSource(source: string): source is ArticleSource {
  return VALID_SOURCES.includes(source as ArticleSource);
}

function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

function isValidUUID(id: string): boolean {
  return UUID_REGEX.test(id);
}

export async function getArticles(filters: ArticleFilterQuery): Promise<PaginatedResponse<Article>> {
  if (filters.source && !isValidSource(filters.source)) {
    throw new ValidationError(`Invalid source. Must be one of: ${VALID_SOURCES.join(', ')}`);
  }

  if (filters.fromDate && !isValidDate(filters.fromDate)) {
    throw new ValidationError('Invalid fromDate format. Use ISO 8601 format (e.g., 2024-01-01)');
  }

  if (filters.toDate && !isValidDate(filters.toDate)) {
    throw new ValidationError('Invalid toDate format. Use ISO 8601 format (e.g., 2024-12-31)');
  }

  if (filters.fromDate && filters.toDate) {
    const from = new Date(filters.fromDate);
    const to = new Date(filters.toDate);
    if (from > to) {
      throw new ValidationError('fromDate must be before or equal to toDate');
    }
  }

  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 20));

  return findArticles({
    ...filters,
    page,
    pageSize,
  });
}

export async function searchArticlesService(
  searchQuery: string,
  page = 1,
  pageSize = 20
): Promise<PaginatedResponse<Article>> {
  if (!searchQuery || searchQuery.trim().length === 0) {
    throw new ValidationError('Search query cannot be empty');
  }

  if (searchQuery.length > 200) {
    throw new ValidationError('Search query is too long (max 200 characters)');
  }

  const sanitizedQuery = searchQuery.trim();
  const validPage = Math.max(1, page);
  const validPageSize = Math.min(100, Math.max(1, pageSize));

  return searchArticles(sanitizedQuery, validPage, validPageSize);
}

export async function getArticleById(id: string): Promise<Article> {
  if (!isValidUUID(id)) {
    throw new ValidationError('Invalid article ID format');
  }

  const article = await findArticleById(id);
  
  if (!article) {
    throw new NotFoundError(`Article with ID ${id} not found`);
  }

  return article;
}

export async function getSources(): Promise<ArticleSource[]> {
  return getAvailableSources();
}

export default {
  getArticles,
  searchArticles: searchArticlesService,
  getArticleById,
  getSources,
};
