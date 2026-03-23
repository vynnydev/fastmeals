import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaOrderRepository } from '../infrastructure/repositories/prisma-order.repository';
import { DeliveryServiceClient } from '../infrastructure/clients/delivery-service.client';
import { AssignDeliveryPersonUseCase } from '../application/use-cases/assign-delivery-person.use-case';
import { getPrismaClient } from '../infrastructure/database/prisma-client';

const prisma = getPrismaClient();
const orderRepository = new PrismaOrderRepository(prisma);
const deliveryClient = new DeliveryServiceClient();
const assignDeliveryPersonUseCase = new AssignDeliveryPersonUseCase(orderRepository, deliveryClient);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');
    const token = event.headers.Authorization?.split(' ')[1]
      || event.headers.authorization?.split(' ')[1]
      || '';

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'ID do pedido é obrigatório' } }),
      };
    }

    if (!body.deliveryPersonId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'ID do entregador é obrigatório' } }),
      };
    }

    const order = await assignDeliveryPersonUseCase.execute(
      id,
      { deliveryPersonId: body.deliveryPersonId },
      token,
    );

    return { statusCode: 200, headers, body: JSON.stringify(order.toJSON()) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    const statusCode = (error as any)?.statusCode || 500;
    const code = (error as any)?.code || 'INTERNAL_ERROR';

    return { statusCode, headers, body: JSON.stringify({ error: { code, message } }) };
  }
};