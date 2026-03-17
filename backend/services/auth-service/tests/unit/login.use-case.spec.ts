import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginUseCase } from '../../src/application/use-cases/login.use-case';
import { IUserRepository } from '../../src/domain/repositories/user-repository.interface';
import { IJwtService, TokenPayload } from '../../src/application/interfaces/jwt-service.interface';
import { ITokenStore } from '../../src/application/interfaces/token-store.interface';
import { IPasswordHasher } from '../../src/application/interfaces/password-hasher.interface';
import { User, UserRole } from '../../src/domain/entities/user.entity';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
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

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    mockJwtService = {
      generateAccessToken: vi.fn().mockReturnValue('access-token-mock'),
      generateRefreshToken: vi.fn().mockReturnValue('refresh-token-mock'),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };

    mockTokenStore = {
      storeRefreshToken: vi.fn().mockResolvedValue(undefined),
      getRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
    };

    mockPasswordHasher = {
      hash: vi.fn(),
      compare: vi.fn(),
    };

    loginUseCase = new LoginUseCase(
      mockUserRepository,
      mockJwtService,
      mockTokenStore,
      mockPasswordHasher,
    );
  });

  it('should return tokens and user data on successful login', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);

    const result = await loginUseCase.execute({
      email: 'admin@fastmeals.com',
      password: 'Admin@123',
    });

    expect(result).toEqual({
      accessToken: 'access-token-mock',
      refreshToken: 'refresh-token-mock',
      user: {
        id: 'user-uuid-123',
        email: 'admin@fastmeals.com',
        role: 'admin',
      },
    });

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('admin@fastmeals.com');
    expect(mockPasswordHasher.compare).toHaveBeenCalledWith('Admin@123', 'hashed-password');
    expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith({
      userId: 'user-uuid-123',
      email: 'admin@fastmeals.com',
      role: 'admin',
    });
    expect(mockTokenStore.storeRefreshToken).toHaveBeenCalledWith(
      'user-uuid-123',
      'refresh-token-mock',
      604800, // 7 days in seconds
    );
  });

  it('should throw INVALID_CREDENTIALS when user is not found', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'nonexistent@fastmeals.com',
        password: 'Admin@123',
      }),
    ).rejects.toThrow(AppError);

    await expect(
      loginUseCase.execute({
        email: 'nonexistent@fastmeals.com',
        password: 'Admin@123',
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('should throw INVALID_CREDENTIALS when password is wrong', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(false);

    await expect(
      loginUseCase.execute({
        email: 'admin@fastmeals.com',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });

    expect(mockJwtService.generateAccessToken).not.toHaveBeenCalled();
    expect(mockTokenStore.storeRefreshToken).not.toHaveBeenCalled();
  });

  it('should generate both access and refresh tokens', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);

    await loginUseCase.execute({
      email: 'admin@fastmeals.com',
      password: 'Admin@123',
    });

    expect(mockJwtService.generateAccessToken).toHaveBeenCalledTimes(1);
    expect(mockJwtService.generateRefreshToken).toHaveBeenCalledTimes(1);
  });

  it('should store refresh token in token store with 7 days TTL', async () => {
    vi.mocked(mockUserRepository.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(mockPasswordHasher.compare).mockResolvedValue(true);

    await loginUseCase.execute({
      email: 'admin@fastmeals.com',
      password: 'Admin@123',
    });

    expect(mockTokenStore.storeRefreshToken).toHaveBeenCalledWith(
      'user-uuid-123',
      'refresh-token-mock',
      7 * 24 * 60 * 60,
    );
  });
});