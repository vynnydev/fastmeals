export const EXCHANGE_NAME = 'fastmeals.events';
export const EXCHANGE_TYPE = 'topic';

export const EventRoutes = {
  ORDER_STATUS_CHANGED: 'order.status.changed',
} as const;

export const Queues = {
  DELIVERY_ORDER_STATUS: 'delivery-order-status-queue',
} as const;

export interface OrderStatusChangedEvent {
  orderId: string;
  customerName: string;
  customerPhone: string;
  previousStatus: string;
  newStatus: string;
  deliveryPersonId: string | null;
  updatedAt: string;
}