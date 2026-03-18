import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createContainer } from './infrastructure/container';
import { createDeliveryPersonRoutes } from './infrastructure/http/routes/delivery-person.routes';
import { errorHandler } from './infrastructure/http/errors/error-handler';
import { rateLimiter } from './infrastructure/http/middlewares/rate-limiter.middleware';
import { env } from './infrastructure/config/env';
import { disconnectPrisma } from './infrastructure/database/prisma-client';
import { connectRabbitMQ, disconnectRabbitMQ } from './infrastructure/messaging/rabbitmq-client';
import { DeliveryEventConsumer } from './infrastructure/messaging/event-consumer';

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
    service: 'delivery-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
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

    const consumer = new DeliveryEventConsumer(channel);
    await consumer.setup();

    // Listen for order status changes
    await consumer.consumeOrderStatusChanged(async (event) => {
      // When order is delivered or cancelled, the delivery person becomes free
      if (
        event.deliveryPersonId &&
        (event.newStatus === 'delivered' || event.newStatus === 'cancelled')
      ) {
        console.log(
          `🚴 Delivery person ${event.deliveryPersonId} is now FREE (order ${event.orderId} → ${event.newStatus})`,
        );
        // In a production system, we could update a local cache here
        // to avoid HTTP calls to orders-service for availability checks
      }

      // When order transitions to delivering, the delivery person is busy
      if (event.deliveryPersonId && event.newStatus === 'delivering') {
        console.log(
          `🚴 Delivery person ${event.deliveryPersonId} is now BUSY (order ${event.orderId} → delivering)`,
        );
      }
    });

    console.log('🐰 RabbitMQ messaging ready');
  } catch (error) {
    console.warn('⚠️  RabbitMQ not available — running without messaging');
    console.warn('   Delivery service will still work via HTTP calls to orders-service');
  }

  const server = app.listen(env.PORT, () => {
    console.log(`🚴 Delivery service running on port ${env.PORT}`);
    console.log(`   Environment: ${env.NODE_ENV}`);
    console.log(`   Health: http://localhost:${env.PORT}/health`);
  });

  // Graceful shutdown
  const gracefulShutdown = async (signal: string): Promise<void> => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      console.log('  ✅ HTTP server closed');

      await disconnectRabbitMQ();
      console.log('  ✅ RabbitMQ disconnected');

      await disconnectPrisma();
      console.log('  ✅ Database disconnected');

      console.log('👋 Delivery service shut down gracefully');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('⚠️  Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

start();

export default app;