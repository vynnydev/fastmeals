import { vi } from 'vitest';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/test_db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-10-chars';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-at-least-10-chars';
process.env.JWT_ACCESS_EXPIRATION = '15m';
process.env.JWT_REFRESH_EXPIRATION = '7d';
process.env.CORS_ORIGIN = 'http://localhost:3000';

// Clean up after each test
afterEach(() => {
  vi.restoreAllMocks();
});