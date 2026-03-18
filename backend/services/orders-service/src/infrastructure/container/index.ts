import { getPrismaClient } from '../database/prisma-client';
import { PrismaOrderRepository } from '../repositories/prisma-order.repository';
import { ProductServiceClient } from '../clients/product-service.client';
import { DeliveryServiceClient } from '../clients/delivery-service.client';
import { EventPublisher } from '../messaging/event-publisher';
import { CreateOrderUseCase } from '../../application/use-cases/create-order.use-case';
import { ListOrdersUseCase } from '../../application/use-cases/list-orders.use-case';
import { GetOrderUseCase } from '../../application/use-cases/get-order.use-case';
import { UpdateOrderStatusUseCase } from '../../application/use-cases/update-order-status.use-case';
import { AssignDeliveryPersonUseCase } from '../../application/use-cases/assign-delivery-person.use-case';
import { OrderController } from '../http/controllers/order.controller';

export interface Container {
  orderController: OrderController;
  eventPublisher: EventPublisher;
}

export function createContainer(): Container {
  const prisma = getPrismaClient();

  // Repositories
  const orderRepository = new PrismaOrderRepository(prisma);

  // External clients
  const productClient = new ProductServiceClient();
  const deliveryClient = new DeliveryServiceClient();

  // Messaging
  const eventPublisher = new EventPublisher();

  // Use Cases (with optional event publisher)
  const createOrderUseCase = new CreateOrderUseCase(orderRepository, productClient, eventPublisher);
  const listOrdersUseCase = new ListOrdersUseCase(orderRepository);
  const getOrderUseCase = new GetOrderUseCase(orderRepository);
  const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository, eventPublisher);
  const assignDeliveryPersonUseCase = new AssignDeliveryPersonUseCase(orderRepository, deliveryClient);

  // Controllers
  const orderController = new OrderController(
    createOrderUseCase,
    listOrdersUseCase,
    getOrderUseCase,
    updateOrderStatusUseCase,
    assignDeliveryPersonUseCase,
  );

  return {
    orderController,
    eventPublisher,
  };
}