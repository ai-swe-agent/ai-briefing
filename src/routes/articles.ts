import { Router, type Request, type Response } from 'express';
import { findArticles, findArticleById, getArticleSources } from '../models/Article.js';
import type { ApiResponse, Article, ArticleQueryParams, ArticleSource, PaginatedResponse } from '../types/index.js';

const router = Router();

function parseQueryParams(query: Request['query']): ArticleQueryParams {
  const params: ArticleQueryParams = {};

  if (typeof query.search === 'string' && query.search.trim()) {
    params.search = query.search.trim();
  }

  if (query.source) {
    const sources = Array.isArray(query.source)
      ? query.source.filter((s): s is string => typeof s === 'string')
      : typeof query.source === 'string'
        ? [query.source]
        : [];
    
    const validSources: ArticleSource[] = ['reddit', 'hackernews', 'medium', 'provider_blog'];
    const filteredSources = sources.filter((s): s is ArticleSource => 
      validSources.includes(s as ArticleSource)
    );
    
    if (filteredSources.length > 0) {
      params.source = filteredSources.length === 1 ? filteredSources[0] : filteredSources;
    }
  }

  if (typeof query.dateFrom === 'string' && query.dateFrom) {
    params.dateFrom = query.dateFrom;
  }

  if (typeof query.dateTo === 'string' && query.dateTo) {
    params.dateTo = query.dateTo;
  }

  if (typeof query.page === 'string') {
    const page = parseInt(query.page, 10);
    if (!isNaN(page) && page > 0) {
      params.page = page;
    }
  }

  if (typeof query.pageSize === 'string') {
    const pageSize = parseInt(query.pageSize, 10);
    if (!isNaN(pageSize) && pageSize > 0 && pageSize <= 100) {
      params.pageSize = pageSize;
    }
  }

  return params;
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const params = parseQueryParams(req.query);
    const result = await findArticles(params);
    
    const response: ApiResponse<PaginatedResponse<Article>> = {
      success: true,
      data: result,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching articles:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch articles',
    };
    res.status(500).json(response);
  }
});

router.get('/sources', async (_req: Request, res: Response) => {
  try {
    const sources = await getArticleSources();
    
    const response: ApiResponse<ArticleSource[]> = {
      success: true,
      data: sources,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching sources:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch sources',
    };
    res.status(500).json(response);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const article = await findArticleById(id);
    
    if (!article) {
      const response: ApiResponse = {
        success: false,
        error: 'Article not found',
      };
      res.status(404).json(response);
      return;
    }
    
    const response: ApiResponse<Article> = {
      success: true,
      data: article,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching article:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to fetch article',
    };
    res.status(500).json(response);
  }
});

export default router;
