import { query } from '../db/index.js';
import type { NewsArticle, NewsSource, CrawlLog, ArticleFilter, PaginatedResponse } from '../types/index.js';
import crypto from 'crypto';

export function generateContentHash(title: string, url: string): string {
  const normalizedTitle = title.toLowerCase().trim();
  return crypto.createHash('sha256').update(`${normalizedTitle}|${url}`).digest('hex');
}

export async function getEnabledSources(): Promise<NewsSource[]> {
  const result = await query<{
    id: number;
    name: string;
    type: 'rss' | 'html';
    url: string;
    selectors: unknown;
    rate_limit_ms: number;
    enabled: boolean;
    last_crawled_at: Date | null;
    failure_count: number;
    created_at: Date;
    updated_at: Date;
  }>(`
    SELECT id, name, type, url, selectors, rate_limit_ms, enabled, 
           last_crawled_at, failure_count, created_at, updated_at
    FROM news_sources 
    WHERE enabled = true
    ORDER BY name
  `);

  return result.rows.map(row => ({
    id: row.id,
    name: row.name,
    type: row.type,
    url: row.url,
    selectors: row.selectors as NewsSource['selectors'],
    rateLimitMs: row.rate_limit_ms,
    enabled: row.enabled,
    lastCrawledAt: row.last_crawled_at,
    failureCount: row.failure_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function updateSourceLastCrawled(sourceId: number): Promise<void> {
  await query(`
    UPDATE news_sources 
    SET last_crawled_at = NOW(), failure_count = 0, updated_at = NOW()
    WHERE id = $1
  `, [sourceId]);
}

export async function incrementSourceFailure(sourceId: number, maxFailures: number): Promise<void> {
  await query(`
    UPDATE news_sources 
    SET failure_count = failure_count + 1,
        enabled = CASE WHEN failure_count + 1 >= $2 THEN false ELSE enabled END,
        updated_at = NOW()
    WHERE id = $1
  `, [sourceId, maxFailures]);
}

export async function checkArticleExists(contentHash: string): Promise<boolean> {
  const result = await query<{ exists: boolean }>(`
    SELECT EXISTS(SELECT 1 FROM news_articles WHERE content_hash = $1) as exists
  `, [contentHash]);
  return result.rows[0]?.exists ?? false;
}

export async function createArticle(article: {
  title: string;
  url: string;
  source: string;
  sourceId: number | null;
  content: string | null;
  summary: string | null;
  author: string | null;
  publishedAt: Date | null;
  contentHash: string;
  relevanceScore: number;
}): Promise<NewsArticle | null> {
  try {
    const result = await query<{
      id: number;
      title: string;
      url: string;
      source: string;
      source_id: number | null;
      content: string | null;
      summary: string | null;
      author: string | null;
      published_at: Date | null;
      crawled_at: Date;
      content_hash: string;
      relevance_score: string;
      created_at: Date;
    }>(`
      INSERT INTO news_articles (title, url, source, source_id, content, summary, author, published_at, content_hash, relevance_score)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (url, source) DO NOTHING
      RETURNING *
    `, [
      article.title,
      article.url,
      article.source,
      article.sourceId,
      article.content,
      article.summary,
      article.author,
      article.publishedAt,
      article.contentHash,
      article.relevanceScore,
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      title: row.title,
      url: row.url,
      source: row.source,
      sourceId: row.source_id,
      content: row.content,
      summary: row.summary,
      author: row.author,
      publishedAt: row.published_at,
      crawledAt: row.crawled_at,
      contentHash: row.content_hash,
      relevanceScore: parseFloat(row.relevance_score),
      createdAt: row.created_at,
    };
  } catch (error) {
    console.error('Failed to create article:', error);
    return null;
  }
}

export async function getArticles(filter: ArticleFilter): Promise<PaginatedResponse<NewsArticle>> {
  const page = filter.page ?? 1;
  const pageSize = filter.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filter.source) {
    conditions.push(`source = $${paramIndex++}`);
    params.push(filter.source);
  }

  if (filter.startDate) {
    conditions.push(`published_at >= $${paramIndex++}`);
    params.push(filter.startDate);
  }

  if (filter.endDate) {
    conditions.push(`published_at <= $${paramIndex++}`);
    params.push(filter.endDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM news_articles ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  params.push(pageSize, offset);
  const result = await query<{
    id: number;
    title: string;
    url: string;
    source: string;
    source_id: number | null;
    content: string | null;
    summary: string | null;
    author: string | null;
    published_at: Date | null;
    crawled_at: Date;
    content_hash: string;
    relevance_score: string;
    created_at: Date;
  }>(`
    SELECT * FROM news_articles 
    ${whereClause}
    ORDER BY COALESCE(published_at, crawled_at) DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `, params);

  const items: NewsArticle[] = result.rows.map(row => ({
    id: row.id,
    title: row.title,
    url: row.url,
    source: row.source,
    sourceId: row.source_id,
    content: row.content,
    summary: row.summary,
    author: row.author,
    publishedAt: row.published_at,
    crawledAt: row.crawled_at,
    contentHash: row.content_hash,
    relevanceScore: parseFloat(row.relevance_score),
    createdAt: row.created_at,
  }));

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getArticleById(id: number): Promise<NewsArticle | null> {
  const result = await query<{
    id: number;
    title: string;
    url: string;
    source: string;
    source_id: number | null;
    content: string | null;
    summary: string | null;
    author: string | null;
    published_at: Date | null;
    crawled_at: Date;
    content_hash: string;
    relevance_score: string;
    created_at: Date;
  }>(`SELECT * FROM news_articles WHERE id = $1`, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    source: row.source,
    sourceId: row.source_id,
    content: row.content,
    summary: row.summary,
    author: row.author,
    publishedAt: row.published_at,
    crawledAt: row.crawled_at,
    contentHash: row.content_hash,
    relevanceScore: parseFloat(row.relevance_score),
    createdAt: row.created_at,
  };
}

export async function createCrawlLog(log: {
  sourceId: number | null;
  sourceName: string;
  status: 'success' | 'partial' | 'failed';
  articlesFound: number;
  articlesNew: number;
  articlesDuplicate: number;
  errorMessage: string | null;
  durationMs: number;
}): Promise<CrawlLog> {
  const result = await query<{
    id: number;
    source_id: number | null;
    source_name: string;
    status: 'success' | 'partial' | 'failed';
    articles_found: number;
    articles_new: number;
    articles_duplicate: number;
    error_message: string | null;
    duration_ms: number | null;
    started_at: Date;
    completed_at: Date | null;
  }>(`
    INSERT INTO crawl_logs (source_id, source_name, status, articles_found, articles_new, articles_duplicate, error_message, duration_ms, completed_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    RETURNING *
  `, [
    log.sourceId,
    log.sourceName,
    log.status,
    log.articlesFound,
    log.articlesNew,
    log.articlesDuplicate,
    log.errorMessage,
    log.durationMs,
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    sourceId: row.source_id,
    sourceName: row.source_name,
    status: row.status,
    articlesFound: row.articles_found,
    articlesNew: row.articles_new,
    articlesDuplicate: row.articles_duplicate,
    errorMessage: row.error_message,
    durationMs: row.duration_ms,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  };
}

export async function getLatestCrawlLogs(limit = 20): Promise<CrawlLog[]> {
  const result = await query<{
    id: number;
    source_id: number | null;
    source_name: string;
    status: 'success' | 'partial' | 'failed';
    articles_found: number;
    articles_new: number;
    articles_duplicate: number;
    error_message: string | null;
    duration_ms: number | null;
    started_at: Date;
    completed_at: Date | null;
  }>(`
    SELECT * FROM crawl_logs
    ORDER BY started_at DESC
    LIMIT $1
  `, [limit]);

  return result.rows.map(row => ({
    id: row.id,
    sourceId: row.source_id,
    sourceName: row.source_name,
    status: row.status,
    articlesFound: row.articles_found,
    articlesNew: row.articles_new,
    articlesDuplicate: row.articles_duplicate,
    errorMessage: row.error_message,
    durationMs: row.duration_ms,
    startedAt: row.started_at,
    completedAt: row.completed_at,
  }));
}
