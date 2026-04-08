import { describe, it, expect } from 'vitest';
import { EXCHANGE_NAME, EXCHANGE_TYPE, EventRoutes, Queues } from '../../src/infrastructure/messaging/events';

describe('Events constants', () => {
  it('should have correct exchange name', () => {
    expect(EXCHANGE_NAME).toBe('fastmeals.events');
  });

  it('should have correct exchange type', () => {
    expect(EXCHANGE_TYPE).toBe('topic');
  });

  it('should have ORDER_STATUS_CHANGED route', () => {
    expect(EventRoutes.ORDER_STATUS_CHANGED).toBe('order.status.changed');
  });

  it('should have DELIVERY_ORDER_STATUS queue', () => {
    expect(Queues.DELIVERY_ORDER_STATUS).toBe('delivery-order-status-queue');
  });
});