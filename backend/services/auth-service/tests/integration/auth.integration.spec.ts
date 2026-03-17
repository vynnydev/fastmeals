import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { AuthController } from '../../src/infrastructure/http/controllers/auth.controller';
import { createAuthRoutes } from '../../src/infrastructure/http/routes/auth.routes';
import { errorHandler } from '../../src/infrastructure/http/errors/error-handler';
import { LoginUseCase } from '../../src/application/use-cases/login.use-case';
import { RefreshTokenUseCase } from '../../src/application/use-cases/refresh-token.use-case';
import { User, UserRole } from '../../src/domain/entities/user.entity';
import { IUserRepository } from '../../src/domain/repositories/user-repository.interface';
import { IJwtService } from '../../src/application/interfaces/jwt-service.interface';
import { ITokenStore } from '../../src/application/interfaces/token-store.interface';
import { IPasswordHasher } from '../../src/application/interfaces/password-hasher.interface';

describe('Auth Integration Tests', () => {
  let app: express.Express;
  let mockUserRepository: IUserRepository;
  let mockJwtService: IJwtService;
  let mockTokenStore: ITokenStore;
  let mockPasswordHasher: IPasswordHasher;

  const mockUser = new User({
    id: 'user-uuid-123',
    email: 'admin@fastmeals.com',
    password: 'hashed-password',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  beforeAll(() => {
    mockUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn().mockResolvedValue(mockUser),
    };

    mockJwtService = {
      generateAccessToken: vi.fn().mockReturnValue('mock-access-token'),
      generateRefreshToken: vi.fn().mockReturnValue('mock-refresh-token'),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn().mockReturnValue({
        userId: 'user-uuid-123',
        email: 'admin@fastmeals.com',
        role: 'admin',
      }),
    };

    mockTokenStore = {
      storeRefreshToken: vi.fn().mockResolvedValue(undefined),
      getRefreshToken: vi.fn().mockResolvedValue('mock-refresh-token'),
      revokeRefreshToken: vi.fn(),
    };

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn().mockResolvedValue(true),
    };

    const loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockJwtService,
      mockTokenStore,
      mockPasswordHasher,
    );

    const refreshTokenUseCase = new RefreshTokenUseCase(
      mockUserRepository,
      mockJwtService,
      mockTokenStore,
    );

    const authController = new AuthController(loginUseCase, refreshTokenUseCase);

    app = express();
    app.use(express.json());
    app.use('/api/auth', createAuthRoutes(authController));
    app.use(errorHandler);
  });

  describe('POST /api/auth/login', () => {
    it('should return 200 with tokens on valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@fastmeals.com',
          password: 'Admin@123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('admin@fastmeals.com');
      expect(response.body.user.role).toBe('admin');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 on invalid credentials', async () => {
      vi.mocked(mockPasswordHasher.compare).mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@fastmeals.com',
          password: 'wrong-password',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 400 on invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Admin@123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Admin@123',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@fastmeals.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 200 with new token pair on valid refresh token', async () => {
      vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'mock-refresh-token',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('should return 400 when refresh token is missing', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 401 when refresh token is invalid', async () => {
      vi.mocked(mockJwtService.verifyRefreshToken).mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
    });
  });
});