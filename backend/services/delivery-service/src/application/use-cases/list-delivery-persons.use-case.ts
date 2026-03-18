import { IDeliveryPersonRepository } from '../../domain/repositories/delivery-person-repository.interface';
import { DeliveryPerson } from '../../domain/entities/delivery-person.entity';
import { ListDeliveryPersonsQueryDTO } from '../dtos/list-delivery-persons-query.dto';

export class ListDeliveryPersonsUseCase {
  constructor(private readonly repository: IDeliveryPersonRepository) {}

  async execute(dto: ListDeliveryPersonsQueryDTO): Promise<DeliveryPerson[]> {
    if (dto.available) {
      return this.repository.findActiveWithoutDeliveringOrder();
    }

    return this.repository.findAll({
      isActive: dto.isActive,
    });
  }
}