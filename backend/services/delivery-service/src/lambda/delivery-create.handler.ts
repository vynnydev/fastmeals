import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateDeliveryPersonUseCase } from '../application/use-cases/create-delivery-person.use-case';
import { PrismaDeliveryPersonRepository } from '../infrastructure/repositories/prisma-delivery-person.repository';
import { getPrismaClient } from '../infrastructure/database/prisma-client';
import { createDeliveryPersonSchema } from '../infrastructure/http/validators/delivery-person.validator';
import { AppError } from '../infrastructure/http/errors/app-error';
import { ZodError } from 'zod';

let useCase: CreateDeliveryPersonUseCase | null = null;

function getUseCase(): CreateDeliveryPersonUseCase {
  if (!useCase) {
    const prisma = getPrismaClient();
    const repository = new PrismaDeliveryPersonRepository(prisma);
    useCase = new CreateDeliveryPersonUseCase(repository);
  }
  return useCase;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*' };

  try {
    const body = JSON.parse(event.body || '{}');
    const validated = createDeliveryPersonSchema.parse(body);
    const result = await getUseCase().execute(validated);

    return { statusCode: 201, headers, body: JSON.stringify(result.toJSON()) };
  } catch (error) {
    if (error instanceof AppError) return { statusCode: error.statusCode, headers, body: JSON.stringify(error.toJSON()) };
    if (error instanceof ZodError) return { statusCode: 400, headers, body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) } }) };
    console.error('Unhandled error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } }) };
  }
};