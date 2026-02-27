import { useQuery } from '@tanstack/react-query';
import type { Article, ArticleFilters, ApiResponse, PaginatedResponse } from '../types';

interface UseArticlesParams extends Partial<ArticleFilters> {
  page?: number;
  limit?: number;
}

async function fetchArticles(params: UseArticlesParams): Promise<PaginatedResponse<Article>> {
  const searchParams = new URLSearchParams();
  
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.category) searchParams.set('category', params.category);
  if (params.startDate) searchParams.set('startDate', params.startDate);
  if (params.endDate) searchParams.set('endDate', params.endDate);
  if (params.sort) searchParams.set('sort', params.sort);

  const response = await fetch(`/api/articles?${searchParams.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch articles');
  }

  const data: ApiResponse<PaginatedResponse<Article>> = await response.json();
  
  if (!data.success || !data.data) {
    throw new Error(data.error || 'Failed to fetch articles');
  }

  return data.data;
}

export function useArticles(params: UseArticlesParams = {}) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => fetchArticles(params),
    staleTime: 30000
  });
}
