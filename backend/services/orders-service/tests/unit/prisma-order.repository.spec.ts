import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaOrderRepository } from '../../src/infrastructure/repositories/prisma-order.repository';
import { Order } from '../../src/domain/entities/order.entity';
import { OrderStatus } from '../../src/domain/value-objects/order-status.vo';

const mockOrder = {
  findUnique: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
};
const mockOrderItem = { count: vi.fn() };
const mockPrisma = { order: mockOrder, orderItem: mockOrderItem } as any;

const sampleItem = {
  id: 'item-001', orderId: 'order-001', productId: 'prod-001',
  quantity: 2, unitPrice: 29.9, createdAt: new Date('2026-01-01'),
};

const sampleRecord = {
  id: 'order-001', customerName: 'João', customerPhone: '11999998888',
  deliveryAddress: 'Rua X', latitude: -23.55, longitude: -46.63,
  status: 'pending', totalAmount: 59.8, deliveryPersonId: null,
  createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-02'),
  items: [sampleItem],
};

describe('PrismaOrderRepository', () => {
  let repo: PrismaOrderRepository;

  beforeEach(() => { vi.clearAllMocks(); repo = new PrismaOrderRepository(mockPrisma); });

  describe('findById', () => {
    it('should return Order when found', async () => {
      mockOrder.findUnique.mockResolvedValue(sampleRecord);
      const result = await repo.findById('order-001');
      expect(result).toBeInstanceOf(Order);
      expect(result?.id).toBe('order-001');
      expect(result?.items).toHaveLength(1);
    });

    it('should return null when not found', async () => {
      mockOrder.findUnique.mockResolvedValue(null);
      expect(await repo.findById('x')).toBeNull();
    });

    it('should handle Decimal fields', async () => {
      mockOrder.findUnique.mockResolvedValue({
        ...sampleRecord,
        latitude: { toString: () => '-23.55' },
        longitude: { toString: () => '-46.63' },
        totalAmount: { toString: () => '59.8' },
        items: [{ ...sampleItem, unitPrice: { toString: () => '29.9' } }],
      });
      const result = await repo.findById('order-001');
      expect(result?.latitude).toBe(-23.55);
      expect(result?.totalAmount).toBe(59.8);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockOrder.findMany.mockResolvedValue([sampleRecord]);
      mockOrder.count.mockResolvedValue(1);

      const result = await repo.findAll({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
      expect(result.data).toHaveLength(1);
      expect(result.pagination).toEqual({ page: 1, limit: 10, total: 1, totalPages: 1 });
    });

    it('should filter by status', async () => {
      mockOrder.findMany.mockResolvedValue([]);
      mockOrder.count.mockResolvedValue(0);
      await repo.findAll({ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc', status: OrderStatus.PENDING });
      expect(mockOrder.findMany.mock.calls[0][0].where.status).toBe('pending');
    });

    it('should calculate skip correctly', async () => {
      mockOrder.findMany.mockResolvedValue([]);
      mockOrder.count.mockResolvedValue(30);
      const result = await repo.findAll({ page: 3, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });
      expect(mockOrder.findMany.mock.calls[0][0].skip).toBe(20);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('create', () => {
    it('should create order with items', async () => {
      mockOrder.create.mockResolvedValue(sampleRecord);
      const result = await repo.create({
        customerName: 'João', customerPhone: '11999998888',
        deliveryAddress: 'Rua X', latitude: -23.55, longitude: -46.63,
        totalAmount: 59.8,
        items: [{ productId: 'prod-001', quantity: 2, unitPrice: 29.9 }],
      });
      expect(result).toBeInstanceOf(Order);
      expect(mockOrder.create.mock.calls[0][0].data.status).toBe('pending');
    });
  });

  describe('updateStatus', () => {
    it('should update status and return Order', async () => {
      mockOrder.update.mockResolvedValue({ ...sampleRecord, status: 'preparing' });
      const result = await repo.updateStatus('order-001', OrderStatus.PREPARING);
      expect(result.status).toBe(OrderStatus.PREPARING);
    });
  });

  describe('assignDeliveryPerson', () => {
    it('should assign and return Order', async () => {
      mockOrder.update.mockResolvedValue({ ...sampleRecord, deliveryPersonId: 'dp-001' });
      const result = await repo.assignDeliveryPerson('order-001', 'dp-001');
      expect(result.deliveryPersonId).toBe('dp-001');
    });
  });

  describe('findByStatus', () => {
    it('should return orders by status', async () => {
      mockOrder.findMany.mockResolvedValue([sampleRecord]);
      const result = await repo.findByStatus(OrderStatus.PENDING);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Order);
    });
  });

  describe('hasProductInActiveOrders', () => {
    it('should return true when count > 0', async () => {
      mockOrderItem.count.mockResolvedValue(2);
      expect(await repo.hasProductInActiveOrders('prod-001')).toBe(true);
    });

    it('should return false when count is 0', async () => {
      mockOrderItem.count.mockResolvedValue(0);
      expect(await repo.hasProductInActiveOrders('prod-001')).toBe(false);
    });
  });
});