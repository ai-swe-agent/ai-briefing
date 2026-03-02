import { vi } from 'vitest';

// Mock environment variables before any imports
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

// Mock the database module
vi.mock('../src/db/index.js', () => ({
  query: vi.fn().mockImplementation(async (sql: string) => {
    // Return mock data based on the query
    if (sql.includes('COUNT(*)')) {
      return { rows: [{ count: '0' }], rowCount: 1 };
    }
    if (sql.includes('SELECT DISTINCT category')) {
      return { rows: [], rowCount: 0 };
    }
    return { rows: [], rowCount: 0 };
  }),
  pool: {
    query: vi.fn(),
    end: vi.fn(),
    on: vi.fn(),
  },
  testConnection: vi.fn().mockResolvedValue(true),
  closePool: vi.fn().mockResolvedValue(undefined),
  default: {
    query: vi.fn(),
    pool: {},
    testConnection: vi.fn(),
    closePool: vi.fn(),
  },
}));
