import { afterEach, vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.PORT = '3005';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-10-chars';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.ORDERS_SERVICE_URL = 'http://localhost:3003';
process.env.DELIVERY_SERVICE_URL = 'http://localhost:3004';

afterEach(() => {
  vi.restoreAllMocks();
});