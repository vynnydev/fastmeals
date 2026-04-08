import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateProductUseCase } from '../../src/application/use-cases/update-product.use-case';
import { AppError } from '../../src/infrastructure/http/errors/app-error';
import { Product, ProductCategory } from '../../src/domain/entities/product.entity';

const mockRepo = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  hasActiveOrders: vi.fn(),
};

const existingProduct = new Product({
  id: 'prod-001',
  name: 'X-Burger',
  description: 'Hambúrguer',
  price: 29.9,
  category: ProductCategory.MEAL,
  imageUrl: null,
  isAvailable: true,
  preparationTime: 15,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateProductUseCase(mockRepo);
  });

  it('should throw PRODUCT_NOT_FOUND when product does not exist', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', { name: 'New' })).rejects.toThrow(AppError);

    try {
      await useCase.execute('nonexistent', { name: 'New' });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(404);
      expect((error as AppError).code).toBe('PRODUCT_NOT_FOUND');
    }
  });

  it('should update product name successfully', async () => {
    const updatedProduct = new Product({ ...existingProduct.toJSON(), name: 'Super Burger' });
    mockRepo.findById.mockResolvedValue(existingProduct);
    mockRepo.update.mockResolvedValue(updatedProduct);

    const result = await useCase.execute('prod-001', { name: 'Super Burger' });

    expect(result.name).toBe('Super Burger');
    expect(mockRepo.update).toHaveBeenCalledWith('prod-001', { name: 'Super Burger' });
  });

  it('should update product with category change', async () => {
    const updatedProduct = new Product({
      ...existingProduct.toJSON(),
      category: ProductCategory.DRINK,
    });
    mockRepo.findById.mockResolvedValue(existingProduct);
    mockRepo.update.mockResolvedValue(updatedProduct);

    const result = await useCase.execute('prod-001', { category: 'drink' });

    expect(result.category).toBe(ProductCategory.DRINK);
  });

  it('should update multiple fields at once', async () => {
    const updatedProduct = new Product({
      ...existingProduct.toJSON(),
      name: 'New Name',
      price: 39.9,
    });
    mockRepo.findById.mockResolvedValue(existingProduct);
    mockRepo.update.mockResolvedValue(updatedProduct);

    const result = await useCase.execute('prod-001', { name: 'New Name', price: 39.9 });

    expect(result.name).toBe('New Name');
    expect(result.price).toBe(39.9);
  });
});