import * as cheerio from 'cheerio';
import type { Article, ArticleSource } from '../types/index.js';

export interface RawArticle {
  title: string;
  url: string;
  content: string;
  publishedAt: Date;
}

export function parseRssFeed(xml: string, source: ArticleSource): RawArticle[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const articles: RawArticle[] = [];

  $('item').each((_, element) => {
    const title = $(element).find('title').text().trim();
    const url = $(element).find('link').text().trim();
    const content =
      $(element).find('description').text().trim() ||
      $(element).find('content\\:encoded').text().trim();
    const pubDate = $(element).find('pubDate').text().trim();

    if (title && url) {
      articles.push({
        title,
        url,
        content: content || '',
        publishedAt: pubDate ? new Date(pubDate) : new Date(),
      });
    }
  });

  return articles;
}

export interface HackerNewsItem {
  id: number;
  title: string;
  url?: string;
  text?: string;
  time: number;
  score: number;
  type: string;
}

export function parseHackerNewsItem(item: HackerNewsItem): RawArticle | null {
  if (!item.title || item.type !== 'story') {
    return null;
  }

  return {
    title: item.title,
    url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
    content: item.text || '',
    publishedAt: new Date(item.time * 1000),
  };
}

export interface RedditPost {
  data: {
    title: string;
    url: string;
    selftext: string;
    created_utc: number;
    permalink: string;
    is_self: boolean;
  };
}

export interface RedditResponse {
  data: {
    children: RedditPost[];
  };
}

export function parseRedditResponse(response: RedditResponse): RawArticle[] {
  const articles: RawArticle[] = [];

  for (const post of response.data.children) {
    const { title, url, selftext, created_utc, permalink, is_self } = post.data;

    if (title) {
      articles.push({
        title,
        url: is_self ? `https://reddit.com${permalink}` : url,
        content: selftext || '',
        publishedAt: new Date(created_utc * 1000),
      });
    }
  }

  return articles;
}

export function toArticle(raw: RawArticle, source: ArticleSource): Omit<Article, 'id' | 'crawledAt'> {
  return {
    title: raw.title.substring(0, 500),
    url: raw.url,
    source,
    content: raw.content.substring(0, 10000),
    publishedAt: raw.publishedAt,
  };
}
