import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateDeliveryPersonUseCase } from '../../src/application/use-cases/update-delivery-person.use-case';
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

describe('UpdateDeliveryPersonUseCase', () => {
  let useCase: UpdateDeliveryPersonUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateDeliveryPersonUseCase(mockRepo);
  });

  it('should throw DELIVERY_PERSON_NOT_FOUND when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);

    await expect(useCase.execute('nonexistent', { name: 'New' })).rejects.toThrow(AppError);

    try {
      await useCase.execute('nonexistent', { name: 'New' });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(404);
      expect((error as AppError).code).toBe('DELIVERY_PERSON_NOT_FOUND');
    }
  });

  it('should update delivery person successfully', async () => {
    const updated = new DeliveryPerson({ ...existingPerson.toJSON(), name: 'Carlos' });
    mockRepo.findById.mockResolvedValue(existingPerson);
    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute('dp-001', { name: 'Carlos' });

    expect(result.name).toBe('Carlos');
    expect(mockRepo.update).toHaveBeenCalledWith('dp-001', { name: 'Carlos' });
  });

  it('should update vehicle type', async () => {
    const updated = new DeliveryPerson({
      ...existingPerson.toJSON(),
      vehicleType: VehicleType.CAR,
    });
    mockRepo.findById.mockResolvedValue(existingPerson);
    mockRepo.update.mockResolvedValue(updated);

    const result = await useCase.execute('dp-001', { vehicleType: 'car' });

    expect(result.vehicleType).toBe(VehicleType.CAR);
  });
});