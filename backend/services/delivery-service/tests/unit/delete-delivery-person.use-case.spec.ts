import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteDeliveryPersonUseCase } from '../../src/application/use-cases/delete-delivery-person.use-case';
import { AppError } from '../../src/infrastructure/http/errors/app-error';
import { DeliveryPerson, VehicleType } from '../../src/domain/entities/delivery-person.entity';

const mockRepo = {
  findById: vi.fn(),
  findAll: vi.fn(),
  findActiveWithoutDeliveringOrder: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  isAssignedToDeliveringOrder: vi.fn(),
};

const existingPerson = new DeliveryPerson({
  id: 'dp-001',
  name: 'João Silva',
  phone: '11999998888',
  vehicleType: VehicleType.MOTORCYCLE,
  isActive: true,
  currentLatitude: -23.55,
  currentLongitude: -46.63,
  createdAt: new Date(),
});

describe('DeleteDeliveryPersonUseCase', () => {
  let useCase: DeleteDeliveryPersonUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DeleteDeliveryPersonUseCase(mockRepo);
  });

  it('should throw DELIVERY_PERSON_NOT_FOUND when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent')).rejects.toThrow(AppError);

    try {
      await useCase.execute('nonexistent');
    } catch (error) {
      expect((error as AppError).statusCode).toBe(404);
      expect((error as AppError).code).toBe('DELIVERY_PERSON_NOT_FOUND');
    }
  });

  it('should throw DELIVERY_PERSON_IN_USE when assigned to delivering order', async () => {
    mockRepo.findById.mockResolvedValue(existingPerson);
    mockRepo.isAssignedToDeliveringOrder.mockResolvedValue(true);

    await expect(useCase.execute('dp-001')).rejects.toThrow(AppError);

    try {
      await useCase.execute('dp-001');
    } catch (error) {
      expect((error as AppError).statusCode).toBe(409);
      expect((error as AppError).code).toBe('DELIVERY_PERSON_IN_USE');
    }
  });

  it('should delete successfully when not assigned', async () => {
    mockRepo.findById.mockResolvedValue(existingPerson);
    mockRepo.isAssignedToDeliveringOrder.mockResolvedValue(false);
    mockRepo.delete.mockResolvedValue(undefined);

    await useCase.execute('dp-001');

    expect(mockRepo.delete).toHaveBeenCalledWith('dp-001');
  });
});