import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ListDeliveryPersonsUseCase } from '../application/use-cases/list-delivery-persons.use-case';
import { PrismaDeliveryPersonRepository } from '../infrastructure/repositories/prisma-delivery-person.repository';
import { OrdersServiceClient } from '../infrastructure/clients/orders-service.client';
import { getPrismaClient } from '../infrastructure/database/prisma-client';
import { listDeliveryPersonsQuerySchema } from '../infrastructure/http/validators/delivery-person.validator';
import { AppError } from '../infrastructure/http/errors/app-error';
import { ZodError } from 'zod';

let useCase: ListDeliveryPersonsUseCase | null = null;

function getUseCase(): ListDeliveryPersonsUseCase {
  if (!useCase) {
    const prisma = getPrismaClient();
    const ordersClient = new OrdersServiceClient();
    const repository = new PrismaDeliveryPersonRepository(prisma, ordersClient);
    useCase = new ListDeliveryPersonsUseCase(repository);
  }
  return useCase;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*' };

  try {
    const query = listDeliveryPersonsQuerySchema.parse(event.queryStringParameters || {});
    const result = await getUseCase().execute({
      isActive: query.isActive,
      available: query.available,
    });

    return { statusCode: 200, headers, body: JSON.stringify({ data: result.map((p) => p.toJSON()) }) };
  } catch (error) {
    if (error instanceof AppError) return { statusCode: error.statusCode, headers, body: JSON.stringify(error.toJSON()) };
    if (error instanceof ZodError) return { statusCode: 400, headers, body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) } }) };
    console.error('Unhandled error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } }) };
  }
};