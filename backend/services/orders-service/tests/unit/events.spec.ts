import { describe, it, expect } from 'vitest';
import { EXCHANGE_NAME, EXCHANGE_TYPE, EventRoutes, Queues } from '../../src/infrastructure/messaging/events';

describe('Events constants', () => {
  it('should have correct exchange name', () => {
    expect(EXCHANGE_NAME).toBe('fastmeals.events');
  });

  it('should have correct exchange type', () => {
    expect(EXCHANGE_TYPE).toBe('topic');
  });

  it('should have ORDER_CREATED route', () => {
    expect(EventRoutes.ORDER_CREATED).toBe('order.created');
  });

  it('should have ORDER_STATUS_CHANGED route', () => {
    expect(EventRoutes.ORDER_STATUS_CHANGED).toBe('order.status.changed');
  });

  it('should have DELIVERY_ASSIGNED route', () => {
    expect(EventRoutes.DELIVERY_ASSIGNED).toBe('delivery.assigned');
  });

  it('should have all queue names', () => {
    expect(Queues.ORDER_CREATED).toBe('order-created-queue');
    expect(Queues.ORDER_STATUS_CHANGED).toBe('order-status-changed-queue');
    expect(Queues.DELIVERY_ASSIGNED).toBe('delivery-assigned-queue');
  });
});