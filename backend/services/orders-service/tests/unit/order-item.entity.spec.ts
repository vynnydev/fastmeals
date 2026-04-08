import { describe, it, expect } from 'vitest';
import { OrderItem, OrderItemProps } from '../../src/domain/entities/order-item.entity';

const defaultProps: OrderItemProps = {
  id: 'item-001',
  orderId: 'order-001',
  productId: 'prod-001',
  quantity: 2,
  unitPrice: 29.9,
  createdAt: new Date('2026-01-01'),
};

function createItem(overrides: Partial<OrderItemProps> = {}): OrderItem {
  return new OrderItem({ ...defaultProps, ...overrides });
}

describe('OrderItem Entity', () => {
  describe('getters', () => {
    it('should return id', () => {
      expect(createItem().id).toBe('item-001');
    });

    it('should return orderId', () => {
      expect(createItem().orderId).toBe('order-001');
    });

    it('should return productId', () => {
      expect(createItem().productId).toBe('prod-001');
    });

    it('should return quantity', () => {
      expect(createItem().quantity).toBe(2);
    });

    it('should return unitPrice', () => {
      expect(createItem().unitPrice).toBe(29.9);
    });

    it('should return createdAt', () => {
      expect(createItem().createdAt).toEqual(new Date('2026-01-01'));
    });
  });

  describe('subtotal', () => {
    it('should calculate subtotal as quantity * unitPrice', () => {
      expect(createItem().subtotal).toBeCloseTo(59.8);
    });

    it('should return 0 when quantity is 0', () => {
      expect(createItem({ quantity: 0 }).subtotal).toBe(0);
    });

    it('should handle single item', () => {
      expect(createItem({ quantity: 1, unitPrice: 15.5 }).subtotal).toBe(15.5);
    });
  });

  describe('toJSON', () => {
    it('should return all props with subtotal', () => {
      const json = createItem().toJSON();

      expect(json.id).toBe('item-001');
      expect(json.orderId).toBe('order-001');
      expect(json.productId).toBe('prod-001');
      expect(json.quantity).toBe(2);
      expect(json.unitPrice).toBe(29.9);
      expect(json.subtotal).toBeCloseTo(59.8);
    });
  });
});