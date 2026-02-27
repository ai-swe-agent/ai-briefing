import type { NewsSourceType, HtmlSelectors } from '../types/index.js';

export interface NewsSourceConfig {
  name: string;
  type: NewsSourceType;
  url: string;
  selectors?: HtmlSelectors;
  rateLimitMs: number;
  aiKeywords: string[];
}

export const AI_RELEVANCE_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'deep learning',
  'neural network', 'llm', 'large language model', 'gpt', 'transformer',
  'natural language processing', 'nlp', 'computer vision', 'robotics',
  'automation', 'chatbot', 'openai', 'anthropic', 'deepmind', 'google ai',
  'meta ai', 'microsoft ai', 'generative ai', 'diffusion model', 'stable diffusion',
  'midjourney', 'claude', 'gemini', 'copilot', 'agent', 'rag', 'embedding',
];

export const DEFAULT_NEWS_SOURCES: NewsSourceConfig[] = [
  {
    name: 'hackernews',
    type: 'rss',
    url: 'https://hnrss.org/frontpage',
    rateLimitMs: 2000,
    aiKeywords: AI_RELEVANCE_KEYWORDS,
  },
  {
    name: 'reddit_machinelearning',
    type: 'rss',
    url: 'https://www.reddit.com/r/MachineLearning/.rss',
    rateLimitMs: 3000,
    aiKeywords: AI_RELEVANCE_KEYWORDS,
  },
  {
    name: 'reddit_artificial',
    type: 'rss',
    url: 'https://www.reddit.com/r/artificial/.rss',
    rateLimitMs: 3000,
    aiKeywords: AI_RELEVANCE_KEYWORDS,
  },
  {
    name: 'mit_ai_news',
    type: 'rss',
    url: 'https://news.mit.edu/topic/artificial-intelligence2-rss.xml',
    rateLimitMs: 2000,
    aiKeywords: AI_RELEVANCE_KEYWORDS,
  },
  {
    name: 'openai_blog',
    type: 'rss',
    url: 'https://openai.com/blog/rss.xml',
    rateLimitMs: 2000,
    aiKeywords: AI_RELEVANCE_KEYWORDS,
  },
  {
    name: 'google_ai_blog',
    type: 'rss',
    url: 'https://blog.google/technology/ai/rss/',
    rateLimitMs: 2000,
    aiKeywords: AI_RELEVANCE_KEYWORDS,
  },
];

export const CRAWL_CONFIG = {
  defaultRateLimitMs: 1000,
  maxRetries: 3,
  retryDelayMs: 5000,
  maxFailuresBeforeDisable: 10,
  dailyCrawlHour: 6,
  dailyCrawlMinute: 0,
  requestTimeoutMs: 30000,
  maxArticlesPerSource: 50,
};
