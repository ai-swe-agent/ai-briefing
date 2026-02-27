import type { ArticleSource } from '../types/index.js';

export interface NewsSource {
  name: ArticleSource;
  displayName: string;
  url: string;
  type: 'rss' | 'api' | 'scrape';
  delayMs: number;
  enabled: boolean;
}

export const NEWS_SOURCES: NewsSource[] = [
  {
    name: 'hackernews',
    displayName: 'Hacker News',
    url: 'https://hacker-news.firebaseio.com/v0',
    type: 'api',
    delayMs: 1000,
    enabled: true,
  },
  {
    name: 'reddit',
    displayName: 'Reddit AI',
    url: 'https://www.reddit.com/r/artificial/.json',
    type: 'api',
    delayMs: 2000,
    enabled: true,
  },
  {
    name: 'provider_blog',
    displayName: 'OpenAI Blog',
    url: 'https://openai.com/blog/rss.xml',
    type: 'rss',
    delayMs: 2000,
    enabled: true,
  },
];

export function getEnabledSources(): NewsSource[] {
  return NEWS_SOURCES.filter((source) => source.enabled);
}

export function getSourceByName(name: ArticleSource): NewsSource | undefined {
  return NEWS_SOURCES.find((source) => source.name === name);
}
