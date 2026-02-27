import { scheduleDailyJob, type ScheduledJob } from '../utils/cron.js';
import { executeCrawl } from '../services/crawlService.js';

const CRAWL_JOB_NAME = 'daily-news-crawl';
const CRAWL_HOUR_UTC = 8;
const CRAWL_MINUTE_UTC = 0;

export function initializeCrawlJob(): ScheduledJob {
  console.log('[CrawlJob] Initializing daily news crawl job...');
  
  const job = scheduleDailyJob(
    CRAWL_JOB_NAME,
    CRAWL_HOUR_UTC,
    CRAWL_MINUTE_UTC,
    async () => {
      console.log('[CrawlJob] Daily scheduled crawl starting...');
      try {
        const result = await executeCrawl();
        console.log(`[CrawlJob] Daily crawl completed. Status: ${result.status}, Articles: ${result.articlesCount}`);
      } catch (error) {
        console.error('[CrawlJob] Daily crawl failed:', error);
      }
    },
    'UTC'
  );

  console.log(`[CrawlJob] Job scheduled: ${CRAWL_JOB_NAME} at ${CRAWL_HOUR_UTC}:${CRAWL_MINUTE_UTC.toString().padStart(2, '0')} UTC`);
  return job;
}
