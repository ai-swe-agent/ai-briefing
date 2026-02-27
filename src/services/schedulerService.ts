import { scheduleDailyJob, scheduleJob, stopJob, getScheduledJobs } from '../utils/cron.js';
import { runDailyCrawl, type CrawlSummary } from '../crawler/index.js';
import { deleteOldArticles } from './articleService.js';

const CRAWL_JOB_NAME = 'daily-news-crawl';
const CLEANUP_JOB_NAME = 'daily-article-cleanup';

let lastCrawlResult: CrawlSummary | null = null;
let isRunning = false;

export function getLastCrawlResult(): CrawlSummary | null {
  return lastCrawlResult;
}

export function isCrawlRunning(): boolean {
  return isRunning;
}

async function executeCrawl(): Promise<void> {
  if (isRunning) {
    console.log('Crawl already in progress, skipping');
    return;
  }

  isRunning = true;
  try {
    lastCrawlResult = await runDailyCrawl();
  } catch (error) {
    console.error('Daily crawl failed:', error);
  } finally {
    isRunning = false;
  }
}

async function executeCleanup(): Promise<void> {
  try {
    const deleted = await deleteOldArticles(30);
    console.log(`Deleted ${deleted} old articles`);
  } catch (error) {
    console.error('Article cleanup failed:', error);
  }
}

export function initializeScheduledJobs(): void {
  console.log('Initializing scheduled jobs...');

  scheduleDailyJob(CRAWL_JOB_NAME, 6, 0, executeCrawl);
  console.log('Scheduled daily news crawl at 06:00 UTC');

  scheduleDailyJob(CLEANUP_JOB_NAME, 3, 0, executeCleanup);
  console.log('Scheduled daily article cleanup at 03:00 UTC');

  const jobs = getScheduledJobs();
  console.log(`Total scheduled jobs: ${jobs.length}`);
}

export async function triggerManualCrawl(): Promise<CrawlSummary | null> {
  if (isRunning) {
    console.log('Crawl already in progress');
    return null;
  }

  await executeCrawl();
  return lastCrawlResult;
}

export function stopCrawlJob(): boolean {
  return stopJob(CRAWL_JOB_NAME);
}

export function stopCleanupJob(): boolean {
  return stopJob(CLEANUP_JOB_NAME);
}
