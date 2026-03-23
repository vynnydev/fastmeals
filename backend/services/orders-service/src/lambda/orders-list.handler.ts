import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PrismaOrderRepository } from '../infrastructure/repositories/prisma-order.repository';
import { ListOrdersUseCase } from '../application/use-cases/list-orders.use-case';
import { getPrismaClient } from '../infrastructure/database/prisma-client';

const prisma = getPrismaClient();
const orderRepository = new PrismaOrderRepository(prisma);
const listOrdersUseCase = new ListOrdersUseCase(orderRepository);

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const query = event.queryStringParameters || {};

    const result = await listOrdersUseCase.execute({
      page: query.page ? parseInt(query.page) : 1,
      limit: query.limit ? parseInt(query.limit) : 20,
      status: query.status,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: result.data.map((order) => order.toJSON()),
        pagination: result.pagination,
      }),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno';
    const statusCode = (error as any)?.statusCode || 500;
    const code = (error as any)?.code || 'INTERNAL_ERROR';

    return { statusCode, headers, body: JSON.stringify({ error: { code, message } }) };
  }
};