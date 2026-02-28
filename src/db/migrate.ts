import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, closePool, testConnection } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function runMigrations(): Promise<void> {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Cannot run migrations: database connection failed');
    process.exit(1);
  }

  const migrationFiles = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('No migration files found');
    return;
  }

  console.log(`Found ${migrationFiles.length} migration file(s)`);

  for (const file of migrationFiles) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`Running migration: ${file}`);

    try {
      await query(sql);
      console.log(`Migration completed: ${file}`);
    } catch (error) {
      console.error(`Migration failed: ${file}`, error);
      process.exit(1);
    }
  }

  console.log('All migrations completed successfully');
}

runMigrations()
  .catch((error) => {
    console.error('Migration error:', error);
    process.exit(1);
  })
  .finally(() => {
    closePool();
  });
