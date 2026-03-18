import { Channel } from 'amqplib';
import {
  EXCHANGE_NAME,
  EventRoutes,
  Queues,
  DeliveryAssignedEvent,
} from './events';
import { IEventConsumer } from '@application/interfaces/event-consumer.interface';

export class EventConsumer implements IEventConsumer {
  constructor(private readonly channel: Channel) {}

  async setup(): Promise<void> {
    // Declare queue for delivery assignments
    await this.channel.assertQueue(Queues.DELIVERY_ASSIGNED, {
      durable: true, // Queue survives broker restart
    });

    // Bind queue to exchange with routing key
    await this.channel.bindQueue(
      Queues.DELIVERY_ASSIGNED,
      EXCHANGE_NAME,
      EventRoutes.DELIVERY_ASSIGNED,
    );

    console.log(`📥 Queue bound: ${Queues.DELIVERY_ASSIGNED} ← ${EventRoutes.DELIVERY_ASSIGNED}`);
  }

  async consumeDeliveryAssigned(
    handler: (event: DeliveryAssignedEvent) => Promise<void>,
  ): Promise<void> {
    await this.channel.consume(
      Queues.DELIVERY_ASSIGNED,
      async (msg) => {
        if (!msg) return;

        try {
          const event: DeliveryAssignedEvent = JSON.parse(msg.content.toString());
          console.log(`📥 Event received: ${EventRoutes.DELIVERY_ASSIGNED}`, event.orderId);

          await handler(event);

          // Acknowledge message — remove from queue
          this.channel.ack(msg);
          console.log(`✅ Event processed: ${EventRoutes.DELIVERY_ASSIGNED}`, event.orderId);
        } catch (error) {
          console.error(`❌ Failed to process event:`, error);
          // Negative acknowledge — requeue the message
          this.channel.nack(msg, false, true);
        }
      },
      { noAck: false }, // Manual acknowledgment
    );

    console.log(`👂 Listening on queue: ${Queues.DELIVERY_ASSIGNED}`);
  }
}