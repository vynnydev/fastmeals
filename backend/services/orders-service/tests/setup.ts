import { vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.PORT = '3003';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5435/test_db';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-10-chars';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.PRODUCTS_SERVICE_URL = 'http://localhost:3002';
process.env.DELIVERY_SERVICE_URL = 'http://localhost:3004';
process.env.RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';

afterEach(() => {
  vi.restoreAllMocks();
});