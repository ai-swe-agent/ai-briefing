/**
 * Tests for /api/articles endpoint - News Dashboard Feature
 * Tests cover pagination, filtering by category/date, search, and response format
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import type { Application } from 'express';
import type { Article } from '../src/types/index.js';

describe('GET /api/articles', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  describe('AC-1: Pagination Functionality', () => {
    it('TC-1: should return paginated articles with default page and pageSize', async () => {
      const response = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('page', 1);
      expect(response.body.data).toHaveProperty('pageSize', 20);
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('TC-2: should respect custom page and pageSize parameters', async () => {
      const response = await request(app)
        .get('/api/articles?page=2&pageSize=10')
        .expect(200);

      expect(response.body.data.page).toBe(2);
      expect(response.body.data.pageSize).toBe(10);
    });

    it('TC-3: should return empty items array for page beyond total pages', async () => {
      const response = await request(app)
        .get('/api/articles?page=999')
        .expect(200);

      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.page).toBe(999);
    });

    it('TC-4: should handle invalid pagination parameters gracefully', async () => {
      const response = await request(app)
        .get('/api/articles?page=-1&pageSize=-5')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('page');
    });
  });

  describe('AC-2: Category Filtering', () => {
    it('TC-5: should filter articles by single category', async () => {
      const response = await request(app)
        .get('/api/articles?category=AI')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
    });

    it('TC-6: should return empty array for non-existent category', async () => {
      const response = await request(app)
        .get('/api/articles?category=NonExistent')
        .expect(200);

      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('AC-3: Date Filtering', () => {
    it('TC-8: should filter articles by start date', async () => {
      const response = await request(app)
        .get('/api/articles?startDate=2024-01-01')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
    });

    it('TC-9: should filter articles by end date', async () => {
      const response = await request(app)
        .get('/api/articles?endDate=2024-01-31')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
    });

    it('TC-10: should filter articles by date range', async () => {
      const response = await request(app)
        .get('/api/articles?startDate=2024-01-01&endDate=2024-01-31')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
    });

    it('TC-11: should handle invalid date format', async () => {
      const response = await request(app)
        .get('/api/articles?startDate=invalid-date')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('date');
    });
  });

  describe('AC-4: Search Functionality', () => {
    it('TC-12: should search articles by title', async () => {
      const response = await request(app)
        .get('/api/articles?search=AI Revolution')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('items');
    });

    it('TC-13: should search articles by content', async () => {
      const response = await request(app)
        .get('/api/articles?search=machine learning')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('TC-14: should return empty results for no matches', async () => {
      const response = await request(app)
        .get('/api/articles?search=xyznonexistent')
        .expect(200);

      expect(response.body.data.items).toEqual([]);
      expect(response.body.data.total).toBe(0);
    });
  });

  describe('AC-5: Combined Filtering', () => {
    it('TC-15: should apply multiple filters simultaneously', async () => {
      const response = await request(app)
        .get('/api/articles?category=AI&startDate=2024-01-01&page=1')
        .expect(200);

      expect(response.body.data.items).toBeDefined();
      expect(response.body.data.page).toBe(1);
    });
  });

  describe('AC-6: Response Format Compliance', () => {
    it('TC-16: should return API response wrapper format', async () => {
      const response = await request(app)
        .get('/api/articles')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data).toHaveProperty('total');
      expect(response.body.data).toHaveProperty('page');
      expect(response.body.data).toHaveProperty('pageSize');
      expect(response.body.data).toHaveProperty('totalPages');
    });
  });

  describe('Edge Cases', () => {
    it('EC-1: should handle special characters in search query', async () => {
      const response = await request(app)
        .get('/api/articles?search=test%20query%20%26%20more')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('EC-2: should handle very large pageSize gracefully', async () => {
      const response = await request(app)
        .get('/api/articles?pageSize=10000')
        .expect(200);

      expect(response.body.data.pageSize).toBeLessThanOrEqual(100);
    });
  });
});
