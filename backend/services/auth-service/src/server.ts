import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { createContainer } from './infrastructure/container';
import { createAuthRoutes } from './infrastructure/http/routes/auth.routes';
import { errorHandler } from './infrastructure/http/errors/error-handler';
import { rateLimiter } from './infrastructure/http/middlewares/rate-limiter.middleware';
import { env } from './infrastructure/config/env';
import { logger } from './infrastructure/config/logger';
import { swaggerSpec } from './infrastructure/http/swagger';
import { disconnectPrisma } from './infrastructure/database/prisma-client';

const app = express();

// Global middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => (req as any).url === '/health' } }));
app.use(rateLimiter(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX_REQUESTS));

// Swagger docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'FastMeals Auth API',
}));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    service: 'auth-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs: '/docs',
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
  logger.info({ port: env.PORT, env: env.NODE_ENV }, '🔐 Auth service running');
  logger.info({ url: `http://localhost:${env.PORT}/docs` }, '📚 Swagger docs available');
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Graceful shutdown initiated');

  server.close(async () => {
    logger.info('HTTP server closed');

    await container.redisTokenStore.disconnect();
    logger.info('Redis disconnected');

    await disconnectPrisma();
    logger.info('Database disconnected');

    logger.info('👋 Auth service shut down gracefully');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;