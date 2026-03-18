import { IOrderRepository } from '../../domain/repositories/order-repository.interface';
import { IDeliveryClient } from '../interfaces/delivery-client.interface';
import { Order } from '../../domain/entities/order.entity';
import { AssignDeliveryPersonDTO } from '../dtos/assign-delivery.dto';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class AssignDeliveryPersonUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly deliveryClient: IDeliveryClient,
  ) {}

  async execute(orderId: string, dto: AssignDeliveryPersonDTO, token: string): Promise<Order> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw AppError.notFound('ORDER_NOT_FOUND', 'Pedido não encontrado');
    }

    // Verify delivery person exists and is active
    const deliveryPerson = await this.deliveryClient.getDeliveryPersonById(
      dto.deliveryPersonId,
      token,
    );

    if (!deliveryPerson) {
      throw AppError.notFound(
        'DELIVERY_PERSON_NOT_FOUND',
        'Entregador não encontrado',
      );
    }

    if (!deliveryPerson.isActive) {
      throw AppError.unprocessable(
        'DELIVERY_PERSON_UNAVAILABLE',
        'Este entregador está inativo',
      );
    }

    // Check if delivery person is already assigned to another delivering order
    const isAvailable = await this.deliveryClient.isDeliveryPersonAvailable(
      dto.deliveryPersonId,
      token,
    );

    if (!isAvailable) {
      throw AppError.unprocessable(
        'DELIVERY_PERSON_UNAVAILABLE',
        'Este entregador já está atribuído a outro pedido em andamento',
      );
    }

    const updatedOrder = await this.orderRepository.assignDeliveryPerson(
      orderId,
      dto.deliveryPersonId,
    );

    return updatedOrder;
  }
}