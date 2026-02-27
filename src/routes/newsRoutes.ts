import { Router, type Request, type Response, type NextFunction } from 'express';
import type { ApiResponse, PaginatedResponse, NewsArticle, CrawlResult, CrawlLog } from '../types/index.js';
import { getArticles, getArticleById, getLatestCrawlLogs, getEnabledSources } from '../repositories/newsRepository.js';
import { crawlAllSources, crawlSingleSource } from '../services/newsCrawler.js';
import { AppError, ValidationError, NotFoundError } from '../middleware/errorHandler.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.get('/articles', asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = Math.min(parseInt(req.query.pageSize as string) || 20, 100);
  const source = req.query.source as string | undefined;
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

  if (page < 1) {
    throw new ValidationError('Page must be at least 1');
  }

  const result = await getArticles({
    source,
    startDate,
    endDate,
    page,
    pageSize,
  });

  const response: ApiResponse<PaginatedResponse<NewsArticle>> = {
    success: true,
    data: result,
  };

  res.json(response);
}));

router.get('/articles/:id', asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    throw new ValidationError('Invalid article ID');
  }

  const article = await getArticleById(id);

  if (!article) {
    throw new NotFoundError('Article not found');
  }

  const response: ApiResponse<NewsArticle> = {
    success: true,
    data: article,
  };

  res.json(response);
}));

router.get('/sources', asyncHandler(async (_req: Request, res: Response) => {
  const sources = await getEnabledSources();

  const response: ApiResponse<{ name: string; type: string; lastCrawledAt: Date | null; failureCount: number }[]> = {
    success: true,
    data: sources.map(s => ({
      name: s.name,
      type: s.type,
      lastCrawledAt: s.lastCrawledAt,
      failureCount: s.failureCount,
    })),
  };

  res.json(response);
}));

router.get('/crawl/logs', asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

  const logs = await getLatestCrawlLogs(limit);

  const response: ApiResponse<CrawlLog[]> = {
    success: true,
    data: logs,
  };

  res.json(response);
}));

router.post('/crawl/trigger', asyncHandler(async (req: Request, res: Response) => {
  const sourceName = req.body?.source as string | undefined;

  let results: CrawlResult[] | CrawlResult | null;

  if (sourceName) {
    results = await crawlSingleSource(sourceName);
    if (!results) {
      throw new NotFoundError(`Source not found: ${sourceName}`);
    }
  } else {
    results = await crawlAllSources();
  }

  const response: ApiResponse<CrawlResult[] | CrawlResult> = {
    success: true,
    data: results,
    message: 'Crawl completed',
  };

  res.json(response);
}));

export default router;
