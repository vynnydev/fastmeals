import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateOrderStatusUseCase } from '../../src/application/use-cases/update-order-status.use-case';
import { IOrderRepository } from '../../src/domain/repositories/order-repository.interface';
import { Order } from '../../src/domain/entities/order.entity';
import { OrderStatus } from '../../src/domain/value-objects/order-status.vo';

describe('UpdateOrderStatusUseCase', () => {
  let useCase: UpdateOrderStatusUseCase;
  let mockRepository: IOrderRepository;

  const createMockOrder = (status: OrderStatus, deliveryPersonId: string | null = null): Order => {
    return new Order({
      id: '550e8400-e29b-41d4-a716-446655440001',
      customerName: 'João Silva',
      customerPhone: '(11) 99999-1234',
      deliveryAddress: 'Rua das Flores, 123',
      latitude: -23.5505,
      longitude: -46.6333,
      status,
      totalAmount: 65.80,
      deliveryPersonId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  };

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      updateStatus: vi.fn(),
      assignDeliveryPerson: vi.fn(),
      findByStatus: vi.fn(),
      hasProductInActiveOrders: vi.fn(),
    };

    useCase = new UpdateOrderStatusUseCase(mockRepository);
  });

  it('should update status from pending to preparing', async () => {
    const order = createMockOrder(OrderStatus.PENDING);
    const updatedOrder = createMockOrder(OrderStatus.PREPARING);

    vi.mocked(mockRepository.findById).mockResolvedValue(order);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(updatedOrder);

    const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440001', {
      status: 'preparing',
    });

    expect(result.status).toBe(OrderStatus.PREPARING);
    expect(mockRepository.updateStatus).toHaveBeenCalledWith(
      '550e8400-e29b-41d4-a716-446655440001',
      OrderStatus.PREPARING,
    );
  });

  it('should throw ORDER_NOT_FOUND when order does not exist', async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent-uuid', { status: 'preparing' }),
    ).rejects.toMatchObject({
      statusCode: 404,
      code: 'ORDER_NOT_FOUND',
    });
  });

  it('should throw INVALID_STATUS_TRANSITION for invalid transition', async () => {
    const order = createMockOrder(OrderStatus.DELIVERED);
    vi.mocked(mockRepository.findById).mockResolvedValue(order);

    await expect(
      useCase.execute('550e8400-e29b-41d4-a716-446655440001', { status: 'pending' }),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'INVALID_STATUS_TRANSITION',
    });

    expect(mockRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('should throw when transitioning to delivering without delivery person', async () => {
    const order = createMockOrder(OrderStatus.READY, null);
    vi.mocked(mockRepository.findById).mockResolvedValue(order);

    await expect(
      useCase.execute('550e8400-e29b-41d4-a716-446655440001', { status: 'delivering' }),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'INVALID_STATUS_TRANSITION',
    });
  });

  it('should allow ready → delivering when delivery person is assigned', async () => {
    const order = createMockOrder(OrderStatus.READY, 'delivery-person-uuid');
    const updatedOrder = createMockOrder(OrderStatus.DELIVERING, 'delivery-person-uuid');

    vi.mocked(mockRepository.findById).mockResolvedValue(order);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(updatedOrder);

    const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440001', {
      status: 'delivering',
    });

    expect(result.status).toBe(OrderStatus.DELIVERING);
  });

  it('should allow cancellation from pending', async () => {
    const order = createMockOrder(OrderStatus.PENDING);
    const cancelledOrder = createMockOrder(OrderStatus.CANCELLED);

    vi.mocked(mockRepository.findById).mockResolvedValue(order);
    vi.mocked(mockRepository.updateStatus).mockResolvedValue(cancelledOrder);

    const result = await useCase.execute('550e8400-e29b-41d4-a716-446655440001', {
      status: 'cancelled',
    });

    expect(result.status).toBe(OrderStatus.CANCELLED);
  });

  it('should not allow cancellation from delivering', async () => {
    const order = createMockOrder(OrderStatus.DELIVERING);
    vi.mocked(mockRepository.findById).mockResolvedValue(order);

    await expect(
      useCase.execute('550e8400-e29b-41d4-a716-446655440001', { status: 'cancelled' }),
    ).rejects.toMatchObject({
      statusCode: 422,
      code: 'INVALID_STATUS_TRANSITION',
    });
  });
});