import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaOrderRepository } from '../infrastructure/repositories/prisma-order.repository';
import { ProductServiceClient } from '../infrastructure/clients/product-service.client';
import { CreateOrderUseCase } from '../application/use-cases/create-order.use-case';
import { getPrismaClient } from '../infrastructure/database/prisma-client';

const prisma = getPrismaClient();
const orderRepository = new PrismaOrderRepository(prisma);
const productClient = new ProductServiceClient();
const createOrderUseCase = new CreateOrderUseCase(orderRepository, productClient);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const token = event.headers.Authorization?.split(' ')[1]
      || event.headers.authorization?.split(' ')[1]
      || '';

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

    return { statusCode: 201, headers, body: JSON.stringify(order.toJSON()) };
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