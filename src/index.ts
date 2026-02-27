import { createApp } from './app.js';
import { config } from './config/index.js';
import { closePool } from './db/index.js';
import { stopAllJobs } from './utils/cron.js';
import { initializeCrawlJob } from './jobs/crawlJob.js';
const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  initializeCrawlJob();
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
