import { describe, it, expect } from 'vitest';
import { Order, OrderProps } from '../../src/domain/entities/order.entity';
import { OrderItem } from '../../src/domain/entities/order-item.entity';
import { OrderStatus } from '../../src/domain/value-objects/order-status.vo';

const defaultItem = new OrderItem({
  id: 'item-001',
  orderId: 'order-001',
  productId: 'prod-001',
  quantity: 2,
  unitPrice: 29.9,
  createdAt: new Date('2026-01-01'),
});

const defaultProps: OrderProps = {
  id: 'order-001',
  customerName: 'João Silva',
  customerPhone: '11999998888',
  deliveryAddress: 'Rua das Flores, 123',
  latitude: -23.5505,
  longitude: -46.6333,
  status: OrderStatus.PENDING,
  totalAmount: 59.8,
  deliveryPersonId: null,
  items: [defaultItem],
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

function createOrder(overrides: Partial<OrderProps> = {}): Order {
  return new Order({ ...defaultProps, ...overrides });
}

describe('Order Entity', () => {
  describe('getters', () => {
    it('should return id', () => {
      expect(createOrder().id).toBe('order-001');
    });

    it('should return customerName', () => {
      expect(createOrder().customerName).toBe('João Silva');
    });

    it('should return customerPhone', () => {
      expect(createOrder().customerPhone).toBe('11999998888');
    });

    it('should return deliveryAddress', () => {
      expect(createOrder().deliveryAddress).toBe('Rua das Flores, 123');
    });

    it('should return latitude', () => {
      expect(createOrder().latitude).toBe(-23.5505);
    });

    it('should return longitude', () => {
      expect(createOrder().longitude).toBe(-46.6333);
    });

    it('should return status', () => {
      expect(createOrder().status).toBe(OrderStatus.PENDING);
    });

    it('should return totalAmount', () => {
      expect(createOrder().totalAmount).toBe(59.8);
    });

    it('should return deliveryPersonId as null', () => {
      expect(createOrder().deliveryPersonId).toBeNull();
    });

    it('should return deliveryPersonId when set', () => {
      expect(createOrder({ deliveryPersonId: 'dp-001' }).deliveryPersonId).toBe('dp-001');
    });

    it('should return items', () => {
      const order = createOrder();
      expect(order.items).toHaveLength(1);
      expect(order.items[0]).toBeInstanceOf(OrderItem);
    });

    it('should return createdAt', () => {
      expect(createOrder().createdAt).toEqual(new Date('2026-01-01'));
    });

    it('should return updatedAt', () => {
      expect(createOrder().updatedAt).toEqual(new Date('2026-01-02'));
    });
  });

  describe('status delegation', () => {
    it('canTransitionTo should delegate to OrderStatusVO', () => {
      const order = createOrder({ status: OrderStatus.PENDING });
      expect(order.canTransitionTo(OrderStatus.PREPARING)).toBe(true);
      expect(order.canTransitionTo(OrderStatus.DELIVERED)).toBe(false);
    });

    it('getValidTransitions should delegate to OrderStatusVO', () => {
      const order = createOrder({ status: OrderStatus.PENDING });
      expect(order.getValidTransitions()).toEqual([OrderStatus.PREPARING, OrderStatus.CANCELLED]);
    });

    it('requiresDeliveryPerson should return true for READY -> DELIVERING', () => {
      const order = createOrder({ status: OrderStatus.READY });
      expect(order.requiresDeliveryPerson(OrderStatus.DELIVERING)).toBe(true);
    });

    it('requiresDeliveryPerson should return false for other transitions', () => {
      const order = createOrder({ status: OrderStatus.PENDING });
      expect(order.requiresDeliveryPerson(OrderStatus.PREPARING)).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return all properties as plain object', () => {
      const order = createOrder();
      const json = order.toJSON();

      expect(json.id).toBe('order-001');
      expect(json.customerName).toBe('João Silva');
      expect(json.status).toBe(OrderStatus.PENDING);
      expect(json.deliveryPersonId).toBeNull();
      expect((json.items as any[]).length).toBe(1);
    });

    it('should serialize items with subtotal', () => {
      const order = createOrder();
      const json = order.toJSON();
      const items = json.items as any[];

      expect(items[0].subtotal).toBe(59.8);
    });
  });
});