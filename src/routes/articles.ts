import { Router, type Request, type Response, type NextFunction } from 'express';
import { authenticate } from '../middleware/auth.js';
import { ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import * as articleRepo from '../repositories/articleRepository.js';
import type { ApiResponse, PaginatedResponse, Article, ArticleSource } from '../types/index.js';

const router = Router();

const VALID_SOURCES: ArticleSource[] = ['reddit', 'hackernews', 'medium', 'provider_blog'];
const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

function validateQueryParams(req: Request): articleRepo.ArticleFilters & articleRepo.PaginationOptions {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const rawPageSize = parseInt(req.query.pageSize as string, 10) || DEFAULT_PAGE_SIZE;
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, rawPageSize));

  const filters: articleRepo.ArticleFilters = {};

  if (req.query.source) {
    const source = req.query.source as string;
    if (!VALID_SOURCES.includes(source as ArticleSource)) {
      throw new ValidationError(`Invalid source. Must be one of: ${VALID_SOURCES.join(', ')}`);
    }
    filters.source = source as ArticleSource;
  }

  if (req.query.category) {
    filters.category = req.query.category as string;
  }

  if (req.query.startDate) {
    const startDate = new Date(req.query.startDate as string);
    if (isNaN(startDate.getTime())) {
      throw new ValidationError('Invalid startDate format. Use ISO 8601 format.');
    }
    filters.startDate = startDate;
  }

  if (req.query.endDate) {
    const endDate = new Date(req.query.endDate as string);
    if (isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid endDate format. Use ISO 8601 format.');
    }
    filters.endDate = endDate;
  }

  if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
    throw new ValidationError('startDate must be before endDate');
  }

  if (req.query.search) {
    const search = (req.query.search as string).trim();
    if (search.length > 500) {
      throw new ValidationError('Search query must not exceed 500 characters');
    }
    if (search.length > 0) {
      filters.search = search;
    }
  }

  return { ...filters, page, pageSize };
}

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, pageSize, ...filters } = validateQueryParams(req);
      const result = await articleRepo.findAll(filters, { page, pageSize });

      const response: ApiResponse<PaginatedResponse<Article>> = {
        success: true,
        data: result,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const article = await articleRepo.findById(req.params.id);

      if (!article) {
        throw new NotFoundError('Article not found');
      }

      const response: ApiResponse<Article> = {
        success: true,
        data: article,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
