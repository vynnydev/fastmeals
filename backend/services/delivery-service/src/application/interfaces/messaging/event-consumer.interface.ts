import { OrderStatusChangedEvent } from '../../../infrastructure/messaging/events';

export interface IEventConsumer {
  setup(): Promise<void>;
  consumeOrderStatusChanged(
    handler: (event: OrderStatusChangedEvent) => Promise<void>,
  ): Promise<void>;
}