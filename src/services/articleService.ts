import { query } from '../db/index.js';
import type { Article, ArticleSource } from '../types/index.js';

export interface ArticleRow {
  id: string;
  title: string;
  url: string;
  source: ArticleSource;
  content: string;
  summary: string | null;
  published_at: Date;
  crawled_at: Date;
}

export async function getExistingUrls(source: ArticleSource): Promise<Set<string>> {
  const result = await query<{ url: string }>(
    'SELECT url FROM articles WHERE source = $1 AND crawled_at > NOW() - INTERVAL \'7 days\'',
    [source]
  );
  return new Set(result.rows.map((row) => row.url));
}

export async function saveArticles(
  articles: Omit<Article, 'id' | 'crawledAt'>[]
): Promise<number> {
  if (articles.length === 0) {
    return 0;
  }

  let savedCount = 0;

  for (const article of articles) {
    try {
      await query(
        `INSERT INTO articles (title, url, source, content, published_at, crawled_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (url) DO NOTHING`,
        [article.title, article.url, article.source, article.content, article.publishedAt]
      );
      savedCount++;
    } catch (error) {
      console.error(`Failed to save article: ${article.url}`, error);
    }
  }

  return savedCount;
}

export async function getRecentArticles(
  limit = 50,
  source?: ArticleSource
): Promise<ArticleRow[]> {
  let sql = 'SELECT * FROM articles';
  const params: unknown[] = [];

  if (source) {
    sql += ' WHERE source = $1';
    params.push(source);
  }

  sql += ' ORDER BY published_at DESC LIMIT $' + (params.length + 1);
  params.push(limit);

  const result = await query<ArticleRow>(sql, params);
  return result.rows;
}

export async function getArticleById(id: string): Promise<ArticleRow | null> {
  const result = await query<ArticleRow>('SELECT * FROM articles WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function deleteOldArticles(daysToKeep = 30): Promise<number> {
  const result = await query(
    'DELETE FROM articles WHERE crawled_at < NOW() - INTERVAL \'1 day\' * $1',
    [daysToKeep]
  );
  return result.rowCount || 0;
}
