import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaOrderRepository } from '../infrastructure/database/prisma-order.repository';
import { GetOrderUseCase } from '../application/use-cases/get-order.use-case';
import { createPrismaClient } from '../infrastructure/database/prisma-client';

const prisma = createPrismaClient();
const orderRepository = new PrismaOrderRepository(prisma);
const getOrderUseCase = new GetOrderUseCase(orderRepository);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'ID do pedido é obrigatório' } }),
      };
    }

    const order = await getOrderUseCase.execute(id);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(order.toJSON()),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    const statusCode = (error as any)?.statusCode || 500;
    const code = (error as any)?.code || 'INTERNAL_ERROR';

    return {
      statusCode,
      headers,
      body: JSON.stringify({ error: { code, message } }),
    };
  }
};