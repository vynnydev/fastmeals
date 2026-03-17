import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IJwtService, TokenPayload } from '../interfaces/jwt-service.interface';
import { ITokenStore } from '../interfaces/token-store.interface';
import { RefreshTokenRequestDTO, RefreshTokenResponseDTO } from '../dtos/refresh-token.dto';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly tokenStore: ITokenStore,
  ) {}

  async execute(dto: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    let payload: TokenPayload;

    try {
      payload = this.jwtService.verifyRefreshToken(dto.refreshToken);
    } catch {
      throw AppError.unauthorized('INVALID_REFRESH_TOKEN', 'Refresh token inválido ou expirado');
    }

    const storedToken = await this.tokenStore.getRefreshToken(payload.userId);

    if (!storedToken || storedToken !== dto.refreshToken) {
      throw AppError.unauthorized('INVALID_REFRESH_TOKEN', 'Refresh token inválido ou expirado');
    }

    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw AppError.unauthorized('INVALID_REFRESH_TOKEN', 'Refresh token inválido ou expirado');
    }

    const newPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.generateAccessToken(newPayload);
    const refreshToken = this.jwtService.generateRefreshToken(newPayload);

    const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
    await this.tokenStore.storeRefreshToken(user.id, refreshToken, SEVEN_DAYS_IN_SECONDS);

    return {
      accessToken,
      refreshToken,
    };
  }
}