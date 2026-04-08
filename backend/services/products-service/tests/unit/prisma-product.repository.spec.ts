import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PrismaProductRepository } from '../../src/infrastructure/repositories/prisma-product.repository';
import { Product, ProductCategory } from '../../src/domain/entities/product.entity';

const mockPrismaProduct = {
  findUnique: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockPrisma = {
  product: mockPrismaProduct,
} as any;

const sampleRecord = {
  id: 'prod-001',
  name: 'X-Burger',
  description: 'Hambúrguer artesanal',
  price: 29.9,
  category: 'meal',
  imageUrl: null,
  isAvailable: true,
  preparationTime: 15,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-02'),
};

describe('PrismaProductRepository', () => {
  let repo: PrismaProductRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new PrismaProductRepository(mockPrisma);
  });

  describe('findById', () => {
    it('should return Product when found', async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(sampleRecord);

      const result = await repo.findById('prod-001');

      expect(result).toBeInstanceOf(Product);
      expect(result?.id).toBe('prod-001');
      expect(result?.name).toBe('X-Burger');
      expect(mockPrismaProduct.findUnique).toHaveBeenCalledWith({ where: { id: 'prod-001' } });
    });

    it('should return null when not found', async () => {
      mockPrismaProduct.findUnique.mockResolvedValue(null);

      const result = await repo.findById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle Decimal price from Prisma', async () => {
      const decimalRecord = {
        ...sampleRecord,
        price: { toNumber: () => 29.9, toString: () => '29.9' },
      };
      mockPrismaProduct.findUnique.mockResolvedValue(decimalRecord);

      const result = await repo.findById('prod-001');

      expect(result?.price).toBe(29.9);
    });
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      mockPrismaProduct.findMany.mockResolvedValue([sampleRecord]);
      mockPrismaProduct.count.mockResolvedValue(1);

      const result = await repo.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(Product);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should apply search filter', async () => {
      mockPrismaProduct.findMany.mockResolvedValue([]);
      mockPrismaProduct.count.mockResolvedValue(0);

      await repo.findAll({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        search: 'burger',
      });

      const callArgs = mockPrismaProduct.findMany.mock.calls[0][0];
      expect(callArgs.where.name).toEqual({ contains: 'burger', mode: 'insensitive' });
    });

    it('should apply category filter', async () => {
      mockPrismaProduct.findMany.mockResolvedValue([]);
      mockPrismaProduct.count.mockResolvedValue(0);

      await repo.findAll({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        category: 'drink',
      });

      const callArgs = mockPrismaProduct.findMany.mock.calls[0][0];
      expect(callArgs.where.category).toBe('drink');
    });

    it('should apply isAvailable filter', async () => {
      mockPrismaProduct.findMany.mockResolvedValue([]);
      mockPrismaProduct.count.mockResolvedValue(0);

      await repo.findAll({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        isAvailable: true,
      });

      const callArgs = mockPrismaProduct.findMany.mock.calls[0][0];
      expect(callArgs.where.isAvailable).toBe(true);
    });

    it('should calculate correct pagination skip', async () => {
      mockPrismaProduct.findMany.mockResolvedValue([]);
      mockPrismaProduct.count.mockResolvedValue(25);

      const result = await repo.findAll({
        page: 3,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      const callArgs = mockPrismaProduct.findMany.mock.calls[0][0];
      expect(callArgs.skip).toBe(20);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('create', () => {
    it('should create and return Product', async () => {
      mockPrismaProduct.create.mockResolvedValue(sampleRecord);

      const input = {
        name: 'X-Burger',
        description: 'Hambúrguer artesanal',
        price: 29.9,
        category: ProductCategory.MEAL,
        imageUrl: null,
        isAvailable: true,
        preparationTime: 15,
      };

      const result = await repo.create(input as any);

      expect(result).toBeInstanceOf(Product);
      expect(result.name).toBe('X-Burger');
      expect(mockPrismaProduct.create).toHaveBeenCalledWith({
        data: {
          name: 'X-Burger',
          description: 'Hambúrguer artesanal',
          price: 29.9,
          category: ProductCategory.MEAL,
          imageUrl: null,
          isAvailable: true,
          preparationTime: 15,
        },
      });
    });
  });

  describe('update', () => {
    it('should update only provided fields', async () => {
      mockPrismaProduct.update.mockResolvedValue({ ...sampleRecord, name: 'Super Burger' });

      const result = await repo.update('prod-001', { name: 'Super Burger' } as any);

      expect(result).toBeInstanceOf(Product);
      expect(result.name).toBe('Super Burger');

      const callArgs = mockPrismaProduct.update.mock.calls[0][0];
      expect(callArgs.data.name).toBe('Super Burger');
      expect(callArgs.data.price).toBeUndefined();
    });

    it('should update all fields when all provided', async () => {
      const updatedRecord = {
        ...sampleRecord,
        name: 'New Name',
        price: 39.9,
        description: 'New desc',
        category: 'drink',
        imageUrl: 'http://img.com/new.jpg',
        isAvailable: false,
        preparationTime: 20,
      };
      mockPrismaProduct.update.mockResolvedValue(updatedRecord);

      await repo.update('prod-001', {
        name: 'New Name',
        description: 'New desc',
        price: 39.9,
        category: ProductCategory.DRINK,
        imageUrl: 'http://img.com/new.jpg',
        isAvailable: false,
        preparationTime: 20,
      } as any);

      const callArgs = mockPrismaProduct.update.mock.calls[0][0];
      expect(callArgs.data.name).toBe('New Name');
      expect(callArgs.data.price).toBe(39.9);
      expect(callArgs.data.category).toBe(ProductCategory.DRINK);
      expect(callArgs.data.isAvailable).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete product by id', async () => {
      mockPrismaProduct.delete.mockResolvedValue(sampleRecord);

      await repo.delete('prod-001');

      expect(mockPrismaProduct.delete).toHaveBeenCalledWith({ where: { id: 'prod-001' } });
    });
  });

  describe('hasActiveOrders', () => {
    it('should return false (stub implementation)', async () => {
      const result = await repo.hasActiveOrders('prod-001');
      expect(result).toBe(false);
    });
  });
});