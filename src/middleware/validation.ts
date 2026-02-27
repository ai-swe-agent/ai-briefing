import type { Request, Response, NextFunction } from 'express';
import { ValidationError } from './errorHandler.js';

export function validatePaginationParams(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { page, pageSize } = req.query;

  if (page !== undefined) {
    const pageNum = parseInt(page as string, 10);
    if (isNaN(pageNum) || pageNum < 1) {
      return next(new ValidationError('Page must be a positive integer'));
    }
  }

  if (pageSize !== undefined) {
    const pageSizeNum = parseInt(pageSize as string, 10);
    if (isNaN(pageSizeNum) || pageSizeNum < 1 || pageSizeNum > 100) {
      return next(new ValidationError('PageSize must be between 1 and 100'));
    }
  }

  next();
}

export function validateDateParams(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { fromDate, toDate } = req.query;

  if (fromDate !== undefined) {
    const date = new Date(fromDate as string);
    if (isNaN(date.getTime())) {
      return next(new ValidationError('fromDate must be a valid ISO 8601 date'));
    }
  }

  if (toDate !== undefined) {
    const date = new Date(toDate as string);
    if (isNaN(date.getTime())) {
      return next(new ValidationError('toDate must be a valid ISO 8601 date'));
    }
  }

  next();
}

export function validateSearchQuery(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const { q } = req.query;

  if (q !== undefined && typeof q === 'string') {
    if (q.trim().length === 0) {
      return next(new ValidationError('Search query cannot be empty'));
    }
    if (q.length > 200) {
      return next(new ValidationError('Search query is too long (max 200 characters)'));
    }
  }

  next();
}

export default {
  validatePaginationParams,
  validateDateParams,
  validateSearchQuery,
};
