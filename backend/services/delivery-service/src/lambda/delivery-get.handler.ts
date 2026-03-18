import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetDeliveryPersonUseCase } from '../application/use-cases/get-delivery-person.use-case';
import { PrismaDeliveryPersonRepository } from '../infrastructure/repositories/prisma-delivery-person.repository';
import { OrdersServiceClient } from '../infrastructure/clients/orders-service.client';
import { getPrismaClient } from '../infrastructure/database/prisma-client';
import { deliveryPersonIdSchema } from '../infrastructure/http/validators/delivery-person.validator';
import { AppError } from '../infrastructure/http/errors/app-error';
import { ZodError } from 'zod';

let useCase: GetDeliveryPersonUseCase | null = null;

function getUseCase(): GetDeliveryPersonUseCase {
  if (!useCase) {
    const prisma = getPrismaClient();
    const ordersClient = new OrdersServiceClient();
    const repository = new PrismaDeliveryPersonRepository(prisma, ordersClient);
    useCase = new GetDeliveryPersonUseCase(repository);
  }
  return useCase;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*' };

  try {
    const { id } = deliveryPersonIdSchema.parse({ id: event.pathParameters?.id });
    const result = await getUseCase().execute(id);

    return { statusCode: 200, headers, body: JSON.stringify(result.toJSON()) };
  } catch (error) {
    if (error instanceof AppError) return { statusCode: error.statusCode, headers, body: JSON.stringify(error.toJSON()) };
    if (error instanceof ZodError) return { statusCode: 400, headers, body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) } }) };
    console.error('Unhandled error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } }) };
  }
};