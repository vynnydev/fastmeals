import { Channel } from 'amqplib';
import {
  EXCHANGE_NAME,
  EventRoutes,
  Queues,
  OrderStatusChangedEvent,
} from './events';
import { IEventConsumer } from '@application/interfaces/messaging/event-consumer.interface';

export class DeliveryEventConsumer implements IEventConsumer {
  constructor(private readonly channel: Channel) {}

  async setup(): Promise<void> {
    await this.channel.assertQueue(Queues.DELIVERY_ORDER_STATUS, {
      durable: true,
    });

    await this.channel.bindQueue(
      Queues.DELIVERY_ORDER_STATUS,
      EXCHANGE_NAME,
      EventRoutes.ORDER_STATUS_CHANGED,
    );

    console.log(`📥 Queue bound: ${Queues.DELIVERY_ORDER_STATUS} ← ${EventRoutes.ORDER_STATUS_CHANGED}`);
  }

  async consumeOrderStatusChanged(
    handler: (event: OrderStatusChangedEvent) => Promise<void>,
  ): Promise<void> {
    await this.channel.consume(
      Queues.DELIVERY_ORDER_STATUS,
      async (msg) => {
        if (!msg) return;

        try {
          const event: OrderStatusChangedEvent = JSON.parse(msg.content.toString());
          console.log(`📥 Event received: order.status.changed — Order ${event.orderId}: ${event.previousStatus} → ${event.newStatus}`);

          await handler(event);

          this.channel.ack(msg);
          console.log(`✅ Event processed: order.status.changed — Order ${event.orderId}`);
        } catch (error) {
          console.error('❌ Failed to process event:', error);
          this.channel.nack(msg, false, true);
        }
      },
      { noAck: false },
    );

    console.log(`👂 Listening on queue: ${Queues.DELIVERY_ORDER_STATUS}`);
  }
}