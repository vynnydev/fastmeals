import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RefreshTokenUseCase } from '../../src/application/use-cases/refresh-token.use-case';
import { IUserRepository } from '../../src/domain/repositories/user-repository.interface';
import { IJwtService, TokenPayload } from '../../src/application/interfaces/jwt-service.interface';
import { ITokenStore } from '../../src/application/interfaces/token-store.interface';
import { User, UserRole } from '../../src/domain/entities/user.entity';
import { AppError } from '../../src/infrastructure/http/errors/app-error';

describe('RefreshTokenUseCase', () => {
  let refreshTokenUseCase: RefreshTokenUseCase;
  let mockUserRepository: IUserRepository;
  let mockJwtService: IJwtService;
  let mockTokenStore: ITokenStore;

  const mockUser = new User({
    id: 'user-uuid-123',
    email: 'admin@fastmeals.com',
    password: 'hashed-password',
    role: UserRole.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const mockPayload: TokenPayload = {
    userId: 'user-uuid-123',
    email: 'admin@fastmeals.com',
    role: 'admin',
  };

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
    };

    mockJwtService = {
      generateAccessToken: vi.fn().mockReturnValue('new-access-token'),
      generateRefreshToken: vi.fn().mockReturnValue('new-refresh-token'),
      verifyAccessToken: vi.fn(),
      verifyRefreshToken: vi.fn(),
    };

    mockTokenStore = {
      storeRefreshToken: vi.fn().mockResolvedValue(undefined),
      getRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
    };

    refreshTokenUseCase = new RefreshTokenUseCase(
      mockUserRepository,
      mockJwtService,
      mockTokenStore,
    );
  });

  it('should return new token pair on valid refresh token', async () => {
    vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(mockPayload);
    vi.mocked(mockTokenStore.getRefreshToken).mockResolvedValue('valid-refresh-token');
    vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

    const result = await refreshTokenUseCase.execute({
      refreshToken: 'valid-refresh-token',
    });

    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    expect(mockTokenStore.storeRefreshToken).toHaveBeenCalledWith(
      'user-uuid-123',
      'new-refresh-token',
      604800,
    );
  });

  it('should throw INVALID_REFRESH_TOKEN when token verification fails', async () => {
    vi.mocked(mockJwtService.verifyRefreshToken).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await expect(
      refreshTokenUseCase.execute({
        refreshToken: 'invalid-token',
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  });

  it('should throw INVALID_REFRESH_TOKEN when token not found in store', async () => {
    vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(mockPayload);
    vi.mocked(mockTokenStore.getRefreshToken).mockResolvedValue(null);

    await expect(
      refreshTokenUseCase.execute({
        refreshToken: 'orphan-token',
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  });

  it('should throw INVALID_REFRESH_TOKEN when stored token does not match', async () => {
    vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(mockPayload);
    vi.mocked(mockTokenStore.getRefreshToken).mockResolvedValue('different-stored-token');

    await expect(
      refreshTokenUseCase.execute({
        refreshToken: 'mismatched-token',
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  });

  it('should throw INVALID_REFRESH_TOKEN when user no longer exists', async () => {
    vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(mockPayload);
    vi.mocked(mockTokenStore.getRefreshToken).mockResolvedValue('valid-refresh-token');
    vi.mocked(mockUserRepository.findById).mockResolvedValue(null);

    await expect(
      refreshTokenUseCase.execute({
        refreshToken: 'valid-refresh-token',
      }),
    ).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  });

  it('should rotate refresh token (old token replaced by new one)', async () => {
    vi.mocked(mockJwtService.verifyRefreshToken).mockReturnValue(mockPayload);
    vi.mocked(mockTokenStore.getRefreshToken).mockResolvedValue('old-refresh-token');
    vi.mocked(mockUserRepository.findById).mockResolvedValue(mockUser);

    await refreshTokenUseCase.execute({
      refreshToken: 'old-refresh-token',
    });

    expect(mockJwtService.generateRefreshToken).toHaveBeenCalledTimes(1);
    expect(mockTokenStore.storeRefreshToken).toHaveBeenCalledWith(
      'user-uuid-123',
      'new-refresh-token',
      604800,
    );
  });
});