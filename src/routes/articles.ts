import { Router, type Request, type Response, type NextFunction } from 'express';
import type { ApiResponse, Article, ArticleSource, PaginatedResponse } from '../types/index.js';
import type { ArticleFilterQuery } from '../types/articles.js';
import { getArticles, searchArticlesService, getArticleById, getSources } from '../services/articles.js';

const router = Router();

interface ArticleListQuery {
  source?: string;
  fromDate?: string;
  toDate?: string;
  page?: string;
  pageSize?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface ArticleSearchQueryParams {
  q?: string;
  page?: string;
  pageSize?: string;
}

interface ArticleIdParams {
  id: string;
}

router.get(
  '/',
  async (
    req: Request<object, ApiResponse<PaginatedResponse<Article>>, object, ArticleListQuery>,
    res: Response<ApiResponse<PaginatedResponse<Article>>>,
    next: NextFunction
  ) => {
    try {
      const filters: ArticleFilterQuery = {
        source: req.query.source as ArticleSource | undefined,
        fromDate: req.query.fromDate,
        toDate: req.query.toDate,
        page: req.query.page ? parseInt(req.query.page, 10) : undefined,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize, 10) : undefined,
        sortBy: req.query.sortBy as 'publishedAt' | 'crawledAt' | undefined,
        sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined,
      };

      const result = await getArticles(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/search',
  async (
    req: Request<object, ApiResponse<PaginatedResponse<Article>>, object, ArticleSearchQueryParams>,
    res: Response<ApiResponse<PaginatedResponse<Article>>>,
    next: NextFunction
  ) => {
    try {
      const { q, page, pageSize } = req.query;
      
      const result = await searchArticlesService(
        q ?? '',
        page ? parseInt(page, 10) : 1,
        pageSize ? parseInt(pageSize, 10) : 20
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/sources',
  async (
    _req: Request,
    res: Response<ApiResponse<ArticleSource[]>>,
    next: NextFunction
  ) => {
    try {
      const sources = await getSources();

      res.json({
        success: true,
        data: sources,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  async (
    req: Request<ArticleIdParams, ApiResponse<Article>>,
    res: Response<ApiResponse<Article>>,
    next: NextFunction
  ) => {
    try {
      const article = await getArticleById(req.params.id);

      res.json({
        success: true,
        data: article,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
