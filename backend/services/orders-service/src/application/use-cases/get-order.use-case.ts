import { IOrderRepository } from '../../domain/repositories/order-repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class GetOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw AppError.notFound('ORDER_NOT_FOUND', 'Pedido não encontrado');
    }

    return order;
  }
}