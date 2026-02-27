import { crawlAllSources } from './newsCrawler.js';
import { closePool } from '../db/index.js';

async function main(): Promise<void> {
  console.log('Starting manual crawl run...');
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('---');

  try {
    const results = await crawlAllSources();

    console.log('\n=== Summary ===');
    for (const result of results) {
      const status = result.status === 'success' ? '✓' : result.status === 'partial' ? '~' : '✗';
      console.log(`${status} ${result.sourceName}: ${result.articlesNew} new, ${result.articlesDuplicate} dupes (${result.durationMs}ms)`);
      if (result.errorMessage) {
        console.log(`  Error: ${result.errorMessage}`);
      }
    }
  } catch (error) {
    console.error('Crawl failed:', error);
    process.exit(1);
  } finally {
    await closePool();
  }
}

main();
