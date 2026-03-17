import { IUserRepository } from '../../domain/repositories/user-repository.interface';
import { IJwtService, TokenPayload } from '../interfaces/jwt-service.interface';
import { ITokenStore } from '../interfaces/token-store.interface';
import { IPasswordHasher } from '../interfaces/password-hasher.interface';
import { LoginRequestDTO } from '../dtos/login-request.dto';
import { LoginResponseDTO } from '../dtos/login-response.dto';
import { AppError } from '../../infrastructure/http/errors/app-error';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
    private readonly tokenStore: ITokenStore,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async execute(dto: LoginRequestDTO): Promise<LoginResponseDTO> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw AppError.unauthorized('INVALID_CREDENTIALS', 'Email ou senha inválidos');
    }

    const isPasswordValid = await this.passwordHasher.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw AppError.unauthorized('INVALID_CREDENTIALS', 'Email ou senha inválidos');
    }

    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.generateAccessToken(tokenPayload);
    const refreshToken = this.jwtService.generateRefreshToken(tokenPayload);

    const SEVEN_DAYS_IN_SECONDS = 7 * 24 * 60 * 60;
    await this.tokenStore.storeRefreshToken(user.id, refreshToken, SEVEN_DAYS_IN_SECONDS);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}