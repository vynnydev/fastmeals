import { IOrderRepository } from '../../domain/repositories/order-repository.interface';
import { IProductClient } from '../interfaces/product-client.interface';
import { Order } from '../../domain/entities/order.entity';
import { CreateOrderDTO } from '../dtos/create-order.dto';
import { AppError } from '../../infrastructure/http/errors/app-error';
import { EventPublisher } from '../../infrastructure/messaging/event-publisher';

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly productClient: IProductClient,
    private readonly eventPublisher?: EventPublisher,
  ) {}

  async execute(dto: CreateOrderDTO, token: string): Promise<Order> {
    // Validate all products exist and are available
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productClient.getProductsByIds(productIds, token);

    const unavailableProducts: { productId: string; productName: string; reason: string }[] = [];

    for (const item of dto.items) {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        unavailableProducts.push({
          productId: item.productId,
          productName: 'Produto não encontrado',
          reason: 'Produto não encontrado',
        });
        continue;
      }

      if (!product.isAvailable) {
        unavailableProducts.push({
          productId: item.productId,
          productName: product.name,
          reason: 'Produto indisponível',
        });
      }
    }

    if (unavailableProducts.length > 0) {
      throw AppError.unprocessable(
        'UNAVAILABLE_PRODUCT',
        'Um ou mais produtos não estão disponíveis',
        unavailableProducts.map((p) => ({
          field: p.productId,
          message: `${p.productName}: ${p.reason}`,
        })),
      );
    }

    // Calculate total amount using current prices (snapshot)
    const orderItems = dto.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const order = await this.orderRepository.create({
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      deliveryAddress: dto.deliveryAddress,
      latitude: dto.latitude,
      longitude: dto.longitude,
      totalAmount: Math.round(totalAmount * 100) / 100,
      items: orderItems,
    });

    // Publish event (fire-and-forget — don't block the response)
    this.eventPublisher?.publishOrderCreated({
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      itemCount: order.items.length,
      createdAt: order.createdAt.toISOString(),
    });

    return order;
  }
}