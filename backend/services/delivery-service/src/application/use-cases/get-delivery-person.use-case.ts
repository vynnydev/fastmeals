import { IDeliveryPersonRepository } from '../../domain/repositories/delivery-person-repository.interface';
import { DeliveryPerson } from '../../domain/entities/delivery-person.entity';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class GetDeliveryPersonUseCase {
  constructor(private readonly repository: IDeliveryPersonRepository) {}

  async execute(id: string): Promise<DeliveryPerson> {
    const deliveryPerson = await this.repository.findById(id);

    if (!deliveryPerson) {
      throw AppError.notFound('DELIVERY_PERSON_NOT_FOUND', 'Entregador não encontrado');
    }

    return deliveryPerson;
  }
}