import { createApp } from './app.js';
import { config } from './config/index.js';
import { closePool } from './db/index.js';
import { stopAllJobs, scheduleDailyJob } from './utils/cron.js';
import { crawlAllSources } from './services/newsCrawler.js';
import { CRAWL_CONFIG } from './config/newsSources.js';

const app = createApp();

scheduleDailyJob(
  'daily-news-crawl',
  CRAWL_CONFIG.dailyCrawlHour,
  CRAWL_CONFIG.dailyCrawlMinute,
  async () => {
    console.log('Starting daily news crawl...');
    try {
      const results = await crawlAllSources();
      const totalNew = results.reduce((sum, r) => sum + r.articlesNew, 0);
      console.log(`Daily crawl completed: ${totalNew} new articles from ${results.length} sources`);
    } catch (error) {
      console.error('Daily crawl failed:', error);
    }
  }
);

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  console.log(`Daily crawl scheduled for ${CRAWL_CONFIG.dailyCrawlHour}:${CRAWL_CONFIG.dailyCrawlMinute.toString().padStart(2, '0')} UTC`);
});

function gracefulShutdown(signal: string): void {
  console.log(`${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('HTTP server closed');

    stopAllJobs();
    console.log('Scheduled jobs stopped');

    await closePool();
    console.log('Database connections closed');

    console.log('Graceful shutdown complete');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));