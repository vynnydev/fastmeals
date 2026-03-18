import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateOrderUseCase } from '../../src/application/use-cases/create-order.use-case';
import { IOrderRepository } from '../../src/domain/repositories/order-repository.interface';
import { IProductClient } from '../../src/application/interfaces/product-client.interface';
import { Order } from '../../src/domain/entities/order.entity';
import { OrderItem } from '../../src/domain/entities/order-item.entity';
import { OrderStatus } from '../../src/domain/value-objects/order-status.vo';

describe('CreateOrderUseCase', () => {
  let useCase: CreateOrderUseCase;
  let mockRepository: IOrderRepository;
  let mockProductClient: IProductClient;

  const mockOrder = new Order({
    id: '550e8400-e29b-41d4-a716-446655440001',
    customerName: 'João Silva',
    customerPhone: '(11) 99999-1234',
    deliveryAddress: 'Rua das Flores, 123, São Paulo - SP',
    latitude: -23.5505,
    longitude: -46.6333,
    status: OrderStatus.PENDING,
    totalAmount: 78.30,
    deliveryPersonId: null,
    items: [
      new OrderItem({
        id: 'item-1',
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        productId: 'product-1',
        quantity: 2,
        unitPrice: 32.90,
        createdAt: new Date(),
      }),
      new OrderItem({
        id: 'item-2',
        orderId: '550e8400-e29b-41d4-a716-446655440001',
        productId: 'product-2',
        quantity: 1,
        unitPrice: 12.50,
        createdAt: new Date(),
      }),
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue(mockOrder),
      updateStatus: vi.fn(),
      assignDeliveryPerson: vi.fn(),
      findByStatus: vi.fn(),
      hasProductInActiveOrders: vi.fn(),
    };

    mockProductClient = {
      getProductById: vi.fn(),
      getProductsByIds: vi.fn().mockResolvedValue([
        { id: 'product-1', name: 'X-Burger', price: 32.90, isAvailable: true },
        { id: 'product-2', name: 'Suco de Laranja', price: 12.50, isAvailable: true },
      ]),
    };

    useCase = new CreateOrderUseCase(mockRepository, mockProductClient);
  });

  it('should create an order with correct total amount', async () => {
    const result = await useCase.execute(
      {
        customerName: 'João Silva',
        customerPhone: '(11) 99999-1234',
        deliveryAddress: 'Rua das Flores, 123, São Paulo - SP',
        latitude: -23.5505,
        longitude: -46.6333,
        items: [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 1 },
        ],
      },
      'valid-token',
    );

    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        totalAmount: 78.30, // (32.90 * 2) + (12.50 * 1)
      }),
    );
  });

  it('should throw UNAVAILABLE_PRODUCT when product is not available', async () => {
    vi.mocked(mockProductClient.getProductsByIds).mockResolvedValue([
      { id: 'product-1', name: 'X-Burger', price: 32.90, isAvailable: false },
    ]);

    await expect(
      useCase.execute(
        {
          customerName: 'João Silva',
          customerPhone: '(11) 99999-1234',
          deliveryAddress: 'Rua das Flores, 123, São Paulo - SP',
          latitude: -23.5505,
          longitude: -46.6333,
          items: [{ productId: 'product-1', quantity: 1 }],
        },
        'valid-token',
      ),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'UNAVAILABLE_PRODUCT',
    });

    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should throw UNAVAILABLE_PRODUCT when product is not found', async () => {
    vi.mocked(mockProductClient.getProductsByIds).mockResolvedValue([]);

    await expect(
      useCase.execute(
        {
          customerName: 'João Silva',
          customerPhone: '(11) 99999-1234',
          deliveryAddress: 'Rua das Flores, 123, São Paulo - SP',
          latitude: -23.5505,
          longitude: -46.6333,
          items: [{ productId: 'nonexistent-product', quantity: 1 }],
        },
        'valid-token',
      ),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'UNAVAILABLE_PRODUCT',
    });
  });

  it('should use current product price as unit price snapshot', async () => {
    await useCase.execute(
      {
        customerName: 'João Silva',
        customerPhone: '(11) 99999-1234',
        deliveryAddress: 'Rua das Flores, 123, São Paulo - SP',
        latitude: -23.5505,
        longitude: -46.6333,
        items: [{ productId: 'product-1', quantity: 1 }],
      },
      'valid-token',
    );

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: 'product-1',
            unitPrice: 32.90,
          }),
        ]),
      }),
    );
  });

  it('should forward token to product client', async () => {
    await useCase.execute(
      {
        customerName: 'João Silva',
        customerPhone: '(11) 99999-1234',
        deliveryAddress: 'Rua das Flores, 123, São Paulo - SP',
        latitude: -23.5505,
        longitude: -46.6333,
        items: [{ productId: 'product-1', quantity: 1 }],
      },
      'my-jwt-token',
    );

    expect(mockProductClient.getProductsByIds).toHaveBeenCalledWith(
      ['product-1'],
      'my-jwt-token',
    );
  });
});