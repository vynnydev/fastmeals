import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { OptimizeAssignmentUseCase } from '../application/use-cases/optimize-assignment.use-case';
import { OrdersServiceClient } from '../infrastructure/clients/orders-service.client';
import { DeliveryServiceClient } from '../infrastructure/clients/delivery-service.client';
import { AppError } from '../infrastructure/http/errors/app-error';

let useCase: OptimizeAssignmentUseCase | null = null;

function getUseCase(): OptimizeAssignmentUseCase {
  if (!useCase) {
    const ordersClient = new OrdersServiceClient();
    const deliveryClient = new DeliveryServiceClient();
    useCase = new OptimizeAssignmentUseCase(ordersClient, deliveryClient);
  }
  return useCase;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || 'http://localhost:3000' };

  try {
    const token = event.headers?.Authorization?.split(' ')[1] || event.headers?.authorization?.split(' ')[1] || '';

    const result = await getUseCase().execute(token);

    return { statusCode: 200, headers, body: JSON.stringify(result) };
  } catch (error) {
    if (error instanceof AppError) return { statusCode: error.statusCode, headers, body: JSON.stringify(error.toJSON()) };
    console.error('Unhandled error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno do servidor' } }) };
  }
};