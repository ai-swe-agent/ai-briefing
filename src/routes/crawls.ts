import { Router, type Response, type NextFunction } from 'express';
import { getCrawls, getCrawlById, getRunningCrawl, getCrawlsCount } from '../db/crawls.js';
import { executeCrawl } from '../services/crawlService.js';
import { authenticate, type AuthenticatedRequest } from '../middleware/auth.js';
import { AppError, NotFoundError } from '../middleware/errorHandler.js';
import type { ApiResponse, Crawl, PaginatedResponse } from '../types/index.js';

const router = Router();

router.post(
  '/trigger',
  authenticate,
  async (_req: AuthenticatedRequest, res: Response<ApiResponse<Crawl>>, next: NextFunction) => {
    try {
      const runningCrawl = await getRunningCrawl();
      if (runningCrawl) {
        throw new AppError('A crawl is already in progress', 409);
      }

      const crawl = await executeCrawl();
      
      res.status(201).json({
        success: true,
        data: crawl,
        message: 'Crawl triggered successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/',
  authenticate,
  async (req: AuthenticatedRequest, res: Response<ApiResponse<PaginatedResponse<Crawl>>>, next: NextFunction) => {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(req.query.pageSize as string) || 20));
      const offset = (page - 1) * pageSize;

      const [crawls, total] = await Promise.all([
        getCrawls(pageSize, offset),
        getCrawlsCount(),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      res.json({
        success: true,
        data: {
          items: crawls,
          total,
          page,
          pageSize,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/:id',
  authenticate,
  async (req: AuthenticatedRequest, res: Response<ApiResponse<Crawl>>, next: NextFunction) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const crawl = await getCrawlById(id);
      
      if (!crawl) {
        throw new NotFoundError('Crawl not found');
      }

      res.json({
        success: true,
        data: crawl,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
