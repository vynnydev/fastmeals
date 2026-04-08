import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/server.ts',
        'src/lambda/**',
        'src/application/dtos/**',
        'src/application/interfaces/**',
        'src/domain/repositories/**',
        'src/infrastructure/config/**',
        'src/infrastructure/container/**',
        'src/infrastructure/database/**',
        'src/infrastructure/http/swagger.ts',
      ],
    },
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@application': path.resolve(__dirname, 'src/application'),
      '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
      '@lambda': path.resolve(__dirname, 'src/lambda'),
    },
  },
});