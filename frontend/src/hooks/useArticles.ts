import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchArticles } from '../api/client';
import type { Article, ArticleFilters, PaginatedResponse } from '../types';

interface UseArticlesReturn {
  articles: Article[];
  total: number;
  totalPages: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DEFAULT_FILTERS: ArticleFilters = {
  search: '',
  sources: [],
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 10,
};

export function useArticles(filters: Partial<ArticleFilters> = {}): UseArticlesReturn {
  const [data, setData] = useState<PaginatedResponse<Article> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const mergedFilters = { ...DEFAULT_FILTERS, ...filters };

  const loadArticles = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await fetchArticles(mergedFilters);
      setData(result);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [
    mergedFilters.search,
    mergedFilters.sources.join(','),
    mergedFilters.dateFrom,
    mergedFilters.dateTo,
    mergedFilters.page,
    mergedFilters.pageSize,
  ]);

  useEffect(() => {
    loadArticles();
    
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [loadArticles]);

  return {
    articles: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    page: data?.page ?? mergedFilters.page,
    pageSize: data?.pageSize ?? mergedFilters.pageSize,
    loading,
    error,
    refetch: loadArticles,
  };
}
