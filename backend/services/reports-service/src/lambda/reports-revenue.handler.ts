import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetRevenueUseCase } from '../application/use-cases/get-revenue.use-case';
import { PrismaReportRepository } from '../infrastructure/repositories/prisma-report.repository';
import { getPrismaClient } from '../infrastructure/database/prisma-client';
import { revenueQuerySchema } from '../infrastructure/http/validators/report.validator';
import { AppError } from '../infrastructure/http/errors/app-error';
import { ZodError } from 'zod';

let useCase: GetRevenueUseCase | null = null;

function getUseCase(): GetRevenueUseCase {
  if (!useCase) {
    const prisma = getPrismaClient();
    const repository = new PrismaReportRepository(prisma);
    useCase = new GetRevenueUseCase(repository);
  }
  return useCase;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*' };

  try {
    const query = revenueQuerySchema.parse(event.queryStringParameters || {});
    const result = await getUseCase().execute(query);

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    if (error instanceof AppError) return { statusCode: error.statusCode, headers, body: JSON.stringify(error.toJSON()) };
    if (error instanceof ZodError) return { statusCode: 400, headers, body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) } }) };
    return { statusCode: 500, headers, body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } }) };
  }
};