import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createContainer } from './infrastructure/container';
import { createOptimizationRoutes } from './infrastructure/http/routes/optimization.routes';
import { errorHandler } from './infrastructure/http/errors/error-handler';
import { rateLimiter } from './infrastructure/http/middlewares/rate-limiter.middleware';
import { env } from './infrastructure/config/env';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimiter(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX_REQUESTS));

app.get('/health', (_req, res) => {
  res.status(200).json({
    service: 'optimization-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

const container = createContainer();

// Mount on /api/orders because the spec expects POST /api/orders/optimize-assignment
app.use('/api/orders', createOptimizationRoutes(container.optimizationController));

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`🧠 Optimization service running on port ${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${env.PORT}/health`);
  console.log(`   Algorithm: Hungarian (Kuhn-Munkres) O(n³)`);
});

const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Shutting down...`);
  server.close(() => {
    console.log('👋 Optimization service shut down');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;