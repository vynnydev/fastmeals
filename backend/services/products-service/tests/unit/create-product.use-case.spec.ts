import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateProductUseCase } from '../../src/application/use-cases/create-product.use-case';
import { IProductRepository } from '../../src/domain/repositories/product-repository.interface';
import { Product, ProductCategory } from '../../src/domain/entities/product.entity';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockRepository: IProductRepository;

  const mockProduct = new Product({
    id: 'product-uuid-123',
    name: 'X-Burger Especial',
    description: 'Hamburguer artesanal com queijo cheddar',
    price: 32.90,
    category: ProductCategory.MEAL,
    imageUrl: 'https://example.com/burger.jpg',
    isAvailable: true,
    preparationTime: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue(mockProduct),
      update: vi.fn(),
      delete: vi.fn(),
      hasActiveOrders: vi.fn(),
    };

    useCase = new CreateProductUseCase(mockRepository);
  });

  it('should create a product successfully', async () => {
    const result = await useCase.execute({
      name: 'X-Burger Especial',
      description: 'Hamburguer artesanal com queijo cheddar',
      price: 32.90,
      category: 'meal',
      imageUrl: 'https://example.com/burger.jpg',
      preparationTime: 25,
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('X-Burger Especial');
    expect(result.price).toBe(32.90);
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should create a product without imageUrl', async () => {
    await useCase.execute({
      name: 'Suco de Laranja',
      description: 'Suco natural feito na hora',
      price: 12.50,
      category: 'drink',
      preparationTime: 5,
    });

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: null,
        isAvailable: true,
      }),
    );
  });

  it('should set isAvailable to true by default', async () => {
    await useCase.execute({
      name: 'Batata Frita',
      description: 'Porção de batata frita crocante',
      price: 16.00,
      category: 'side',
      preparationTime: 12,
    });

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        isAvailable: true,
      }),
    );
  });
});