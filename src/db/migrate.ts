import { readdir, readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pool, query } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
}

async function getExecutedMigrations(): Promise<Set<string>> {
  const result = await query<{ name: string }>('SELECT name FROM migrations ORDER BY id');
  return new Set(result.rows.map(row => row.name));
}

async function runMigrations(): Promise<void> {
  console.log('Starting database migrations...');

  await ensureMigrationsTable();
  const executed = await getExecutedMigrations();

  const migrationsDir = join(__dirname, 'migrations');
  let files: string[];
  
  try {
    files = await readdir(migrationsDir);
  } catch {
    console.log('No migrations directory found');
    return;
  }

  const sqlFiles = files
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of sqlFiles) {
    if (executed.has(file)) {
      console.log(`Skipping already executed migration: ${file}`);
      continue;
    }

    console.log(`Running migration: ${file}`);
    const filePath = join(migrationsDir, file);
    const sql = await readFile(filePath, 'utf-8');

    try {
      await query(sql);
      await query('INSERT INTO migrations (name) VALUES ($1)', [file]);
      console.log(`Migration ${file} completed successfully`);
    } catch (error) {
      console.error(`Migration ${file} failed:`, error);
      throw error;
    }
  }

  console.log('All migrations completed');
}

async function main(): Promise<void> {
  try {
    await runMigrations();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
