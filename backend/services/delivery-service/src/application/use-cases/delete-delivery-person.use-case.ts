import { IDeliveryPersonRepository } from '../../domain/repositories/delivery-person-repository.interface';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class DeleteDeliveryPersonUseCase {
  constructor(private readonly repository: IDeliveryPersonRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.repository.findById(id);

    if (!existing) {
      throw AppError.notFound('DELIVERY_PERSON_NOT_FOUND', 'Entregador não encontrado');
    }

    const isAssigned = await this.repository.isAssignedToDeliveringOrder(id);

    if (isAssigned) {
      throw AppError.conflict(
        'DELIVERY_PERSON_IN_USE',
        'Não é possível remover este entregador pois ele está atribuído a um pedido com status \'delivering\'',
      );
    }

    await this.repository.delete(id);
  }
}