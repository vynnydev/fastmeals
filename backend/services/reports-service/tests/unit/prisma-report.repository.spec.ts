import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaReportRepository } from '../../src/infrastructure/repositories/prisma-report.repository';

const mockOrder = { findMany: vi.fn(), count: vi.fn() };
const mockOrderItem = { findMany: vi.fn() };
const mockProduct = { findMany: vi.fn() };
const mockDeliveryPerson = { findMany: vi.fn() };
const mockPrisma = {
  order: mockOrder, orderItem: mockOrderItem,
  product: mockProduct, deliveryPerson: mockDeliveryPerson,
} as any;

describe('PrismaReportRepository', () => {
  let repo: PrismaReportRepository;

  beforeEach(() => { vi.clearAllMocks(); repo = new PrismaReportRepository(mockPrisma); });

  describe('getRevenue', () => {
    it('should calculate revenue from delivered orders', async () => {
      mockOrder.findMany.mockResolvedValue([
        { totalAmount: 50, createdAt: new Date('2026-01-15') },
        { totalAmount: 30, createdAt: new Date('2026-01-15') },
        { totalAmount: 20, createdAt: new Date('2026-01-16') },
      ]);

      const result = await repo.getRevenue(new Date('2026-01-01'), new Date('2026-01-31'));

      expect(result.totalRevenue).toBe(100);
      expect(result.totalOrders).toBe(3);
      expect(result.averageOrderValue).toBeCloseTo(33.33);
      expect(result.dailyRevenue).toHaveLength(2);
    });

    it('should return zeros when no orders', async () => {
      mockOrder.findMany.mockResolvedValue([]);

      const result = await repo.getRevenue(new Date('2026-01-01'), new Date('2026-01-31'));

      expect(result.totalRevenue).toBe(0);
      expect(result.totalOrders).toBe(0);
      expect(result.averageOrderValue).toBe(0);
    });
  });

  describe('getOrdersByStatus', () => {
    it('should return counts for all statuses', async () => {
      mockOrder.count
        .mockResolvedValueOnce(5)   // pending
        .mockResolvedValueOnce(3)   // preparing
        .mockResolvedValueOnce(2)   // ready
        .mockResolvedValueOnce(1)   // delivering
        .mockResolvedValueOnce(10)  // delivered
        .mockResolvedValueOnce(2);  // cancelled

      const result = await repo.getOrdersByStatus();

      expect(result.data).toHaveLength(6);
      expect(result.total).toBe(23);
      expect(result.data[0]).toEqual({ status: 'pending', count: 5 });
    });
  });

  describe('getTopProducts', () => {
    it('should return top products sorted by quantity', async () => {
      mockOrder.findMany.mockResolvedValue([{ id: 'o-1' }, { id: 'o-2' }]);
      mockOrderItem.findMany.mockResolvedValue([
        { productId: 'p-1', quantity: 5, unitPrice: 20 },
        { productId: 'p-2', quantity: 10, unitPrice: 15 },
        { productId: 'p-1', quantity: 3, unitPrice: 20 },
      ]);
      mockProduct.findMany.mockResolvedValue([
        { id: 'p-1', name: 'X-Burger' },
        { id: 'p-2', name: 'Coca-Cola' },
      ]);

      const result = await repo.getTopProducts(new Date('2026-01-01'), new Date('2026-01-31'), 10);

      expect(result.data[0].productId).toBe('p-2');
      expect(result.data[0].totalQuantity).toBe(10);
      expect(result.data[1].productId).toBe('p-1');
      expect(result.data[1].totalQuantity).toBe(8);
    });

    it('should return empty when no delivered orders', async () => {
      mockOrder.findMany.mockResolvedValue([]);

      const result = await repo.getTopProducts();

      expect(result.data).toEqual([]);
    });

    it('should handle unknown product names', async () => {
      mockOrder.findMany.mockResolvedValue([{ id: 'o-1' }]);
      mockOrderItem.findMany.mockResolvedValue([{ productId: 'p-deleted', quantity: 1, unitPrice: 10 }]);
      mockProduct.findMany.mockResolvedValue([]);

      const result = await repo.getTopProducts();

      expect(result.data[0].productName).toBe('Produto desconhecido');
    });
  });

  describe('getAverageDeliveryTime', () => {
    it('should calculate delivery times correctly', async () => {
      const base = new Date('2026-01-15T10:00:00Z');
      const delivered30min = new Date('2026-01-15T10:30:00Z');
      const delivered60min = new Date('2026-01-15T11:00:00Z');

      mockOrder.findMany.mockResolvedValue([
        { createdAt: base, updatedAt: delivered30min, deliveryPersonId: 'dp-1' },
        { createdAt: base, updatedAt: delivered60min, deliveryPersonId: 'dp-2' },
      ]);
      mockDeliveryPerson.findMany.mockResolvedValue([
        { id: 'dp-1', vehicleType: 'motorcycle' },
        { id: 'dp-2', vehicleType: 'bicycle' },
      ]);

      const result = await repo.getAverageDeliveryTime(new Date('2026-01-01'), new Date('2026-01-31'));

      expect(result.averageMinutes).toBe(45);
      expect(result.fastestMinutes).toBe(30);
      expect(result.slowestMinutes).toBe(60);
      expect(result.totalDelivered).toBe(2);
      expect(result.byVehicleType).toHaveLength(2);
    });

    it('should return zeros when no delivered orders', async () => {
      mockOrder.findMany.mockResolvedValue([]);

      const result = await repo.getAverageDeliveryTime();

      expect(result.averageMinutes).toBe(0);
      expect(result.totalDelivered).toBe(0);
      expect(result.byVehicleType).toEqual([]);
    });

    it('should handle unknown vehicle types', async () => {
      const base = new Date('2026-01-15T10:00:00Z');
      mockOrder.findMany.mockResolvedValue([
        { createdAt: base, updatedAt: new Date('2026-01-15T10:20:00Z'), deliveryPersonId: 'dp-unknown' },
      ]);
      mockDeliveryPerson.findMany.mockResolvedValue([]);

      const result = await repo.getAverageDeliveryTime();

      expect(result.byVehicleType[0].vehicleType).toBe('unknown');
    });
  });
});