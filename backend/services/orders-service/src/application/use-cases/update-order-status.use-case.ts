import { IOrderRepository } from '../../domain/repositories/order-repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/value-objects/order-status.vo';
import { UpdateOrderStatusDTO } from '../dtos/update-status.dto';
import { AppError } from '../../infrastructure/http/errors/app-error';
import { EventPublisher } from '../../infrastructure/messaging/event-publisher';

export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly eventPublisher?: EventPublisher,
  ) {}

  async execute(id: string, dto: UpdateOrderStatusDTO): Promise<Order> {
    const order = await this.orderRepository.findById(id);

    if (!order) {
      throw AppError.notFound('ORDER_NOT_FOUND', 'Pedido não encontrado');
    }

    const newStatus = dto.status as OrderStatus;

    if (!Object.values(OrderStatus).includes(newStatus)) {
      throw AppError.badRequest('VALIDATION_ERROR', `Status inválido: ${dto.status}`);
    }

    if (!order.canTransitionTo(newStatus)) {
      throw AppError.unprocessable(
        'INVALID_STATUS_TRANSITION',
        `Não é possível alterar o status de '${order.status}' para '${newStatus}'`,
      );
    }

    if (order.requiresDeliveryPerson(newStatus) && !order.deliveryPersonId) {
      throw AppError.unprocessable(
        'INVALID_STATUS_TRANSITION',
        'Não é possível alterar para \'delivering\' sem um entregador atribuído',
      );
    }

    const previousStatus = order.status;
    const updatedOrder = await this.orderRepository.updateStatus(id, newStatus);

    // Publish event (fire-and-forget)
    this.eventPublisher?.publishOrderStatusChanged({
      orderId: updatedOrder.id,
      customerName: updatedOrder.customerName,
      customerPhone: updatedOrder.customerPhone,
      previousStatus,
      newStatus,
      deliveryPersonId: updatedOrder.deliveryPersonId,
      updatedAt: updatedOrder.updatedAt.toISOString(),
    });

    return updatedOrder;
  }
}