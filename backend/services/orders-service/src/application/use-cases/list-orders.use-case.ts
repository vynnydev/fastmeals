import { IOrderRepository, PaginatedResult } from '../../domain/repositories/order-repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/value-objects/order-status.vo';
import { ListOrdersQueryDTO } from '../dtos/list-orders-query.dto';

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(dto: ListOrdersQueryDTO): Promise<PaginatedResult<Order>> {
    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 100);

    return this.orderRepository.findAll({
      page,
      limit,
      status: dto.status as OrderStatus | undefined,
      sortBy: dto.sortBy || 'createdAt',
      sortOrder: dto.sortOrder || 'desc',
    });
  }
}