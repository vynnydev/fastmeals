import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { createContainer } from './infrastructure/container';
import { createOptimizationRoutes } from './infrastructure/http/routes/optimization.routes';
import { errorHandler } from './infrastructure/http/errors/error-handler';
import { rateLimiter } from './infrastructure/http/middlewares/rate-limiter.middleware';
import { env } from './infrastructure/config/env';
import { logger } from './infrastructure/config/logger';
import { swaggerSpec } from './infrastructure/http/swagger';

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
  customSiteTitle: 'FastMeals Optimization API',
}));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    service: 'optimization-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs: '/docs',
    algorithm: 'hungarian',
  });
});

// Dependency injection container
const container = createContainer();

// Mount on /api/orders because the spec expects POST /api/orders/optimize-assignment
app.use('/api/orders', createOptimizationRoutes(container.optimizationController));

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, '🧠 Optimization service running');
  logger.info('Algorithm: Hungarian (Kuhn-Munkres) O(n³)');
  logger.info({ url: `http://localhost:${env.PORT}/docs` }, '📚 Swagger docs available');
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Graceful shutdown initiated');
  server.close(() => {
    logger.info('👋 Optimization service shut down');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;