import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaDeliveryPersonRepository } from '../../src/infrastructure/repositories/prisma-delivery-person.repository';
import { DeliveryPerson, VehicleType } from '../../src/domain/entities/delivery-person.entity';

const mockPrismaDeliveryPerson = {
  findUnique: vi.fn(),
  findMany: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockPrisma = {
  deliveryPerson: mockPrismaDeliveryPerson,
} as any;

const sampleRecord = {
  id: 'dp-001',
  name: 'João Silva',
  phone: '11999998888',
  vehicleType: 'motorcycle',
  isActive: true,
  currentLatitude: -23.5505,
  currentLongitude: -46.6333,
  createdAt: new Date('2026-01-01'),
};

describe('PrismaDeliveryPersonRepository', () => {
  let repo: PrismaDeliveryPersonRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaDeliveryPersonRepository(mockPrisma);
  });

  describe('findById', () => {
    it('should return DeliveryPerson when found', async () => {
      mockPrismaDeliveryPerson.findUnique.mockResolvedValue(sampleRecord);

      const result = await repo.findById('dp-001');

      expect(result).toBeInstanceOf(DeliveryPerson);
      expect(result?.id).toBe('dp-001');
      expect(result?.name).toBe('João Silva');
    });

    it('should return null when not found', async () => {
      mockPrismaDeliveryPerson.findUnique.mockResolvedValue(null);

      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle Decimal coordinates from Prisma', async () => {
      const decimalRecord = {
        ...sampleRecord,
        currentLatitude: { toNumber: () => -23.5505, toString: () => '-23.5505' },
        currentLongitude: { toNumber: () => -46.6333, toString: () => '-46.6333' },
      };
      mockPrismaDeliveryPerson.findUnique.mockResolvedValue(decimalRecord);

      const result = await repo.findById('dp-001');

      expect(result?.currentLatitude).toBe(-23.5505);
      expect(result?.currentLongitude).toBe(-46.6333);
    });

    it('should handle null coordinates', async () => {
      mockPrismaDeliveryPerson.findUnique.mockResolvedValue({
        ...sampleRecord,
        currentLatitude: null,
        currentLongitude: null,
      });

      const result = await repo.findById('dp-001');

      expect(result?.currentLatitude).toBeNull();
      expect(result?.currentLongitude).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all delivery persons', async () => {
      mockPrismaDeliveryPerson.findMany.mockResolvedValue([sampleRecord]);

      const result = await repo.findAll({});

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(DeliveryPerson);
    });

    it('should filter by isActive', async () => {
      mockPrismaDeliveryPerson.findMany.mockResolvedValue([]);

      await repo.findAll({ isActive: true });

      const callArgs = mockPrismaDeliveryPerson.findMany.mock.calls[0][0];
      expect(callArgs.where.isActive).toBe(true);
    });

    it('should not filter when isActive is undefined', async () => {
      mockPrismaDeliveryPerson.findMany.mockResolvedValue([]);

      await repo.findAll({});

      const callArgs = mockPrismaDeliveryPerson.findMany.mock.calls[0][0];
      expect(callArgs.where.isActive).toBeUndefined();
    });
  });

  describe('findActiveWithoutDeliveringOrder', () => {
    it('should return active delivery persons', async () => {
      mockPrismaDeliveryPerson.findMany.mockResolvedValue([sampleRecord]);

      const result = await repo.findActiveWithoutDeliveringOrder();

      expect(result).toHaveLength(1);
      expect(mockPrismaDeliveryPerson.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
      });
    });
  });

  describe('create', () => {
    it('should create and return DeliveryPerson', async () => {
      mockPrismaDeliveryPerson.create.mockResolvedValue(sampleRecord);

      const result = await repo.create({
        name: 'João Silva',
        phone: '11999998888',
        vehicleType: 'motorcycle',
        isActive: true,
        currentLatitude: -23.5505,
        currentLongitude: -46.6333,
      });

      expect(result).toBeInstanceOf(DeliveryPerson);
      expect(result.name).toBe('João Silva');
    });

    it('should default isActive to true when not provided', async () => {
        mockPrismaDeliveryPerson.create.mockResolvedValue(sampleRecord);

        await repo.create({
            name: 'Maria',
            phone: '11888887777',
            vehicleType: 'bicycle',
            currentLatitude: undefined,
            currentLongitude: undefined,
        });

        const callArgs = mockPrismaDeliveryPerson.create.mock.calls[0][0];
        expect(callArgs.data.isActive).toBe(true);
    });
  });

  describe('update', () => {
    it('should update only provided fields', async () => {
      mockPrismaDeliveryPerson.update.mockResolvedValue({ ...sampleRecord, name: 'Carlos' });

      const result = await repo.update('dp-001', { name: 'Carlos' });

      expect(result.name).toBe('Carlos');
      const callArgs = mockPrismaDeliveryPerson.update.mock.calls[0][0];
      expect(callArgs.data.name).toBe('Carlos');
      expect(callArgs.data.phone).toBeUndefined();
    });

    it('should update all fields when all provided', async () => {
      mockPrismaDeliveryPerson.update.mockResolvedValue({
        ...sampleRecord,
        name: 'New',
        phone: '11000001111',
        vehicleType: 'car',
        isActive: false,
        currentLatitude: -22.0,
        currentLongitude: -43.0,
      });

      await repo.update('dp-001', {
        name: 'New',
        phone: '11000001111',
        vehicleType: 'car',
        isActive: false,
        currentLatitude: -22.0,
        currentLongitude: -43.0,
      });

      const callArgs = mockPrismaDeliveryPerson.update.mock.calls[0][0];
      expect(callArgs.data.name).toBe('New');
      expect(callArgs.data.vehicleType).toBe('car');
      expect(callArgs.data.isActive).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete by id', async () => {
      mockPrismaDeliveryPerson.delete.mockResolvedValue(sampleRecord);

      await repo.delete('dp-001');

      expect(mockPrismaDeliveryPerson.delete).toHaveBeenCalledWith({ where: { id: 'dp-001' } });
    });
  });

  describe('isAssignedToDeliveringOrder', () => {
    it('should return false (stub implementation)', async () => {
      const result = await repo.isAssignedToDeliveringOrder('dp-001');
      expect(result).toBe(false);
    });
  });
});