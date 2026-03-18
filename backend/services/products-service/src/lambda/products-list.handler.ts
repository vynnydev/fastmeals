import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ListProductsUseCase } from '../application/use-cases/list-products.use-case';
import { PrismaProductRepository } from '../infrastructure/repositories/prisma-product.repository';
import { getPrismaClient } from '../infrastructure/database/prisma-client';
import { listProductsQuerySchema } from '../infrastructure/http/validators/product.validator';
import { AppError } from '../infrastructure/http/errors/app-error';
import { ZodError } from 'zod';

let useCase: ListProductsUseCase | null = null;

function getUseCase(): ListProductsUseCase {
  if (!useCase) {
    const prisma = getPrismaClient();
    const repository = new PrismaProductRepository(prisma);
    useCase = new ListProductsUseCase(repository);
  }
  return useCase;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
  };

  try {
    const query = listProductsQuerySchema.parse(event.queryStringParameters || {});

    const result = await getUseCase().execute({
      page: query.page,
      limit: query.limit,
      search: query.search,
      category: query.category,
      isAvailable: query.isAvailable,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        data: result.data.map((product) => product.toJSON()),
        pagination: result.pagination,
      }),
    };
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