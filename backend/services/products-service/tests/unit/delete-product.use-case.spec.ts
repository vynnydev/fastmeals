import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteProductUseCase } from '../../src/application/use-cases/delete-product.use-case';
import { IProductRepository } from '../../src/domain/repositories/product-repository.interface';
import { Product, ProductCategory } from '../../src/domain/entities/product.entity';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let mockRepository: IProductRepository;

  const mockProduct = new Product({
    id: 'product-uuid-123',
    name: 'X-Burger Especial',
    description: 'Hamburguer artesanal com queijo cheddar',
    price: 32.90,
    category: ProductCategory.MEAL,
    imageUrl: null,
    isAvailable: true,
    preparationTime: 25,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
      hasActiveOrders: vi.fn(),
    };

    useCase = new DeleteProductUseCase(mockRepository);
  });

  it('should delete a product successfully', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockRepository.hasActiveOrders).mockResolvedValue(false);

    await useCase.execute('product-uuid-123');

    expect(mockRepository.findById).toHaveBeenCalledWith('product-uuid-123');
    expect(mockRepository.hasActiveOrders).toHaveBeenCalledWith('product-uuid-123');
    expect(mockRepository.delete).toHaveBeenCalledWith('product-uuid-123');
  });

  it('should throw PRODUCT_NOT_FOUND when product does not exist', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    await expect(useCase.execute('nonexistent-uuid')).rejects.toMatchObject({
      statusCode: 404,
      code: 'PRODUCT_NOT_FOUND',
    });

    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should throw PRODUCT_IN_USE when product has active orders', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockRepository.hasActiveOrders).mockResolvedValue(true);

    await expect(useCase.execute('product-uuid-123')).rejects.toMatchObject({
      statusCode: 409,
      code: 'PRODUCT_IN_USE',
    });

    expect(mockRepository.delete).not.toHaveBeenCalled();
  });

  it('should check for active orders before deleting', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(mockProduct);
    vi.mocked(mockRepository.hasActiveOrders).mockResolvedValue(false);

    await useCase.execute('product-uuid-123');

    const findByIdOrder = vi.mocked(mockRepository.findById).mock.invocationCallOrder[0];
    const hasActiveOrdersOrder = vi.mocked(mockRepository.hasActiveOrders).mock.invocationCallOrder[0];
    const deleteOrder = vi.mocked(mockRepository.delete).mock.invocationCallOrder[0];

    expect(findByIdOrder).toBeLessThan(hasActiveOrdersOrder);
    expect(hasActiveOrdersOrder).toBeLessThan(deleteOrder);
  });
});