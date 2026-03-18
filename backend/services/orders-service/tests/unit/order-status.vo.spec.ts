import { describe, it, expect } from 'vitest';
import { OrderStatus, OrderStatusVO } from '../../src/domain/value-objects/order-status.vo';

describe('OrderStatusVO', () => {
  it('should create from valid status string', () => {
    const status = OrderStatusVO.fromString('pending');
    expect(status.getValue()).toBe(OrderStatus.PENDING);
  });

  it('should throw for invalid status', () => {
    expect(() => new OrderStatusVO('invalid')).toThrow('Invalid order status: invalid');
  });

  describe('valid transitions', () => {
    it('pending → preparing (valid)', () => {
      const status = new OrderStatusVO('pending');
      expect(status.canTransitionTo(OrderStatus.PREPARING)).toBe(true);
    });

    it('pending → cancelled (valid)', () => {
      const status = new OrderStatusVO('pending');
      expect(status.canTransitionTo(OrderStatus.CANCELLED)).toBe(true);
    });

    it('preparing → ready (valid)', () => {
      const status = new OrderStatusVO('preparing');
      expect(status.canTransitionTo(OrderStatus.READY)).toBe(true);
    });

    it('ready → delivering (valid)', () => {
      const status = new OrderStatusVO('ready');
      expect(status.canTransitionTo(OrderStatus.DELIVERING)).toBe(true);
    });

    it('delivering → delivered (valid)', () => {
      const status = new OrderStatusVO('delivering');
      expect(status.canTransitionTo(OrderStatus.DELIVERED)).toBe(true);
    });
  });

  describe('invalid transitions', () => {
    it('pending → delivered (invalid)', () => {
      const status = new OrderStatusVO('pending');
      expect(status.canTransitionTo(OrderStatus.DELIVERED)).toBe(false);
    });

    it('delivered → pending (invalid)', () => {
      const status = new OrderStatusVO('delivered');
      expect(status.canTransitionTo(OrderStatus.PENDING)).toBe(false);
    });

    it('delivering → cancelled (invalid)', () => {
      const status = new OrderStatusVO('delivering');
      expect(status.canTransitionTo(OrderStatus.CANCELLED)).toBe(false);
    });

    it('cancelled → preparing (invalid)', () => {
      const status = new OrderStatusVO('cancelled');
      expect(status.canTransitionTo(OrderStatus.PREPARING)).toBe(false);
    });

    it('delivered → cancelled (invalid)', () => {
      const status = new OrderStatusVO('delivered');
      expect(status.canTransitionTo(OrderStatus.CANCELLED)).toBe(false);
    });
  });

  it('should require delivery person for ready → delivering', () => {
    const status = new OrderStatusVO('ready');
    expect(status.requiresDeliveryPerson(OrderStatus.DELIVERING)).toBe(true);
  });

  it('should not require delivery person for pending → preparing', () => {
    const status = new OrderStatusVO('pending');
    expect(status.requiresDeliveryPerson(OrderStatus.PREPARING)).toBe(false);
  });

  it('should return valid transitions for each status', () => {
    expect(new OrderStatusVO('pending').getValidTransitions()).toEqual([
      OrderStatus.PREPARING,
      OrderStatus.CANCELLED,
    ]);

    expect(new OrderStatusVO('delivered').getValidTransitions()).toEqual([]);
    expect(new OrderStatusVO('cancelled').getValidTransitions()).toEqual([]);
  });
});