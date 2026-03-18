import { IDeliveryPersonRepository } from '../../domain/repositories/delivery-person-repository.interface';
import { DeliveryPerson } from '../../domain/entities/delivery-person.entity';
import { CreateDeliveryPersonDTO } from '../dtos/create-delivery-person.dto';

export class CreateDeliveryPersonUseCase {
  constructor(private readonly repository: IDeliveryPersonRepository) {}

  async execute(dto: CreateDeliveryPersonDTO): Promise<DeliveryPerson> {
    const deliveryPerson = await this.repository.create({
      name: dto.name,
      phone: dto.phone,
      vehicleType: dto.vehicleType,
      isActive: true,
      currentLatitude: dto.currentLatitude,
      currentLongitude: dto.currentLongitude,
    });

    return deliveryPerson;
  }
}