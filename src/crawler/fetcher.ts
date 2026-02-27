import type { NewsSource } from './sources.js';

const USER_AGENT = 'AI-Briefing-Bot/1.0 (https://github.com/ogulcansarioglu/ai-briefing)';

export interface FetchResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  delayMs = 1000
): Promise<FetchResult<string>> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': USER_AGENT,
          Accept: 'application/json, application/xml, text/xml, */*',
          ...options.headers,
        },
      });

      if (!response.ok) {
        lastError = `HTTP ${response.status}: ${response.statusText}`;
        if (response.status === 429 || response.status >= 500) {
          await sleep(delayMs * attempt);
          continue;
        }
        return { success: false, error: lastError, statusCode: response.status };
      }

      const data = await response.text();
      return { success: true, data, statusCode: response.status };
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
      if (attempt < maxRetries) {
        await sleep(delayMs * attempt);
      }
    }
  }

  return { success: false, error: lastError || 'Max retries exceeded' };
}

export async function fetchSource(source: NewsSource): Promise<FetchResult<string>> {
  console.log(`Fetching from ${source.displayName}: ${source.url}`);

  const result = await fetchWithRetry(source.url, {}, 3, source.delayMs);

  if (result.success) {
    console.log(`Successfully fetched from ${source.displayName}`);
  } else {
    console.error(`Failed to fetch from ${source.displayName}: ${result.error}`);
  }

  return result;
}

export async function fetchHackerNewsTopStories(limit = 30): Promise<FetchResult<number[]>> {
  const result = await fetchWithRetry('https://hacker-news.firebaseio.com/v0/topstories.json');

  if (!result.success || !result.data) {
    return { success: false, error: result.error };
  }

  try {
    const storyIds = JSON.parse(result.data) as number[];
    return { success: true, data: storyIds.slice(0, limit) };
  } catch (error) {
    return { success: false, error: 'Failed to parse story IDs' };
  }
}

export async function fetchHackerNewsItem(id: number): Promise<FetchResult<unknown>> {
  const result = await fetchWithRetry(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);

  if (!result.success || !result.data) {
    return { success: false, error: result.error };
  }

  try {
    const item = JSON.parse(result.data);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: 'Failed to parse item' };
  }
}
