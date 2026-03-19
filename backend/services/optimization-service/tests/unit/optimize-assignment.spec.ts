import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OptimizeAssignmentUseCase } from '../../src/application/use-cases/optimize-assignment.use-case';
import { IOrderDataSource } from '../../src/domain/interfaces/order-data-source.interface';
import { IDeliveryDataSource } from '../../src/domain/interfaces/delivery-data-source.interface';

describe('OptimizeAssignmentUseCase', () => {
  let useCase: OptimizeAssignmentUseCase;
  let mockOrderDataSource: IOrderDataSource;
  let mockDeliveryDataSource: IDeliveryDataSource;

  beforeEach(() => {
    mockOrderDataSource = {
      getReadyOrders: vi.fn(),
    };

    mockDeliveryDataSource = {
      getAvailableDeliveryPersons: vi.fn(),
    };

    useCase = new OptimizeAssignmentUseCase(mockOrderDataSource, mockDeliveryDataSource);
  });

  it('should return empty when no ready orders', async () => {
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([]);
    vi.mocked(mockDeliveryDataSource.getAvailableDeliveryPersons).mockResolvedValue([
      { id: 'dp-1', name: 'Carlos', currentLatitude: -23.5489, currentLongitude: -46.6388 },
    ]);

    const result = await useCase.execute('token');

    expect(result.assignments).toHaveLength(0);
    expect(result.totalDistanceKm).toBe(0);
    expect(result.algorithm).toBe('hungarian');
  });

  it('should return unassigned when no delivery persons available', async () => {
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([
      { id: 'order-1', customerName: 'João', deliveryAddress: 'Rua A', latitude: -23.5891, longitude: -46.6378 },
    ]);
    vi.mocked(mockDeliveryDataSource.getAvailableDeliveryPersons).mockResolvedValue([]);

    const result = await useCase.execute('token');

    expect(result.assignments).toHaveLength(0);
    expect(result.unassigned).toHaveLength(1);
    expect(result.unassigned[0].reason).toBe('No available delivery person');
  });

  it('should assign optimally with 2 orders and 2 delivery persons', async () => {
    // Person 1 is closer to Order 2, Person 2 is closer to Order 1
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([
      { id: 'order-1', customerName: 'João', deliveryAddress: 'Vila Mariana', latitude: -23.5891, longitude: -46.6378 },
      { id: 'order-2', customerName: 'Maria', deliveryAddress: 'Paulista', latitude: -23.5632, longitude: -46.6542 },
    ]);

    vi.mocked(mockDeliveryDataSource.getAvailableDeliveryPersons).mockResolvedValue([
      { id: 'dp-1', name: 'Carlos', currentLatitude: -23.5630, currentLongitude: -46.6544 },
      { id: 'dp-2', name: 'Ana', currentLatitude: -23.5880, currentLongitude: -46.6360 },
    ]);

    const result = await useCase.execute('token');

    expect(result.assignments).toHaveLength(2);
    expect(result.unassigned).toHaveLength(0);
    expect(result.totalDistanceKm).toBeGreaterThan(0);
    expect(result.algorithm).toBe('hungarian');
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('should handle more orders than delivery persons', async () => {
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([
      { id: 'order-1', customerName: 'João', deliveryAddress: 'Rua A', latitude: -23.5891, longitude: -46.6378 },
      { id: 'order-2', customerName: 'Maria', deliveryAddress: 'Rua B', latitude: -23.5632, longitude: -46.6542 },
      { id: 'order-3', customerName: 'Pedro', deliveryAddress: 'Rua C', latitude: -23.5538, longitude: -46.6580 },
    ]);

    vi.mocked(mockDeliveryDataSource.getAvailableDeliveryPersons).mockResolvedValue([
      { id: 'dp-1', name: 'Carlos', currentLatitude: -23.5489, currentLongitude: -46.6388 },
    ]);

    const result = await useCase.execute('token');

    expect(result.assignments).toHaveLength(1);
    expect(result.unassigned).toHaveLength(2);
    expect(result.unassigned.every((u) => u.reason === 'No available delivery person')).toBe(true);
  });

  it('should handle more delivery persons than orders', async () => {
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([
      { id: 'order-1', customerName: 'João', deliveryAddress: 'Rua A', latitude: -23.5891, longitude: -46.6378 },
    ]);

    vi.mocked(mockDeliveryDataSource.getAvailableDeliveryPersons).mockResolvedValue([
      { id: 'dp-1', name: 'Carlos', currentLatitude: -23.5489, currentLongitude: -46.6388 },
      { id: 'dp-2', name: 'Ana', currentLatitude: -23.5630, currentLongitude: -46.6544 },
      { id: 'dp-3', name: 'Roberto', currentLatitude: -23.5350, currentLongitude: -46.6250 },
    ]);

    const result = await useCase.execute('token');

    expect(result.assignments).toHaveLength(1);
    expect(result.unassigned).toHaveLength(0);
  });

  it('should include execution time in result', async () => {
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([]);
    vi.mocked(mockDeliveryDataSource.getAvailableDeliveryPersons).mockResolvedValue([]);

    const result = await useCase.execute('token');

    expect(result).toHaveProperty('executionTimeMs');
    expect(typeof result.executionTimeMs).toBe('number');
  });

  it('should include assignment details', async () => {
    vi.mocked(mockOrderDataSource.getReadyOrders).mockResolvedValue([
      { id: 'order-1', customerName: 'João', deliveryAddress: 'Rua das Flores, 123', latitude: -23.5891, longitude: -46.6378 },
    ]);

    vi.mocked(mockDeliveryDataSource.getAvailableDeliveryPersons).mockResolvedValue([
      { id: 'dp-1', name: 'Carlos Santos', currentLatitude: -23.5489, currentLongitude: -46.6388 },
    ]);

    const result = await useCase.execute('token');

    expect(result.assignments[0]).toEqual(
      expect.objectContaining({
        orderId: 'order-1',
        deliveryPersonId: 'dp-1',
        orderAddress: 'Rua das Flores, 123',
        deliveryPersonName: 'Carlos Santos',
      }),
    );
    expect(result.assignments[0].estimatedDistanceKm).toBeGreaterThan(0);
  });
});