import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteProductUseCase } from '../application/use-cases/delete-product.use-case';
import { PrismaProductRepository } from '../infrastructure/repositories/prisma-product.repository';
import { getPrismaClient } from '../infrastructure/database/prisma-client';
import { productIdSchema } from '../infrastructure/http/validators/product.validator';
import { AppError } from '../infrastructure/http/errors/app-error';
import { ZodError } from 'zod';

let useCase: DeleteProductUseCase | null = null;

function getUseCase(): DeleteProductUseCase {
  if (!useCase) {
    const prisma = getPrismaClient();
    const repository = new PrismaProductRepository(prisma);
    useCase = new DeleteProductUseCase(repository);
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

    await getUseCase().execute(id);

    return { statusCode: 204, headers, body: '' };
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