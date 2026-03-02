import { Router, type Request, type Response, type NextFunction } from 'express';
import * as articlesService from '../services/articles.js';
import type { ApiResponse, Article, ArticleStats, PaginatedResponse } from '../types/index.js';

const router = Router();

router.get('/stats', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await articlesService.getArticleStats();
    const response: ApiResponse<ArticleStats[]> = {
      success: true,
      data: stats,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const article = await articlesService.getArticleById(id);
    const response: ApiResponse<Article> = {
      success: true,
      data: article,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await articlesService.getArticles(req.query as Record<string, unknown>);
    const response: ApiResponse<PaginatedResponse<Article>> = {
      success: true,
      data: result,
    };
    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default router;
