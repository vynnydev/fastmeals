import { vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.PORT = '3002';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5434/test_db';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-10-chars';
process.env.CORS_ORIGIN = 'http://localhost:3000';

afterEach(() => {
  vi.restoreAllMocks();
});