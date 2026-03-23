import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaOrderRepository } from '../infrastructure/database/prisma-order.repository';
import { HttpProductClient } from '../infrastructure/clients/http-product.client';
import { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import { createPrismaClient } from '../infrastructure/database/prisma-client';

const prisma = createPrismaClient();
const orderRepository = new PrismaOrderRepository(prisma);
const productClient = new HttpProductClient(process.env.PRODUCTS_SERVICE_URL || 'http://products-service:3002');
const createOrderUseCase = new CreateOrderUseCase(orderRepository, productClient);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = JSON.parse(event.body || '{}');
    const token = event.headers.Authorization?.split(' ')[1] || event.headers.authorization?.split(' ')[1] || '';

    const order = await createOrderUseCase.execute(
      {
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        deliveryAddress: body.deliveryAddress,
        latitude: body.latitude,
        longitude: body.longitude,
        items: body.items,
      },
      token,
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(order.toJSON()),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    const statusCode = (error as any)?.statusCode || 500;
    const code = (error as any)?.code || 'INTERNAL_ERROR';
    const details = (error as any)?.details;

    return {
      statusCode,
      headers,
      body: JSON.stringify({ error: { code, message, ...(details && { details }) } }),
    };
  }
};