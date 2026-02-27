import dotenv from 'dotenv';
import type { EnvConfig } from '../types/index.js';

dotenv.config();

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const config: EnvConfig = {
  port: parseInt(getOptionalEnv('PORT', '3000'), 10),
  nodeEnv: getOptionalEnv('NODE_ENV', 'development'),
  databaseUrl: getRequiredEnv('DATABASE_URL'),
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  jwtExpiresIn: getOptionalEnv('JWT_EXPIRES_IN', '7d'),
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';

export default config;
