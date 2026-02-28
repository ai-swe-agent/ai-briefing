import { useState, useEffect, useCallback } from 'react';
import type { Article, ArticleFilterParams, PaginatedResponse, ApiResponse } from '../types';

interface UseArticlesResult {
  articles: Article[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useArticles(params: ArticleFilterParams): UseArticlesResult {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', String(params.page));
    if (params.pageSize) searchParams.set('pageSize', String(params.pageSize));
    if (params.category) searchParams.set('category', params.category);
    if (params.startDate) searchParams.set('startDate', params.startDate);
    if (params.endDate) searchParams.set('endDate', params.endDate);
    if (params.search) searchParams.set('search', params.search);

    try {
      const response = await fetch(`/api/articles?${searchParams.toString()}`);
      const data: ApiResponse<PaginatedResponse<Article>> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      if (data.data) {
        setArticles(data.data.items);
        setTotal(data.data.total);
        setTotalPages(data.data.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setArticles([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.pageSize, params.category, params.startDate, params.endDate, params.search]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  return {
    articles,
    total,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 20,
    totalPages,
    isLoading,
    error,
    refetch: fetchArticles,
  };
}
