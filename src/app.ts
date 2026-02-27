import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.js';
import { authMiddleware, type AuthenticatedRequest } from './middleware/auth.js';
import type { ApiResponse } from './types/index.js';

export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    const response: ApiResponse<{ status: string; timestamp: string }> = {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
      },
    };
    res.json(response);
  });

  app.use('/auth', authRouter);

  app.get('/me', authMiddleware, (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const response: ApiResponse<{ userId: string; email: string }> = {
      success: true,
      data: {
        userId: authReq.user.userId,
        email: authReq.user.email,
      },
    };
    res.json(response);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
