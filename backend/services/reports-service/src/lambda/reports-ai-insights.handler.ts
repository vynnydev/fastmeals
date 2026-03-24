import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetAIInsightsUseCase } from '../application/use-cases/get-ai-insights.use-case';
import { PrismaReportRepository } from '../infrastructure/repositories/prisma-report.repository';
import { BedrockAIService } from '../infrastructure/services/bedrock-ai.service';
import { getPrismaClient } from '../infrastructure/database/prisma-client';
import { aiInsightsQuerySchema } from '../infrastructure/http/validators/report.validator';
import { AppError } from '../infrastructure/http/errors/app-error';
import { ZodError } from 'zod';

let useCase: GetAIInsightsUseCase | null = null;

function getUseCase(): GetAIInsightsUseCase {
  if (!useCase) {
    const prisma = getPrismaClient();
    const repository = new PrismaReportRepository(prisma);
    const aiService = new BedrockAIService();
    useCase = new GetAIInsightsUseCase(repository, aiService);
  }
  return useCase;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000' };

  try {
    const query = aiInsightsQuerySchema.parse(event.queryStringParameters || {});
    const result = await getUseCase().execute(query);

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    if (error instanceof AppError) return { statusCode: error.statusCode, headers, body: JSON.stringify(error.toJSON()) };
    if (error instanceof ZodError) return { statusCode: 400, headers, body: JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos', details: error.errors.map((e) => ({ field: e.path.join('.'), message: e.message })) } }) };
    return { statusCode: 500, headers, body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno' } }) };
  }
};