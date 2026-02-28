import { Router, type Request, type Response, type NextFunction } from 'express';
import { getArticlesPaginated, getCategories } from '../db/articles.js';
import { ValidationError } from '../middleware/errorHandler.js';
import type { ApiResponse, ArticleFilterParams, PaginatedResponse, Article } from '../types/index.js';

const router = Router();

function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  const parsed = Date.parse(dateString);
  return !isNaN(parsed);
}

function validateArticleParams(query: Record<string, unknown>): ArticleFilterParams {
  const params: ArticleFilterParams = {};

  if (query.page !== undefined) {
    const page = parseInt(String(query.page), 10);
    if (isNaN(page) || page < 1) {
      throw new ValidationError('Invalid page parameter: must be a positive integer');
    }
    params.page = page;
  }

  if (query.pageSize !== undefined) {
    const pageSize = parseInt(String(query.pageSize), 10);
    if (isNaN(pageSize) || pageSize < 1) {
      throw new ValidationError('Invalid pageSize parameter: must be a positive integer');
    }
    params.pageSize = pageSize;
  }

  if (query.category !== undefined) {
    params.category = String(query.category);
  }

  if (query.startDate !== undefined) {
    const startDate = String(query.startDate);
    if (!isValidDateFormat(startDate)) {
      throw new ValidationError('Invalid startDate parameter: must be in YYYY-MM-DD format');
    }
    params.startDate = startDate;
  }

  if (query.endDate !== undefined) {
    const endDate = String(query.endDate);
    if (!isValidDateFormat(endDate)) {
      throw new ValidationError('Invalid endDate parameter: must be in YYYY-MM-DD format');
    }
    params.endDate = endDate;
  }

  if (query.search !== undefined) {
    params.search = String(query.search);
  }

  return params;
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const params = validateArticleParams(req.query as Record<string, unknown>);
    const result = await getArticlesPaginated(params);
    
    const response: ApiResponse<PaginatedResponse<Article>> = {
      success: true,
      data: result,
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await getCategories();
    
    const response: ApiResponse<string[]> = {
      success: true,
      data: categories,
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
