import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createContainer } from './infrastructure/container';
import { createReportRoutes } from './infrastructure/http/routes/report.routes';
import { errorHandler } from './infrastructure/http/errors/error-handler';
import { rateLimiter } from './infrastructure/http/middlewares/rate-limiter.middleware';
import { env } from './infrastructure/config/env';
import { disconnectPrisma } from './infrastructure/database/prisma-client';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimiter(env.RATE_LIMIT_WINDOW_MS, env.RATE_LIMIT_MAX_REQUESTS));

app.get('/health', (_req, res) => {
  res.status(200).json({
    service: 'reports-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    features: {
      ai: env.AWS_ACCESS_KEY_ID ? 'bedrock' : 'fallback',
    },
  });
});

const container = createContainer();

app.use('/api/reports', createReportRoutes(container.reportController));

app.use(errorHandler);

const server = app.listen(env.PORT, () => {
  console.log(`📊 Reports service running on port ${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health: http://localhost:${env.PORT}/health`);
  console.log(`   AI: ${env.AWS_ACCESS_KEY_ID ? 'AWS Bedrock (' + env.BEDROCK_MODEL_ID + ')' : 'Fallback mode (no AWS credentials)'}`);
});

const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Shutting down...`);

  server.close(async () => {
    console.log('  ✅ HTTP server closed');
    await disconnectPrisma();
    console.log('  ✅ Database disconnected');
    console.log('👋 Reports service shut down');
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;