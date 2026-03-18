import { IDeliveryPersonRepository } from '../../domain/repositories/delivery-person-repository.interface';
import { DeliveryPerson } from '../../domain/entities/delivery-person.entity';
import { UpdateDeliveryPersonDTO } from '../dtos/update-delivery-person.dto';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class UpdateDeliveryPersonUseCase {
  constructor(private readonly repository: IDeliveryPersonRepository) {}

  async execute(id: string, dto: UpdateDeliveryPersonDTO): Promise<DeliveryPerson> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('DELIVERY_PERSON_NOT_FOUND', 'Entregador não encontrado');
    }

    const updated = await this.repository.update(id, dto);

    return updated;
  }
}