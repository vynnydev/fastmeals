import { DeliveryAssignedEvent } from '../../infrastructure/messaging/events';

export interface IEventConsumer {
  setup(): Promise<void>;
  consumeDeliveryAssigned(
    handler: (event: DeliveryAssignedEvent) => Promise<void>,
  ): Promise<void>;
}