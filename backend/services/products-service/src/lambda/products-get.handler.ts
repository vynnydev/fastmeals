import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetProductUseCase } from '../application/use-cases/get-product.use-case';
import { PrismaProductRepository } from '../infrastructure/repositories/prisma-product.repository';
import { getPrismaClient } from '../infrastructure/database/prisma-client';
import { productIdSchema } from '../infrastructure/http/validators/product.validator';
import { AppError } from '../infrastructure/http/errors/app-error';
import { ZodError } from 'zod';

let useCase: GetProductUseCase | null = null;

function getUseCase(): GetProductUseCase {
  if (!useCase) {
    const prisma = getPrismaClient();
    const repository = new PrismaProductRepository(prisma);
    useCase = new GetProductUseCase(repository);
  }
  return useCase;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000',
  };

  try {
    const { id } = productIdSchema.parse({ id: event.pathParameters?.id });

    const product = await getUseCase().execute(id);

    return { statusCode: 200, headers, body: JSON.stringify(product.toJSON()) };
  } catch (error) {
    if (error instanceof AppError) {
      return { statusCode: error.statusCode, headers, body: JSON.stringify(error.toJSON()) };
    }
    if (error instanceof ZodError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) },
        }),
      };
    }
    console.error('Unhandled error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } }) };
  }
};