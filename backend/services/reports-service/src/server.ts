import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { createContainer } from './infrastructure/container';
import { createReportRoutes } from './infrastructure/http/routes/report.routes';
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
  customSiteTitle: 'FastMeals Reports API',
}));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    service: 'reports-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs: '/docs',
    features: {
      ai: env.AWS_ACCESS_KEY_ID ? 'bedrock' : 'fallback',
    },
  });
});

// Dependency injection container
const container = createContainer();

// Routes
app.use('/api/reports', createReportRoutes(container.reportController));

// Error handler
app.use(errorHandler);

// Start server
const server = app.listen(env.PORT, () => {
  logger.info({ port: env.PORT, env: env.NODE_ENV }, '📊 Reports service running');
  logger.info({ ai: env.AWS_ACCESS_KEY_ID ? `AWS Bedrock (${env.BEDROCK_MODEL_ID})` : 'Fallback mode' }, 'AI configuration');
  logger.info({ url: `http://localhost:${env.PORT}/docs` }, '📚 Swagger docs available');
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info({ signal }, 'Graceful shutdown initiated');

  server.close(async () => {
    logger.info('HTTP server closed');

    await disconnectPrisma();
    logger.info('Database disconnected');

    logger.info('👋 Reports service shut down gracefully');
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