import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListProductsUseCase } from '../../src/application/use-cases/list-products.use-case';
import { IProductRepository, PaginatedResult } from '../../src/domain/repositories/product-repository.interface';
import { Product, ProductCategory } from '../../src/domain/entities/product.entity';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  let mockRepository: IProductRepository;

  const mockProducts: PaginatedResult<Product> = {
    data: [
      new Product({
        id: 'product-1',
        name: 'X-Burger',
        description: 'Hamburguer artesanal',
        price: 32.90,
        category: ProductCategory.MEAL,
        imageUrl: null,
        isAvailable: true,
        preparationTime: 25,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Product({
        id: 'product-2',
        name: 'Suco de Laranja',
        description: 'Suco natural feito na hora',
        price: 12.50,
        category: ProductCategory.DRINK,
        imageUrl: null,
        isAvailable: true,
        preparationTime: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue(mockProducts),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      hasActiveOrders: vi.fn(),
    };

    useCase = new ListProductsUseCase(mockRepository);
  });

  it('should list products with default pagination', async () => {
    const result = await useCase.execute({});

    expect(result.data).toHaveLength(2);
    expect(result.pagination.page).toBe(1);
    expect(mockRepository.findAll).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      search: undefined,
      category: undefined,
      isAvailable: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('should pass search and category filters', async () => {
    await useCase.execute({
      search: 'burger',
      category: 'meal',
      page: 2,
      limit: 10,
    });

    expect(mockRepository.findAll).toHaveBeenCalledWith({
      page: 2,
      limit: 10,
      search: 'burger',
      category: 'meal',
      isAvailable: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('should cap limit at 100', async () => {
    await useCase.execute({ limit: 500 });

    expect(mockRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 100,
      }),
    );
  });

  it('should use custom sort options', async () => {
    await useCase.execute({
      sortBy: 'price',
      sortOrder: 'asc',
    });

    expect(mockRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: 'price',
        sortOrder: 'asc',
      }),
    );
  });

  it('should default to page 1 when not provided', async () => {
    await useCase.execute({ limit: 10 });

    expect(mockRepository.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
      }),
    );
  });
});