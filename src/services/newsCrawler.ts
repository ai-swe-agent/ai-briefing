import { extract } from '@extractus/feed-extractor';
import * as cheerio from 'cheerio';
import type { NewsSource, CrawlResult, HtmlSelectors } from '../types/index.js';
import { AI_RELEVANCE_KEYWORDS, CRAWL_CONFIG } from '../config/newsSources.js';
import {
  getEnabledSources,
  updateSourceLastCrawled,
  incrementSourceFailure,
  checkArticleExists,
  createArticle,
  createCrawlLog,
  generateContentHash,
} from '../repositories/newsRepository.js';

const STALE_ENTRY_THRESHOLD_MS = 60 * 60 * 1000;

class DomainRateLimiter {
  private lastRequestTime: Map<string, number> = new Map();

  async waitForDomain(domain: string, delayMs: number): Promise<void> {
    this.cleanupStaleEntries();
    
    const now = Date.now();
    const lastRequest = this.lastRequestTime.get(domain) ?? 0;
    const elapsed = now - lastRequest;
    const waitTime = delayMs - elapsed;

    if (waitTime > 0) {
      await this.delay(waitTime);
    }

    this.lastRequestTime.set(domain, Date.now());
  }

  private cleanupStaleEntries(): void {
    const now = Date.now();
    for (const [domain, timestamp] of this.lastRequestTime.entries()) {
      if (now - timestamp > STALE_ENTRY_THRESHOLD_MS) {
        this.lastRequestTime.delete(domain);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const rateLimiter = new DomainRateLimiter();

function calculateRelevanceScore(title: string, content: string | null): number {
  const text = `${title} ${content ?? ''}`.toLowerCase();
  let matchCount = 0;

  for (const keyword of AI_RELEVANCE_KEYWORDS) {
    if (text.includes(keyword.toLowerCase())) {
      matchCount++;
    }
  }

  const score = Math.min(matchCount / 5, 1);
  return Math.round(score * 100) / 100;
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

interface ParsedArticle {
  title: string;
  url: string;
  content: string | null;
  summary: string | null;
  author: string | null;
  publishedAt: Date | null;
}

async function parseRssFeed(feedUrl: string): Promise<ParsedArticle[]> {
  try {
    const feed = await extract(feedUrl, {
      getExtraEntryFields: (feedEntry) => {
        const entry = feedEntry as Record<string, unknown>;
        return {
          author: entry['dc:creator'] ?? entry['author'] ?? null,
          content: entry['content:encoded'] ?? entry['content'] ?? null,
        };
      },
    });

    if (!feed.entries) {
      return [];
    }

    return feed.entries.slice(0, CRAWL_CONFIG.maxArticlesPerSource).map(entry => ({
      title: entry.title ?? 'Untitled',
      url: entry.link ?? '',
      content: (entry as { content?: string }).content ?? null,
      summary: entry.description?.substring(0, 1000) ?? null,
      author: (entry as { author?: string }).author ?? null,
      publishedAt: entry.published ? new Date(entry.published) : null,
    }));
  } catch (error) {
    console.error(`Failed to parse RSS feed ${feedUrl}:`, error instanceof Error ? error.message : error);
    return [];
  }
}

async function parseHtmlPage(url: string, selectors: HtmlSelectors): Promise<ParsedArticle[]> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CRAWL_CONFIG.requestTimeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AI-Briefing-Bot/1.0 (+https://github.com/ogulcansarioglu/ai-briefing)',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const articles: ParsedArticle[] = [];

    $(selectors.articleSelector).slice(0, CRAWL_CONFIG.maxArticlesPerSource).each((_, element) => {
      const $el = $(element);
      const title = $el.find(selectors.titleSelector).text().trim();
      let link = $el.find(selectors.linkSelector).attr('href') ?? '';

      if (link && !link.startsWith('http')) {
        link = new URL(link, url).toString();
      }

      if (title && link) {
        articles.push({
          title,
          url: link,
          content: null,
          summary: selectors.summarySelector ? $el.find(selectors.summarySelector).text().trim() : null,
          author: null,
          publishedAt: null,
        });
      }
    });

    return articles;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function crawlSource(source: NewsSource): Promise<CrawlResult> {
  const startTime = Date.now();
  const domain = getDomain(source.url);

  try {
    await rateLimiter.waitForDomain(domain, source.rateLimitMs);

    let articles: ParsedArticle[];

    if (source.type === 'rss') {
      articles = await parseRssFeed(source.url);
    } else if (source.type === 'html' && source.selectors) {
      articles = await parseHtmlPage(source.url, source.selectors);
    } else {
      throw new Error(`Unsupported source type: ${source.type}`);
    }

    let articlesNew = 0;
    let articlesDuplicate = 0;

    for (const article of articles) {
      if (!article.url) continue;

      const contentHash = generateContentHash(article.title, article.url);
      const exists = await checkArticleExists(contentHash);

      if (exists) {
        articlesDuplicate++;
        continue;
      }

      const relevanceScore = calculateRelevanceScore(article.title, article.content);

      const created = await createArticle({
        title: article.title,
        url: article.url,
        source: source.name,
        sourceId: source.id,
        content: article.content,
        summary: article.summary,
        author: article.author,
        publishedAt: article.publishedAt,
        contentHash,
        relevanceScore,
      });

      if (created) {
        articlesNew++;
      } else {
        articlesDuplicate++;
      }
    }

    await updateSourceLastCrawled(source.id);

    const durationMs = Date.now() - startTime;
    const result: CrawlResult = {
      sourceName: source.name,
      status: articlesNew > 0 ? 'success' : 'partial',
      articlesFound: articles.length,
      articlesNew,
      articlesDuplicate,
      durationMs,
    };

    await createCrawlLog({
      sourceId: source.id,
      sourceName: source.name,
      status: result.status,
      articlesFound: result.articlesFound,
      articlesNew: result.articlesNew,
      articlesDuplicate: result.articlesDuplicate,
      errorMessage: null,
      durationMs,
    });

    return result;
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await incrementSourceFailure(source.id, CRAWL_CONFIG.maxFailuresBeforeDisable);

    await createCrawlLog({
      sourceId: source.id,
      sourceName: source.name,
      status: 'failed',
      articlesFound: 0,
      articlesNew: 0,
      articlesDuplicate: 0,
      errorMessage,
      durationMs,
    });

    return {
      sourceName: source.name,
      status: 'failed',
      articlesFound: 0,
      articlesNew: 0,
      articlesDuplicate: 0,
      errorMessage,
      durationMs,
    };
  }
}

export async function crawlAllSources(): Promise<CrawlResult[]> {
  console.log('Starting news crawl...');
  const sources = await getEnabledSources();

  if (sources.length === 0) {
    console.log('No enabled sources found');
    return [];
  }

  console.log(`Found ${sources.length} enabled sources`);

  const results: CrawlResult[] = [];

  for (const source of sources) {
    console.log(`Crawling: ${source.name}`);
    const result = await crawlSource(source);
    results.push(result);
    console.log(`  ${source.name}: ${result.status} - ${result.articlesNew} new, ${result.articlesDuplicate} duplicates`);
  }

  const totalNew = results.reduce((sum, r) => sum + r.articlesNew, 0);
  const totalDuplicates = results.reduce((sum, r) => sum + r.articlesDuplicate, 0);
  const failedSources = results.filter(r => r.status === 'failed').length;

  console.log(`Crawl completed: ${totalNew} new articles, ${totalDuplicates} duplicates, ${failedSources} failed sources`);

  return results;
}

export async function crawlSingleSource(sourceName: string): Promise<CrawlResult | null> {
  const sources = await getEnabledSources();
  const source = sources.find(s => s.name === sourceName);

  if (!source) {
    console.log(`Source not found: ${sourceName}`);
    return null;
  }

  return crawlSource(source);
}
