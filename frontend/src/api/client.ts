import type { ApiResponse, Article, ArticleFilters, PaginatedResponse } from '../types';

const API_BASE_URL = '/articles';

export async function fetchArticles(
  filters: Partial<ArticleFilters>
): Promise<PaginatedResponse<Article>> {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.sources && filters.sources.length > 0) {
    filters.sources.forEach(source => params.append('source', source));
  }

  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo);
  }

  if (filters.page) {
    params.set('page', filters.page.toString());
  }

  if (filters.pageSize) {
    params.set('pageSize', filters.pageSize.toString());
  }

  const queryString = params.toString();
  const url = queryString ? `${API_BASE_URL}?${queryString}` : API_BASE_URL;

  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch articles: ${response.statusText}`);
  }

  const json: ApiResponse<PaginatedResponse<Article>> = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || 'Failed to fetch articles');
  }

  return json.data;
}

export async function fetchArticleById(id: string): Promise<Article> {
  const response = await fetch(`${API_BASE_URL}/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch article: ${response.statusText}`);
  }

  const json: ApiResponse<Article> = await response.json();

  if (!json.success || !json.data) {
    throw new Error(json.error || 'Article not found');
  }

  return json.data;
}
