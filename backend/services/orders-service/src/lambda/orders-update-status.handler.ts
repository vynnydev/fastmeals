import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaOrderRepository } from '../infrastructure/repositories/prisma-order.repository';
import { UpdateOrderStatusUseCase } from '../application/use-cases/update-order-status.use-case';
import { getPrismaClient } from '../infrastructure/database/prisma-client';

const prisma = getPrismaClient();
const orderRepository = new PrismaOrderRepository(prisma);
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepository);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;
    const body = JSON.parse(event.body || '{}');

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'ID do pedido é obrigatório' } }),
      };
    }

    if (!body.status) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Status é obrigatório' } }),
      };
    }

    const order = await updateOrderStatusUseCase.execute(id, { status: body.status });

    return { statusCode: 200, headers, body: JSON.stringify(order.toJSON()) };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    const statusCode = (error as any)?.statusCode || 500;
    const code = (error as any)?.code || 'INTERNAL_ERROR';

    return { statusCode, headers, body: JSON.stringify({ error: { code, message } }) };
  }
};