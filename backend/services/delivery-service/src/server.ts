import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import swaggerUi from 'swagger-ui-express';
import { createContainer } from './infrastructure/container';
import { createDeliveryPersonRoutes } from './infrastructure/http/routes/delivery-person.routes';
import { errorHandler } from './infrastructure/http/errors/error-handler';
import { rateLimiter } from './infrastructure/http/middlewares/rate-limiter.middleware';
import { env } from './infrastructure/config/env';
import { logger } from './infrastructure/config/logger';
import { swaggerSpec } from './infrastructure/http/swagger';
import { disconnectPrisma } from './infrastructure/database/prisma-client';
import { connectRabbitMQ, disconnectRabbitMQ } from './infrastructure/messaging/rabbitmq-client';
import { DeliveryEventConsumer } from './infrastructure/messaging/event-consumer';

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
  customSiteTitle: 'FastMeals Delivery API',
}));

// Health check
app.get('/health', (_req, res) => {
  res.status(200).json({
    service: 'delivery-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    docs: '/docs',
  });
});

// Dependency injection container
const container = createContainer();

// Routes
app.use('/api/delivery-persons', createDeliveryPersonRoutes(container.deliveryPersonController));

// Error handler
app.use(errorHandler);

// Start server
async function start(): Promise<void> {
  // Connect to RabbitMQ
  try {
    const channel = await connectRabbitMQ(env.RABBITMQ_URL);

    if (channel) {
      const consumer = new DeliveryEventConsumer(channel);
      await consumer.setup();

      await consumer.consumeOrderStatusChanged(async (event) => {
        if (
          event.deliveryPersonId &&
          (event.newStatus === 'delivered' || event.newStatus === 'cancelled')
        ) {
          logger.info(
            { deliveryPersonId: event.deliveryPersonId, orderId: event.orderId, status: event.newStatus },
            'Delivery person is now FREE',
          );
        }

        if (event.deliveryPersonId && event.newStatus === 'delivering') {
          logger.info(
            { deliveryPersonId: event.deliveryPersonId, orderId: event.orderId },
            'Delivery person is now BUSY',
          );
        }
      });
    }

    logger.info('🐰 RabbitMQ messaging ready');
  } catch (error) {
    logger.warn('RabbitMQ not available — running without messaging');
  }

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, '🚴 Delivery service running');
    logger.info({ url: `http://localhost:${env.PORT}/docs` }, '📚 Swagger docs available');
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Graceful shutdown initiated');

    server.close(async () => {
      logger.info('HTTP server closed');

      await disconnectRabbitMQ();
      logger.info('RabbitMQ disconnected');

      await disconnectPrisma();
      logger.info('Database disconnected');

      logger.info('👋 Delivery service shut down gracefully');
      process.exit(0);
    });

    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

start();

export default app;