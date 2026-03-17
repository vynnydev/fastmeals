import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { PrismaUserRepository } from '../infrastructure/repositories/prisma-user.repository';
import { JwtService } from '../infrastructure/services/jwt.service';
import { BcryptService } from '../infrastructure/services/bcrypt.service';
import { RedisTokenStoreService } from '../infrastructure/services/redis-token-store.service';
import { getPrismaClient } from '../infrastructure/database/prisma-client';
import { loginSchema } from '../infrastructure/http/validators/auth.validator';
import { AppError } from '../infrastructure/http/errors/app-error';
import { ZodError } from 'zod';

let loginUseCase: LoginUseCase | null = null;

function getLoginUseCase(): LoginUseCase {
  if (!loginUseCase) {
    const prisma = getPrismaClient();
    const userRepository = new PrismaUserRepository(prisma);
    const jwtService = new JwtService();
    const bcryptService = new BcryptService();
    const redisTokenStore = new RedisTokenStoreService(process.env.REDIS_URL || '');

    loginUseCase = new LoginUseCase(userRepository, jwtService, redisTokenStore, bcryptService);
  }

  return loginUseCase;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const body = JSON.parse(event.body || '{}');
    const validated = loginSchema.parse(body);

    const useCase = getLoginUseCase();
    const result = await useCase.execute({
      email: validated.email,
      password: validated.password,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        statusCode: error.statusCode,
        headers,
        body: JSON.stringify(error.toJSON()),
      };
    }

    if (error instanceof ZodError) {
      const details = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dados inválidos',
            details,
          },
        }),
      };
    }

    console.error('Unhandled error in auth-login Lambda:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erro interno do servidor',
        },
      }),
    };
  }
};