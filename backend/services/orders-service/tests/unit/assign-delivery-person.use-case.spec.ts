import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AssignDeliveryPersonUseCase } from '../../src/application/use-cases/assign-delivery-person.use-case';
import { AppError } from '../../src/infrastructure/http/errors/app-error';
import { Order } from '../../src/domain/entities/order.entity';
import { OrderStatus } from '../../src/domain/value-objects/order-status.vo';

const mockOrderRepo = {
  findById: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  updateStatus: vi.fn(),
  assignDeliveryPerson: vi.fn(),
  findByStatus: vi.fn(),
  hasProductInActiveOrders: vi.fn(),
};

const mockDeliveryClient = {
  getDeliveryPersonById: vi.fn(),
  isDeliveryPersonAvailable: vi.fn(),
};

const sampleOrder = new Order({
  id: 'order-001',
  customerName: 'João',
  customerPhone: '11999998888',
  deliveryAddress: 'Rua X, 123',
  latitude: -23.55,
  longitude: -46.63,
  status: OrderStatus.READY,
  totalAmount: 59.8,
  deliveryPersonId: null,
  items: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe('AssignDeliveryPersonUseCase', () => {
  let useCase: AssignDeliveryPersonUseCase;
  const token = 'Bearer valid-token';

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new AssignDeliveryPersonUseCase(mockOrderRepo, mockDeliveryClient);
  });

  it('should throw ORDER_NOT_FOUND when order does not exist', async () => {
    mockOrderRepo.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('nonexistent', { deliveryPersonId: 'dp-001' }, token),
    ).rejects.toThrow(AppError);

    try {
      await useCase.execute('nonexistent', { deliveryPersonId: 'dp-001' }, token);
    } catch (error) {
      expect((error as AppError).code).toBe('ORDER_NOT_FOUND');
    }
  });

  it('should throw DELIVERY_PERSON_NOT_FOUND when delivery person does not exist', async () => {
    mockOrderRepo.findById.mockResolvedValue(sampleOrder);
    mockDeliveryClient.getDeliveryPersonById.mockResolvedValue(null);

    await expect(
      useCase.execute('order-001', { deliveryPersonId: 'nonexistent' }, token),
    ).rejects.toThrow(AppError);

    try {
      await useCase.execute('order-001', { deliveryPersonId: 'nonexistent' }, token);
    } catch (error) {
      expect((error as AppError).code).toBe('DELIVERY_PERSON_NOT_FOUND');
    }
  });

  it('should throw DELIVERY_PERSON_UNAVAILABLE when delivery person is inactive', async () => {
    mockOrderRepo.findById.mockResolvedValue(sampleOrder);
    mockDeliveryClient.getDeliveryPersonById.mockResolvedValue({
      id: 'dp-001',
      name: 'Carlos',
      isActive: false,
      currentOrderId: null,
    });

    await expect(
      useCase.execute('order-001', { deliveryPersonId: 'dp-001' }, token),
    ).rejects.toThrow(AppError);

    try {
      await useCase.execute('order-001', { deliveryPersonId: 'dp-001' }, token);
    } catch (error) {
      expect((error as AppError).code).toBe('DELIVERY_PERSON_UNAVAILABLE');
      expect((error as AppError).message).toContain('inativo');
    }
  });

  it('should throw DELIVERY_PERSON_UNAVAILABLE when already assigned', async () => {
    mockOrderRepo.findById.mockResolvedValue(sampleOrder);
    mockDeliveryClient.getDeliveryPersonById.mockResolvedValue({
      id: 'dp-001',
      name: 'Carlos',
      isActive: true,
      currentOrderId: null,
    });
    mockDeliveryClient.isDeliveryPersonAvailable.mockResolvedValue(false);

    await expect(
      useCase.execute('order-001', { deliveryPersonId: 'dp-001' }, token),
    ).rejects.toThrow(AppError);

    try {
      await useCase.execute('order-001', { deliveryPersonId: 'dp-001' }, token);
    } catch (error) {
      expect((error as AppError).code).toBe('DELIVERY_PERSON_UNAVAILABLE');
      expect((error as AppError).message).toContain('outro pedido');
    }
  });

  it('should assign delivery person successfully', async () => {
    const assignedOrder = new Order({
      ...sampleOrder.toJSON() as any,
      deliveryPersonId: 'dp-001',
      items: [],
    });

    mockOrderRepo.findById.mockResolvedValue(sampleOrder);
    mockDeliveryClient.getDeliveryPersonById.mockResolvedValue({
      id: 'dp-001',
      name: 'Carlos',
      isActive: true,
      currentOrderId: null,
    });
    mockDeliveryClient.isDeliveryPersonAvailable.mockResolvedValue(true);
    mockOrderRepo.assignDeliveryPerson.mockResolvedValue(assignedOrder);

    const result = await useCase.execute('order-001', { deliveryPersonId: 'dp-001' }, token);

    expect(result.deliveryPersonId).toBe('dp-001');
    expect(mockOrderRepo.assignDeliveryPerson).toHaveBeenCalledWith('order-001', 'dp-001');
  });
});