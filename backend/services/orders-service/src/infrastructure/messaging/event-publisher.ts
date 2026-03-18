import { getChannel } from './rabbitmq-client';
import {
  EXCHANGE_NAME,
  EventRoutes,
  OrderCreatedEvent,
  OrderStatusChangedEvent,
} from './events';
import { IEventPublisher } from '@application/interfaces/event-publisher.interface';

export class EventPublisher implements IEventPublisher {
  async publishOrderCreated(event: OrderCreatedEvent): Promise<void> {
    await this.publish(EventRoutes.ORDER_CREATED, {...event});
  }

  async publishOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void> {
    await this.publish(EventRoutes.ORDER_STATUS_CHANGED, { ...event });
  }

  private async publish(routingKey: string, payload: Record<string, unknown>): Promise<void> {
    const channel = await getChannel();

    if (!channel) {
      console.warn(`⚠️  RabbitMQ not connected. Event ${routingKey} not published.`);
      return;
    }

    try {
      const message = Buffer.from(JSON.stringify(payload));

      channel.publish(EXCHANGE_NAME, routingKey, message, {
        persistent: true, // Message survives broker restart
        contentType: 'application/json',
        timestamp: Date.now(),
        headers: {
          source: 'orders-service',
        },
      });

      console.log(`📤 Event published: ${routingKey}`, JSON.stringify(payload).substring(0, 100));
    } catch (error) {
      console.error(`❌ Failed to publish event ${routingKey}:`, error);
      // Don't throw — messaging failure shouldn't break the main flow
    }
  }
}