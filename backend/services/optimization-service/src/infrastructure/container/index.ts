import { OrdersServiceClient } from '../clients/orders-service.client';
import { DeliveryServiceClient } from '../clients/delivery-service.client';
import { OptimizeAssignmentUseCase } from '../../application/use-cases/optimize-assignment.use-case';
import { OptimizationController } from '../http/controllers/optimization.controller';

export interface Container {
  optimizationController: OptimizationController;
}

export function createContainer(): Container {
  const ordersClient = new OrdersServiceClient();
  const deliveryClient = new DeliveryServiceClient();

  const optimizeUseCase = new OptimizeAssignmentUseCase(ordersClient, deliveryClient);

  const optimizationController = new OptimizationController(optimizeUseCase);

  return {
    optimizationController,
  };
}