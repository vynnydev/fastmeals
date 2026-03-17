import { getPrismaClient } from '../database/prisma-client';
import { PrismaUserRepository } from '../repositories/prisma-user.repository';
import { JwtService } from '../services/jwt.service';
import { BcryptService } from '../services/bcrypt.service';
import { RedisTokenStoreService } from '../services/redis-token-store.service';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { AuthController } from '../http/controllers/auth.controller';
import { env } from '../config/env';

export interface Container {
  authController: AuthController;
  redisTokenStore: RedisTokenStoreService;
}

export function createContainer(): Container {
  // Database
  const prisma = getPrismaClient();

  // Repositories (implements domain interfaces)
  const userRepository = new PrismaUserRepository(prisma);

  // Services (implements application interfaces)
  const jwtService = new JwtService();
  const bcryptService = new BcryptService();
  const redisTokenStore = new RedisTokenStoreService(env.REDIS_URL);

  // Use Cases (depends on interfaces, receives implementations)
  const loginUseCase = new LoginUseCase(
    userRepository,
    jwtService,
    redisTokenStore,
    bcryptService,
  );

  const refreshTokenUseCase = new RefreshTokenUseCase(
    userRepository,
    jwtService,
    redisTokenStore,
  );

  // Controllers
  const authController = new AuthController(loginUseCase, refreshTokenUseCase);

  return {
    authController,
    redisTokenStore,
  };
}