import { OrderCreatedEvent, OrderStatusChangedEvent } from '../../infrastructure/messaging/events';

export interface IEventPublisher {
  publishOrderCreated(event: OrderCreatedEvent): Promise<void>;
  publishOrderStatusChanged(event: OrderStatusChangedEvent): Promise<void>;
}