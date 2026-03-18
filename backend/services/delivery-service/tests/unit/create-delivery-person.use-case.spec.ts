import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateDeliveryPersonUseCase } from '../../src/application/use-cases/create-delivery-person.use-case';
import { IDeliveryPersonRepository } from '../../src/domain/repositories/delivery-person-repository.interface';
import { DeliveryPerson, VehicleType } from '../../src/domain/entities/delivery-person.entity';

describe('CreateDeliveryPersonUseCase', () => {
  let useCase: CreateDeliveryPersonUseCase;
  let mockRepository: IDeliveryPersonRepository;

  const mockPerson = new DeliveryPerson({
    id: '550e8400-e29b-41d4-a716-446655440050',
    name: 'Carlos Santos',
    phone: '(11) 91234-5678',
    vehicleType: VehicleType.MOTORCYCLE,
    isActive: true,
    currentLatitude: -23.5489,
    currentLongitude: -46.6388,
    createdAt: new Date(),
  });

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findActiveWithoutDeliveringOrder: vi.fn(),
      create: vi.fn().mockResolvedValue(mockPerson),
      update: vi.fn(),
      delete: vi.fn(),
      isAssignedToDeliveringOrder: vi.fn(),
    };

    useCase = new CreateDeliveryPersonUseCase(mockRepository);
  });

  it('should create a delivery person successfully', async () => {
    const result = await useCase.execute({
      name: 'Carlos Santos',
      phone: '(11) 91234-5678',
      vehicleType: 'motorcycle',
      currentLatitude: -23.5489,
      currentLongitude: -46.6388,
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('Carlos Santos');
    expect(result.vehicleType).toBe('motorcycle');
    expect(mockRepository.create).toHaveBeenCalledTimes(1);
  });

  it('should create with isActive true by default', async () => {
    await useCase.execute({
      name: 'Ana Ferreira',
      phone: '(11) 92345-6789',
      vehicleType: 'bicycle',
    });

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        isActive: true,
      }),
    );
  });

  it('should create without coordinates', async () => {
    await useCase.execute({
      name: 'Roberto Lima',
      phone: '(11) 93456-7890',
      vehicleType: 'car',
    });

    expect(mockRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        currentLatitude: undefined,
        currentLongitude: undefined,
      }),
    );
  });
});