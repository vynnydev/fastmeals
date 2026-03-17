import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createContainer } from './infrastructure/container';
import { createAuthRoutes } from './infrastructure/http/routes/auth.routes';
import { errorHandler } from './infrastructure/http/errors/error-handler';
import { rateLimiter } from './infrastructure/http/middlewares/rate-limiter.middleware';
import { env } from './infrastructure/config/env';
import { disconnectPrisma } from './infrastructure/database/prisma-client';

const app = express();

// Global middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimiter(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX_REQUESTS));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Dependency injection container
const container = createContainer();

// Routes
app.use('/api/auth', createAuthRoutes(container.authController));

// Error handler (must be last middleware)
app.use(errorHandler);

// Start server
const server = app.listen(env.PORT, () => {
  console.log(`🔐 Auth service running on port ${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${env.PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  server.close(async () => {
    console.log('  ✅ HTTP server closed');

    await container.redisTokenStore.disconnect();
    console.log('  ✅ Redis disconnected');

    await disconnectPrisma();
    console.log('  ✅ Database disconnected');

    console.log('👋 Auth service shut down gracefully');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;