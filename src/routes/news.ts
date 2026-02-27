import { Router, type Request, type Response, type NextFunction } from 'express';
import { newsService, isValidSource, type NewsFilter } from '../services/news.js';
import { NotFoundError, ValidationError } from '../middleware/errorHandler.js';
import type { ApiResponse, PaginatedResponse, Article, ArticleSource } from '../types/index.js';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export const newsRouter = Router();

newsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Math.max(DEFAULT_PAGE, parseInt(req.query.page as string) || DEFAULT_PAGE);
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(req.query.pageSize as string) || DEFAULT_PAGE_SIZE)
    );

    const sourceParam = req.query.source as string | undefined;
    if (sourceParam && !isValidSource(sourceParam)) {
      throw new ValidationError(
        `Invalid source. Must be one of: reddit, hackernews, medium, provider_blog`
      );
    }

    const sortByParam = req.query.sortBy as string | undefined;
    if (sortByParam && !['publishedAt', 'crawledAt'].includes(sortByParam)) {
      throw new ValidationError('Invalid sortBy. Must be one of: publishedAt, crawledAt');
    }

    const sortOrderParam = req.query.sortOrder as string | undefined;
    if (sortOrderParam && !['asc', 'desc'].includes(sortOrderParam)) {
      throw new ValidationError('Invalid sortOrder. Must be one of: asc, desc');
    }

    const filter: NewsFilter = {
      source: sourceParam as ArticleSource | undefined,
      search: req.query.search as string | undefined,
      sortBy: (sortByParam as 'publishedAt' | 'crawledAt') || 'publishedAt',
      sortOrder: (sortOrderParam as 'asc' | 'desc') || 'desc',
    };

    const [articles, total] = await Promise.all([
      newsService.getArticles(filter, page, pageSize),
      newsService.countArticles({ source: filter.source, search: filter.search }),
    ]);

    const response: ApiResponse<PaginatedResponse<Article>> = {
      success: true,
      data: {
        items: articles,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

newsRouter.get('/sources', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sourceStats = await newsService.getSourceStats();

    const response: ApiResponse<Array<{ source: ArticleSource; count: number }>> = {
      success: true,
      data: sourceStats,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

newsRouter.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const article = await newsService.getArticleById(id);

    if (!article) {
      throw new NotFoundError(`Article with ID ${id} not found`);
    }

    const response: ApiResponse<Article> = {
      success: true,
      data: article,
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

export default newsRouter;
