export const EXCHANGE_NAME = 'fastmeals.events';
export const EXCHANGE_TYPE = 'topic';

// Event routing keys
export const EventRoutes = {
  ORDER_CREATED: 'order.created',
  ORDER_STATUS_CHANGED: 'order.status.changed',
  DELIVERY_ASSIGNED: 'delivery.assigned',
} as const;

// Queue names
export const Queues = {
  ORDER_CREATED: 'order-created-queue',
  ORDER_STATUS_CHANGED: 'order-status-changed-queue',
  DELIVERY_ASSIGNED: 'delivery-assigned-queue',
} as const;

// Event payloads
export interface OrderCreatedEvent {
  orderId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
}

export interface OrderStatusChangedEvent {
  orderId: string;
  customerName: string;
  customerPhone: string;
  previousStatus: string;
  newStatus: string;
  deliveryPersonId: string | null;
  updatedAt: string;
}

export interface DeliveryAssignedEvent {
  orderId: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  estimatedDistanceKm: number;
  assignedAt: string;
}