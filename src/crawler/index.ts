import { getEnabledSources, type NewsSource } from './sources.js';
import { fetchSource, fetchHackerNewsTopStories, fetchHackerNewsItem } from './fetcher.js';
import {
  parseRssFeed,
  parseHackerNewsItem,
  parseRedditResponse,
  toArticle,
  type RawArticle,
  type HackerNewsItem,
  type RedditResponse,
} from './parsers.js';
import { saveArticles, getExistingUrls, type ArticleRow } from '../services/articleService.js';
import type { Article, ArticleSource } from '../types/index.js';

export interface CrawlResult {
  source: ArticleSource;
  articlesFound: number;
  articlesSaved: number;
  errors: string[];
  durationMs: number;
}

export interface CrawlSummary {
  startedAt: Date;
  completedAt: Date;
  totalArticlesFound: number;
  totalArticlesSaved: number;
  sourceResults: CrawlResult[];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function crawlHackerNews(): Promise<{ articles: RawArticle[]; errors: string[] }> {
  const errors: string[] = [];
  const articles: RawArticle[] = [];

  const storiesResult = await fetchHackerNewsTopStories(30);
  if (!storiesResult.success || !storiesResult.data) {
    errors.push(storiesResult.error || 'Failed to fetch top stories');
    return { articles, errors };
  }

  for (const storyId of storiesResult.data) {
    const itemResult = await fetchHackerNewsItem(storyId);
    if (itemResult.success && itemResult.data) {
      const parsed = parseHackerNewsItem(itemResult.data as HackerNewsItem);
      if (parsed) {
        articles.push(parsed);
      }
    }
    await sleep(100);
  }

  return { articles, errors };
}

async function crawlReddit(source: NewsSource): Promise<{ articles: RawArticle[]; errors: string[] }> {
  const errors: string[] = [];
  const articles: RawArticle[] = [];

  const result = await fetchSource(source);
  if (!result.success || !result.data) {
    errors.push(result.error || 'Failed to fetch Reddit');
    return { articles, errors };
  }

  try {
    const response = JSON.parse(result.data) as RedditResponse;
    const parsed = parseRedditResponse(response);
    articles.push(...parsed);
  } catch (error) {
    errors.push('Failed to parse Reddit response');
  }

  return { articles, errors };
}

async function crawlRss(source: NewsSource): Promise<{ articles: RawArticle[]; errors: string[] }> {
  const errors: string[] = [];
  const articles: RawArticle[] = [];

  const result = await fetchSource(source);
  if (!result.success || !result.data) {
    errors.push(result.error || 'Failed to fetch RSS');
    return { articles, errors };
  }

  try {
    const parsed = parseRssFeed(result.data, source.name);
    articles.push(...parsed);
  } catch (error) {
    errors.push('Failed to parse RSS feed');
  }

  return { articles, errors };
}

async function crawlSource(source: NewsSource): Promise<CrawlResult> {
  const startTime = Date.now();
  let rawArticles: RawArticle[] = [];
  const errors: string[] = [];

  console.log(`Starting crawl for ${source.displayName}`);

  try {
    if (source.name === 'hackernews') {
      const result = await crawlHackerNews();
      rawArticles = result.articles;
      errors.push(...result.errors);
    } else if (source.name === 'reddit') {
      const result = await crawlReddit(source);
      rawArticles = result.articles;
      errors.push(...result.errors);
    } else if (source.type === 'rss') {
      const result = await crawlRss(source);
      rawArticles = result.articles;
      errors.push(...result.errors);
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown crawl error');
  }

  const existingUrls = await getExistingUrls(source.name);
  const newArticles = rawArticles
    .filter((a) => !existingUrls.has(a.url))
    .map((a) => toArticle(a, source.name));

  let savedCount = 0;
  if (newArticles.length > 0) {
    savedCount = await saveArticles(newArticles);
  }

  const durationMs = Date.now() - startTime;
  console.log(
    `Completed crawl for ${source.displayName}: ${rawArticles.length} found, ${savedCount} saved in ${durationMs}ms`
  );

  return {
    source: source.name,
    articlesFound: rawArticles.length,
    articlesSaved: savedCount,
    errors,
    durationMs,
  };
}

export async function runDailyCrawl(): Promise<CrawlSummary> {
  const startedAt = new Date();
  console.log(`Starting daily news crawl at ${startedAt.toISOString()}`);

  const sources = getEnabledSources();
  const results: CrawlResult[] = [];

  for (const source of sources) {
    try {
      const result = await crawlSource(source);
      results.push(result);
      await sleep(source.delayMs);
    } catch (error) {
      console.error(`Failed to crawl ${source.displayName}:`, error);
      results.push({
        source: source.name,
        articlesFound: 0,
        articlesSaved: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        durationMs: 0,
      });
    }
  }

  const completedAt = new Date();
  const totalFound = results.reduce((sum, r) => sum + r.articlesFound, 0);
  const totalSaved = results.reduce((sum, r) => sum + r.articlesSaved, 0);

  console.log(`Daily crawl completed at ${completedAt.toISOString()}`);
  console.log(`Total: ${totalFound} articles found, ${totalSaved} saved`);

  return {
    startedAt,
    completedAt,
    totalArticlesFound: totalFound,
    totalArticlesSaved: totalSaved,
    sourceResults: results,
  };
}

export { getEnabledSources, type NewsSource } from './sources.js';
