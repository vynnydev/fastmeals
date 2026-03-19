import { vi } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.PORT = '3006';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5437/test_db';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-at-least-10-chars';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.AWS_REGION = 'us-east-1';
process.env.BEDROCK_MODEL_ID = 'anthropic.claude-haiku-4-5-20251001';

afterEach(() => {
  vi.restoreAllMocks();
});