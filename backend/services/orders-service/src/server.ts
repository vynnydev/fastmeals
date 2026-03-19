import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createContainer } from './infrastructure/container';
import { createOrderRoutes } from './infrastructure/http/routes/order.routes';
import { errorHandler } from './infrastructure/http/errors/error-handler';
import { rateLimiter } from './infrastructure/http/middlewares/rate-limiter.middleware';
import { env } from './infrastructure/config/env';
import { disconnectPrisma } from './infrastructure/database/prisma-client';
import { connectRabbitMQ, disconnectRabbitMQ } from './infrastructure/messaging/rabbitmq-client';
import { EventConsumer } from './infrastructure/messaging/event-consumer';

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
    service: 'orders-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Dependency injection container
const container = createContainer();

// Routes
app.use('/api/orders', createOrderRoutes(container.orderController));

// Error handler
app.use(errorHandler);

// Start server
async function start(): Promise<void> {
  // Connect to RabbitMQ
  try {
    const channel = await connectRabbitMQ(env.RABBITMQ_URL);

    if (channel) {
      // Setup event consumer
      const consumer = new EventConsumer(channel);
      await consumer.setup();

      // Listen for delivery assignments from optimization-service
      await consumer.consumeDeliveryAssigned(async (event) => {
        console.log(`📥 Delivery assigned: Order ${event.orderId} → Delivery Person ${event.deliveryPersonId}`);
        // In production, this would update the order via the repository
        // For now, we log it to demonstrate the messaging flow
      });
    }

    console.log('🐰 RabbitMQ messaging ready');
  } catch (error) {
    console.warn('⚠️  RabbitMQ not available — running without messaging');
    console.warn('   Orders will still work, events just won\'t be published');
  }

  const server = app.listen(env.PORT, () => {
    console.log(`📋 Orders service running on port ${env.PORT}`);
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

      console.log('👋 Orders service shut down gracefully');
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